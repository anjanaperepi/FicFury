/**
 * ============================================================
 * Delegate Drawer Module
 * Shared by Admin & Chair
 * ============================================================
 */

function viewDelegate(id) {

    const delegate = DelegateApp.delegates.find(

        d => d.id === id

    );

    if (!delegate)
        return;

    DelegateApp.selectedDelegate = delegate;

    renderDrawer(delegate);

    DOM.drawer.classList.add("open");

}
function closeDrawer() {

    if (!DOM.drawer)
        return;

    DOM.drawer.classList.remove("open");

    DelegateApp.selectedDelegate = null;

}
function renderDrawer(delegate) {

    const container = document.getElementById(

        "drawerContent"

    );

    if (!container)
        return;

    drawerContent.innerHTML = `

<div class="drawer-profile">

    <div class="drawer-avatar">

        ${delegate.user.fullName.charAt(0)}

    </div>

    <div class="drawer-name">

        ${delegate.user.fullName}

    </div>

    <div class="drawer-email">

        ${delegate.user.email}

    </div>

</div>

<div class="drawer-section">

    <div class="drawer-section-title">

        Committee

    </div>

    <div class="drawer-section-value">

        ${delegate.committee.name}

    </div>

</div>

<div class="drawer-section">

    <div class="drawer-section-title">

        Character

    </div>

    <div class="drawer-section-value">

        ${delegate.character.name}

    </div>

</div>

<div class="drawer-section">

    <div class="drawer-section-title">

        Workflow

    </div>

    <div class="drawer-section-value">

        ${renderWorkflowBadge(delegate.workflowStatus)}

    </div>

</div>

<div class="drawer-section">

    <div class="drawer-section-title">

        Reviews

    </div>

    <div>

        Chair :
        ${renderApprovalBadge(delegate.chairApproval)}

        <br><br>

        Admin :
        ${renderApprovalBadge(delegate.adminApproval)}

    </div>

</div>

<div class="drawer-section">

    <div class="drawer-section-title">

        Notes

    </div>

    <div>

        ${delegate.rejectionReason || "No notes available."}

    </div>

</div>

<div class="drawer-actions">

    <button
        class="btn btn-danger">

        Reject

    </button>

    <button
        class="btn btn-success">

        Approve

    </button>

</div>

`;
}
function buildInfoRow(label, value) {

    return `

        <div class="drawer-row">

            <label>

                ${label}

            </label>

            <div>

                ${value ?? "-"}

            </div>

        </div>

    `;

}
function formatDate(date) {

    if (!date)
        return "-";

    return new Date(date)

        .toLocaleString(

            "en-IN",

            {

                dateStyle: "medium",

                timeStyle: "short"

            }

        );

}