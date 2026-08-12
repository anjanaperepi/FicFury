/**
 * Admin delegate-management page controller.
 * Requires the API service scripts loaded by admin-delegate-management.html.
 */
(() => {
    "use strict";

    const state = {
        delegates: [],
        committees: [],
        characters: [],
        filtered: [],
        selected: null,
        currentPage: 1,
        pageSize: 10
    };

    const elements = {};

    document.addEventListener("DOMContentLoaded", initialize);

    async function initialize() {
        cacheElements();
        bindEvents();

        try {
            await Promise.all([loadReferenceData(), loadDelegates()]);
        } catch (error) {
            reportError(error);
        }
    }

    function cacheElements() {
        [
            "delegateSearch", "committeeFilter", "characterFilter", "statusFilter",
            "chairReviewFilter", "adminReviewFilter", "delegateTableBody", "pagination",
            "delegateDrawer", "drawerOverlay", "drawerContent", "delegateModal",
            "delegateForm", "editCommittee", "editCharacter", "editWorkflow"
        ].forEach(id => elements[id] = document.getElementById(id));

        elements.total = document.getElementById("totalDelegates");
        elements.pending = document.getElementById("pendingDelegates");
        elements.approved = document.getElementById("approvedDelegates");
        elements.rejected = document.getElementById("rejectedDelegates");
    }

    function bindEvents() {
        [
            "delegateSearch", "committeeFilter", "characterFilter", "statusFilter",
            "chairReviewFilter", "adminReviewFilter"
        ].forEach(id => {
            elements[id]?.addEventListener("input", applyFilters);
            elements[id]?.addEventListener("change", applyFilters);
        });

        elements.delegateForm?.addEventListener("submit", saveDelegate);
        document.getElementById("cancelEdit")?.addEventListener("click", closeModal);
        document.getElementById("closeDrawer")?.addEventListener("click", closeDrawer);
        elements.drawerOverlay?.addEventListener("click", closeDrawer);
        document.getElementById("addDelegateBtn")?.addEventListener("click", explainRegistrationCreation);
    }

    async function loadReferenceData() {
        const [committees, characters] = await Promise.all([
            CommitteeAPI.getAll(),
            CharacterAPI.getAll()
        ]);

        state.committees = committees || [];
        state.characters = characters || [];
        populateSelect(elements.committeeFilter, state.committees, "All Committees");
        populateSelect(elements.characterFilter, state.characters, "All Characters");
        populateSelect(elements.editCommittee, state.committees, "Select a committee");
        populateSelect(elements.editCharacter, state.characters, "Select a character");
    }

    async function loadDelegates() {
        state.delegates = (await DelegateAPI.getAll()) || [];
        applyFilters();
    }

    function populateSelect(select, items, placeholder) {
        if (!select) return;

        select.replaceChildren(new Option(placeholder, ""));
        items.forEach(item => select.add(new Option(item.name || item.title || "Unnamed", item.id)));
    }

    function applyFilters() {
        const search = elements.delegateSearch?.value.trim().toLowerCase() || "";
        const committeeId = elements.committeeFilter?.value || "";
        const characterId = elements.characterFilter?.value || "";
        const workflow = elements.statusFilter?.value || "";
        const chairReview = elements.chairReviewFilter?.value || "";
        const adminReview = elements.adminReviewFilter?.value || "";

        state.filtered = state.delegates.filter(delegate => {
            const searchText = [
                delegate.user?.fullName, delegate.user?.email,
                delegate.committee?.name, delegate.character?.name, delegate.character?.title
            ].filter(Boolean).join(" ").toLowerCase();

            return (!search || searchText.includes(search))
                && (!committeeId || String(delegate.committee?.id) === committeeId)
                && (!characterId || String(delegate.character?.id) === characterId)
                && (!workflow || delegate.workflowStatus === workflow)
                && (!chairReview || delegate.chairApproval === chairReview)
                && (!adminReview || delegate.adminApproval === adminReview);
        });

        state.currentPage = 1;
        render();
    }

    function render() {
        renderStatistics();
        renderTable();
        renderPagination();
    }

    function renderStatistics() {
        const total = state.delegates.length;
        const pending = state.delegates.filter(d =>
            d.workflowStatus === "PENDING_ADMIN" || d.workflowStatus === "PENDING_CHAIR"
        ).length;
        const approved = state.delegates.filter(d =>
            d.workflowStatus === "ACTIVE" || d.workflowStatus === "COMPLETED"
        ).length;
        const rejected = state.delegates.filter(d => d.workflowStatus === "REJECTED").length;

        if (elements.total) elements.total.textContent = total;
        if (elements.pending) elements.pending.textContent = pending;
        if (elements.approved) elements.approved.textContent = approved;
        if (elements.rejected) elements.rejected.textContent = rejected;
    }

    function renderTable() {
        if (!elements.delegateTableBody) return;

        const start = (state.currentPage - 1) * state.pageSize;
        const rows = state.filtered.slice(start, start + state.pageSize);

        if (!rows.length) {
            elements.delegateTableBody.innerHTML = '<tr><td colspan="7">No delegates match the current filters.</td></tr>';
            return;
        }

        elements.delegateTableBody.replaceChildren(...rows.map(createRow));
    }

    function createRow(delegate) {
        const row = document.createElement("tr");
        // A registration needs admin review until it is explicitly approved
        // or rejected. This also supports older rows where adminApproval is
        // absent or the workflow has already advanced to PENDING_CHAIR.
        const canReview = !["APPROVED", "REJECTED"].includes(
            delegate.adminApproval
        ) && delegate.workflowStatus !== "REJECTED";

        row.innerHTML = `
            <td><strong>${escapeHtml(delegate.user?.fullName || "-")}</strong><br><small>${escapeHtml(delegate.user?.email || "-")}</small></td>
            <td>${escapeHtml(delegate.committee?.name || "-")}</td>
            <td>${escapeHtml(delegate.character?.name || delegate.character?.title || "-")}</td>
            <td>${badge(delegate.workflowStatus)}</td>
            <td>${badge(delegate.chairApproval)}</td>
            <td>${badge(delegate.adminApproval)}</td>
            <td class="actions"></td>`;

        const actions = row.lastElementChild;
        actions.append(
            button("View", "btn btn-secondary", () => openDrawer(delegate)),
            button("Edit", "btn btn-secondary", () => openEditModal(delegate))
        );
        if (canReview) {
            actions.append(
                button("Approve", "btn btn-success", () => reviewDelegate(delegate.id, true)),
                button("Reject", "btn btn-danger", () => reviewDelegate(delegate.id, false))
            );
        }
        actions.append(button("Delete", "btn btn-danger", () => deleteDelegate(delegate.id)));
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

        elements.pagination.append(
            button("Previous", "btn btn-secondary", () => changePage(state.currentPage - 1))
        );
        const pageLabel = document.createElement("span");
        pageLabel.textContent = `Page ${state.currentPage} of ${pageCount}`;
        elements.pagination.append(pageLabel);
        elements.pagination.append(
            button("Next", "btn btn-secondary", () => changePage(state.currentPage + 1))
        );
    }

    function changePage(page) {
        const pageCount = Math.ceil(state.filtered.length / state.pageSize);
        state.currentPage = Math.min(Math.max(page, 1), pageCount);
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
            <p><strong>Chair review:</strong> ${escapeHtml(delegate.chairApproval || "-")}</p>
            <p><strong>Admin review:</strong> ${escapeHtml(delegate.adminApproval || "-")}</p>
            <p><strong>Rejection reason:</strong> ${escapeHtml(delegate.rejectionReason || "None")}</p>`;
        elements.delegateDrawer.classList.add("open");
        elements.drawerOverlay?.classList.add("show");
    }

    function closeDrawer() {
        elements.delegateDrawer?.classList.remove("open");
        elements.drawerOverlay?.classList.remove("show");
    }

    function openEditModal(delegate) {
        state.selected = delegate;
        elements.editCommittee.value = delegate.committee?.id || "";
        elements.editCharacter.value = delegate.character?.id || "";
        elements.editWorkflow.value = delegate.workflowStatus || "PENDING_ADMIN";
        elements.delegateModal?.classList.remove("hidden");
    }

    function closeModal() {
        elements.delegateModal?.classList.add("hidden");
        state.selected = null;
    }

    async function saveDelegate(event) {
        event.preventDefault();
        if (!state.selected) return;

        const committeeId = Number(elements.editCommittee.value);
        const characterId = Number(elements.editCharacter.value);
        if (!committeeId || !characterId) {
            showToast("Select both a committee and character.", "error");
            return;
        }

        try {
            await DelegateAPI.update(state.selected.id, {
                committee: { id: committeeId },
                character: { id: characterId },
                workflowStatus: elements.editWorkflow.value
            });
            closeModal();
            showToast("Delegate registration updated.", "success");
            await loadDelegates();
        } catch (error) {
            reportError(error);
        }
    }

    async function reviewDelegate(id, approved) {
        let reason;
        if (!approved) {
            reason = window.prompt("Enter a rejection reason:");
            if (!reason?.trim()) return;
        }

        try {
            if (approved) await DelegateAPI.adminApprove(id);
            else await DelegateAPI.adminReject(id, reason.trim());
            showToast(`Registration ${approved ? "approved" : "rejected"}.`, "success");
            await loadDelegates();
        } catch (error) {
            reportError(error);
        }
    }

    async function deleteDelegate(id) {
        if (!window.confirm("Delete this delegate registration? This cannot be undone.")) return;
        try {
            await DelegateAPI.remove(id);
            showToast("Delegate registration deleted.", "success");
            await loadDelegates();
        } catch (error) {
            reportError(error);
        }
    }

    function explainRegistrationCreation() {
        showToast("Delegates create their own registrations from the registration page.", "info");
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
