/**
 * ============================================================
 * Delegate Table
 * Shared Table Rendering
 * Admin and Chair inject their own action buttons.
 * ============================================================
 */

function renderTable() {

    if (!DOM.tableBody)
        return;

    DOM.tableBody.innerHTML = "";

    toggleEmptyState();

    const delegates = getCurrentPageData();

    delegates.forEach(delegate => {

        DOM.tableBody.appendChild(

            createDelegateRow(delegate)

        );

    });

}
function createDelegateRow(delegate) {

    const tr = document.createElement("tr");

    tr.innerHTML = `

        <td>

            <div class="delegate-info">

                <div class="delegate-avatar">

                    ${getInitials(delegate.user?.fullName)}

                </div>

                <div>

                    <div class="delegate-name">

                        ${delegate.user?.fullName ?? "-"}

                    </div>

                    <div class="delegate-email">

                        ${delegate.user?.email ?? "-"}

                    </div>

                </div>

            </div>

        </td>

        <td>

            ${delegate.committee?.name ?? "-"}

        </td>

        <td>

            ${delegate.character?.name ?? "-"}

        </td>

        <td>

            ${renderWorkflowBadge(delegate.workflowStatus)}

        </td>

        <td>

            ${renderApprovalBadge(delegate.chairApproval)}

        </td>

        <td>

            ${renderApprovalBadge(delegate.adminApproval)}

        </td>

        <td>

            ${createActionButtons(delegate)}

        </td>

    `;

    return tr;

}
function renderWorkflowBadge(status) {

    const css = {

        "PENDING_ADMIN": "badge-warning",

        "PENDING_CHAIR": "badge-warning",

        "ACTIVE": "badge-success",

        "COMPLETED": "badge-primary",

        "REJECTED": "badge-danger"

    };

    return `

        <span class="badge ${css[status] || "badge-secondary"}">

            ${status}

        </span>

    `;

}
function renderApprovalBadge(status) {

    const css = {

        APPROVED: "badge-success",

        REJECTED: "badge-danger",

        PENDING: "badge-warning"

    };

    return `

        <span class="badge ${css[status] || "badge-secondary"}">

            ${status ?? "-"}

        </span>

    `;

}
function createActionButtons() {

    console.warn(

        "createActionButtons() not implemented."

    );

    return "";

}
function toggleEmptyState() {

    if (!DOM.emptyState)
        return;

    DOM.emptyState.classList.toggle(

        "hidden",

        DelegateApp.filteredDelegates.length > 0

    );

}
function refreshTable() {

    renderStatistics();

    renderTable();

    renderPagination();

}