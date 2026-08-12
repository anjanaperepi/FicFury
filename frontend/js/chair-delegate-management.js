/**
 * Chair delegate-management page controller.
 * Chairs can review only registrations assigned to their committee and pending chair review.
 */
(() => {
    "use strict";

    const state = { delegates: [], filtered: [], page: 1, pageSize: 10 };
    const elements = {};

    document.addEventListener("DOMContentLoaded", initialize);

    async function initialize() {
        cacheElements();
        bindEvents();

        try {
            state.delegates = (await DelegateAPI.getChairDelegates()) || [];
            applyFilters();
        } catch (error) {
            reportError(error);
        }
    }

    function cacheElements() {
        [
            "delegateSearch", "committeeFilter", "characterFilter", "statusFilter",
            "delegateTableBody", "pagination", "emptyState", "delegateDrawer",
            "drawerOverlay", "drawerContent"
        ].forEach(id => elements[id] = document.getElementById(id));

        elements.total = document.getElementById("totalDelegates");
        elements.pending = document.getElementById("pendingDelegates");
        elements.approved = document.getElementById("approvedDelegates");
        elements.rejected = document.getElementById("rejectedDelegates");
    }

    function bindEvents() {
        ["delegateSearch", "committeeFilter", "characterFilter", "statusFilter"].forEach(id => {
            elements[id]?.addEventListener("input", applyFilters);
            elements[id]?.addEventListener("change", applyFilters);
        });
        document.getElementById("closeDrawer")?.addEventListener("click", closeDrawer);
        elements.drawerOverlay?.addEventListener("click", closeDrawer);
    }

    function applyFilters() {
        const search = elements.delegateSearch?.value.trim().toLowerCase() || "";
        const committeeId = elements.committeeFilter?.value || "";
        const characterId = elements.characterFilter?.value || "";
        const workflow = elements.statusFilter?.value || "";

        state.filtered = state.delegates.filter(delegate => {
            const text = [
                delegate.user?.fullName, delegate.user?.email, delegate.committee?.name,
                delegate.character?.name, delegate.character?.title
            ].filter(Boolean).join(" ").toLowerCase();

            return (!search || text.includes(search))
                && (!committeeId || String(delegate.committee?.id) === committeeId)
                && (!characterId || String(delegate.character?.id) === characterId)
                && (!workflow || delegate.workflowStatus === workflow);
        });

        state.page = 1;
        render();
    }

    function render() {
        renderStatistics();
        renderTable();
        renderPagination();
    }

    function renderStatistics() {
        if (elements.total) elements.total.textContent = state.delegates.length;
        if (elements.pending) elements.pending.textContent = state.delegates.filter(
            d => d.workflowStatus === "PENDING_CHAIR"
        ).length;
        if (elements.approved) elements.approved.textContent = state.delegates.filter(
            d => d.workflowStatus === "ACTIVE" || d.workflowStatus === "COMPLETED"
        ).length;
        if (elements.rejected) elements.rejected.textContent = state.delegates.filter(
            d => d.workflowStatus === "REJECTED"
        ).length;
    }

    function renderTable() {
        if (!elements.delegateTableBody) return;

        const start = (state.page - 1) * state.pageSize;
        const pageDelegates = state.filtered.slice(start, start + state.pageSize);
        elements.delegateTableBody.replaceChildren(...pageDelegates.map(createRow));
        elements.emptyState?.classList.toggle("hidden", pageDelegates.length > 0);
    }

    function createRow(delegate) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><strong>${escapeHtml(delegate.user?.fullName || "-")}</strong><br><small>${escapeHtml(delegate.user?.email || "-")}</small></td>
            <td>${escapeHtml(delegate.committee?.name || "-")}</td>
            <td>${escapeHtml(delegate.character?.name || delegate.character?.title || "-")}</td>
            <td>${badge(delegate.workflowStatus)}</td>
            <td>${badge(delegate.chairApproval)}</td>
            <td>${badge(delegate.adminApproval)}</td>
            <td class="actions"></td>`;

        const actions = row.lastElementChild;
        actions.append(button("View", "btn btn-secondary", () => openDrawer(delegate)));
        if (
            delegate.workflowStatus === "PENDING_CHAIR"
            && delegate.adminApproval === "APPROVED"
        ) {
            actions.append(
                button("Approve", "btn btn-success", () => reviewDelegate(delegate.id, true)),
                button("Reject", "btn btn-danger", () => reviewDelegate(delegate.id, false))
            );
        }
        return row;
    }

    function badge(value) {
        return `<span class="badge">${escapeHtml(value || "-")}</span>`;
    }

    function button(label, className, action) {
        const control = document.createElement("button");
        control.type = "button";
        control.className = className;
        control.textContent = label;
        control.addEventListener("click", action);
        return control;
    }

    function renderPagination() {
        if (!elements.pagination) return;

        const pageCount = Math.ceil(state.filtered.length / state.pageSize);
        elements.pagination.replaceChildren();
        if (pageCount < 2) return;

        elements.pagination.append(button("Previous", "btn btn-secondary", () => changePage(state.page - 1)));
        const label = document.createElement("span");
        label.textContent = `Page ${state.page} of ${pageCount}`;
        elements.pagination.append(label);
        elements.pagination.append(button("Next", "btn btn-secondary", () => changePage(state.page + 1)));
    }

    function changePage(page) {
        const pageCount = Math.ceil(state.filtered.length / state.pageSize);
        state.page = Math.min(Math.max(page, 1), pageCount);
        renderTable();
        renderPagination();
    }

    function openDrawer(delegate) {
        if (!elements.drawerContent || !elements.delegateDrawer) return;
        elements.drawerContent.innerHTML = `
            <h3>${escapeHtml(delegate.user?.fullName || "Delegate")}</h3>
            <p>${escapeHtml(delegate.user?.email || "-")}</p>
            <p><strong>Committee:</strong> ${escapeHtml(delegate.committee?.name || "-")}</p>
            <p><strong>Character:</strong> ${escapeHtml(delegate.character?.name || delegate.character?.title || "-")}</p>
            <p><strong>Workflow:</strong> ${escapeHtml(delegate.workflowStatus || "-")}</p>
            <p><strong>Admin review:</strong> ${escapeHtml(delegate.adminApproval || "-")}</p>
            <p><strong>Chair review:</strong> ${escapeHtml(delegate.chairApproval || "-")}</p>
            <p><strong>Rejection reason:</strong> ${escapeHtml(delegate.rejectionReason || "None")}</p>`;
        elements.delegateDrawer.classList.add("open");
        elements.drawerOverlay?.classList.add("show");
    }

    function closeDrawer() {
        elements.delegateDrawer?.classList.remove("open");
        elements.drawerOverlay?.classList.remove("show");
    }

    async function reviewDelegate(id, approved) {
        let reason;
        if (!approved) {
            reason = window.prompt("Enter a rejection reason:");
            if (!reason?.trim()) return;
        }

        try {
            if (approved) await DelegateAPI.chairApprove(id);
            else await DelegateAPI.chairReject(id, reason.trim());
            showToast(`Registration ${approved ? "approved" : "rejected"}.`, "success");
            state.delegates = (await DelegateAPI.getChairDelegates()) || [];
            applyFilters();
        } catch (error) {
            reportError(error);
        }
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>'"]/g, character => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", "\"": "&quot;"
        })[character]);
    }

    function reportError(error) {
        console.error(error);
        showToast(error?.message || "Unable to complete the request.", "error");
    }
})();
