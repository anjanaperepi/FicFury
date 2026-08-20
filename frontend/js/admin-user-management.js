let users = [];
let filteredUsers = [];

const ROWS_PER_PAGE = 10;
let currentPage = 1;

document.addEventListener("DOMContentLoaded", init);

async function init() {
    registerEvents();
    await loadUsers();
    await updateRequestCount();
}

function registerEvents() {

    document
        .getElementById("searchInput")
        .addEventListener("input", applyFilters);

    document
        .getElementById("roleFilter")
        .addEventListener("change", applyFilters);

    document
        .getElementById("statusFilter")
        .addEventListener("change", applyFilters);

    document
        .getElementById("resetFilters")
        .addEventListener("click", resetFilters);
    document
    .getElementById("closeModal")
    .addEventListener("click", closeModal);

        document.getElementById("confirmDelete")
    .addEventListener("click", confirmDelete);

document.getElementById("cancelDelete")
    .addEventListener("click", () => {

        document.getElementById("deleteModal")
            .classList.add("hidden");

        userToDelete = null;

    });

    document
    .getElementById("usersTab")
    .addEventListener(
        "click",
        () => switchManagementTab("users")
    );


document
    .getElementById("requestsTab")
    .addEventListener(
        "click",
        () => switchManagementTab("requests")
    );


document
    .querySelectorAll(".request-filter")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(".request-filter")
                    .forEach(btn =>
                        btn.classList.remove("active")
                    );

                button.classList.add("active");

const type =
    button.dataset.requestType;


if (type === "chair") {

    loadChairProposals();

} else if (type === "character") {

    loadCharacterChangeRequests();

} else if (type === "withdrawal") {

    loadWithdrawalRequests();

} else {

    loadAllRequests();

}
            }
        );

    });
}

async function loadUsers() {

    showLoader();

    try {

        users = await apiRequest("/admin/users");

        filteredUsers = [...users];

        renderUsers();

        updateStatistics();

    } catch (error) {

        console.error(error);

        showError("Unable to load users.");

    } finally {

        hideLoader();

    }

}

function renderUsers() {

    const tbody = document.getElementById("userTableBody");

    tbody.innerHTML = "";

    if (!filteredUsers.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    No users found.
                </td>
            </tr>
        `;

        return;
    }

    const start = (currentPage - 1) * ROWS_PER_PAGE;
const end = start + ROWS_PER_PAGE;

const pageUsers = filteredUsers.slice(start, end);

pageUsers.forEach(user => {

        tbody.innerHTML += `
            <tr>

                <td>

                    <strong>${user.fullName}</strong><br>

                    <small>@${user.username}</small>

                </td>

                <td>${user.email}</td>

<td>

    <select
        class="role-select"
        onchange="changeRole(${user.id}, this.value)">

        <option value="ADMIN"
            ${user.role === "ADMIN" ? "selected" : ""}>
            Admin
        </option>

        <option value="CHAIR"
            ${user.role === "CHAIR" ? "selected" : ""}>
            Chair
        </option>

        <option value="DELEGATE"
            ${user.role === "DELEGATE" ? "selected" : ""}>
            Delegate
        </option>

    </select>

</td>

<td>

    <select
        class="status-select"
        onchange="changeStatus(${user.id}, this.value)">

        <option value="ACTIVE"
            ${user.status === "ACTIVE" ? "selected" : ""}>
            Active
        </option>

        <option value="INACTIVE"
            ${user.status === "INACTIVE" ? "selected" : ""}>
            Inactive
        </option>

    </select>

</td>

                

                <td>
<button class="action-btn view-btn" onclick="viewUser(${user.id})">
    <i class="fa-solid fa-eye"></i>
</button>

                    <button onclick="editUser(${user.id})">

                        <i class="fa-solid fa-pen"></i>

                    </button>

                    <button onclick="deleteUser(${user.id})">

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </td>

            </tr>
        `;

    });

    renderPagination();
    window.addEventListener("click", function (e) {

    const modal = document.getElementById("userModal");

    if (e.target === modal) {

        closeModal();

    }

});

}
function updateStatistics() {

    document.getElementById("totalUsers").textContent =
        users.length;

    document.getElementById("delegateCount").textContent =
        users.filter(u => u.role === "DELEGATE").length;

    document.getElementById("chairCount").textContent =
        users.filter(u => u.role === "CHAIR").length;

    document.getElementById("adminCount").textContent =
        users.filter(u => u.role === "ADMIN").length;

    document.getElementById("inactiveCount").textContent =
        users.filter(u => u.status === "INACTIVE").length;


        window.addEventListener("click", function (e) {

    const modal = document.getElementById("userModal");

    if (e.target === modal) {

        closeModal();

    }

});

}

function applyFilters() {

    const search = document
        .getElementById("searchInput")
        .value
        .toLowerCase();

    const role = document
        .getElementById("roleFilter")
        .value;

    const status = document
        .getElementById("statusFilter")
        .value;

    filteredUsers = users.filter(user => {

        const matchesSearch =

            user.fullName.toLowerCase().includes(search) ||

            user.username.toLowerCase().includes(search) ||

            user.email.toLowerCase().includes(search);

        const matchesRole =

            !role || user.role === role;

        const matchesStatus =

            !status || user.status === status;

        return matchesSearch &&
               matchesRole &&
               matchesStatus;

    });
    currentPage = 1;
    renderUsers();
    window.addEventListener("click", function (e) {

    const modal = document.getElementById("userModal");

    if (e.target === modal) {

        closeModal();

    }

});

}
function resetFilters() {

    document.getElementById("searchInput").value = "";

    document.getElementById("roleFilter").value = "";

    document.getElementById("statusFilter").value = "";

    filteredUsers = [...users];

    renderUsers();
    window.addEventListener("click", function (e) {

    const modal = document.getElementById("userModal");

    if (e.target === modal) {

        closeModal();

    }

});

}
async function viewUser(id) {

    showLoader();

    try {

        const user = await apiRequest(`/admin/users/${id}`);

        document.getElementById("userDetails").innerHTML = `

            <div class="user-profile">

                <div class="avatar">

                    ${user.fullName.charAt(0).toUpperCase()}

                </div>

                <h2>${user.fullName}</h2>

                <p>@${user.username}</p>

            </div>

            <div class="user-info">

                <div class="info-item">
                    <strong>Email</strong>
                    <span>${user.email}</span>
                </div>

                <div class="info-item">
                    <strong>Role</strong>
                    <span class="role-badge ${user.role.toLowerCase()}">
                        ${user.role}
                    </span>
                </div>

                <div class="info-item">
                    <strong>Status</strong>
                    <span class="status-badge ${user.status.toLowerCase()}">
                        ${user.status}
                    </span>
                </div>

            </div>

        `;

        document
            .getElementById("userModal")
            .classList.remove("hidden");

    } catch (error) {

        console.error(error);

        showError("Unable to load user.");

    } finally {

        hideLoader();

    }

    window.addEventListener("click", function (e) {

    const modal = document.getElementById("userModal");

    if (e.target === modal) {

        closeModal();

    }

});

}
function closeModal() {

    document.getElementById("userModal")
        .classList.add("hidden");

}
let userToDelete = null;

async function deleteUser(id) {

    userToDelete = id;

    const user = users.find(u => u.id === id);

    document.getElementById("deleteMessage").textContent =
        `Are you sure you want to delete ${user.fullName}?`;

    document.getElementById("deleteModal")
        .classList.remove("hidden");


        window.addEventListener("click", function (e) {

    const modal = document.getElementById("userModal");

    if (e.target === modal) {

        closeModal();

    }

});
}
async function confirmDelete() {

    if (!userToDelete) return;

    showLoader();

    try {

await apiRequest(`/admin/users/${userToDelete}`, "DELETE");

        document.getElementById("deleteModal")
            .classList.add("hidden");

        await loadUsers();

    } catch (error) {

        showError("Unable to delete user.");

    } finally {

        hideLoader();

    }

window.addEventListener("click", function (e) {

    const modal = document.getElementById("userModal");

    if (e.target === modal) {

        closeModal();

    }

});

}
function closeDeleteModal() {

    document.getElementById("deleteModal")
        .classList.add("hidden");

    userToDelete = null;

}

async function changeRole(userId, role) {

    showLoader();

    try {

await apiRequest(
    `/admin/users/${userId}/role`,
    "PATCH",
    { role: role }
);

        await loadUsers();

    } catch (error) {

        console.error(error);

        showError("Failed to update user role.");

    } finally {

        hideLoader();

    }
    window.addEventListener("click", function (e) {

    const modal = document.getElementById("userModal");

    if (e.target === modal) {

        closeModal();

    }

});

}
async function changeStatus(userId, status) {

    showLoader();

    try {

await apiRequest(
    `/admin/users/${userId}/status`,
    "PATCH",
    { status: status }
);

        await loadUsers();

    } catch (error) {

        console.error(error);

        showError("Failed to update user status.");

    } finally {

        hideLoader();

    }
     window.addEventListener("click", function (e) {

    const modal = document.getElementById("userModal");

    if (e.target === modal) {

        closeModal();

    }

});
}
function showLoader() {

    document
        .getElementById("loadingOverlay")
        .classList.remove("hidden");

}

function hideLoader() {

    document
        .getElementById("loadingOverlay")
        .classList.add("hidden");

}
function renderPagination() {

    const container = document.getElementById("pagination");

    if (!container) return;

    const totalPages = Math.ceil(filteredUsers.length / ROWS_PER_PAGE);

    container.innerHTML = "";

    if (totalPages <= 1) return;

    container.innerHTML += `
        <button
            ${currentPage === 1 ? "disabled" : ""}
            onclick="changePage(${currentPage - 1})">
            Previous
        </button>
    `;

    for (let i = 1; i <= totalPages; i++) {

        container.innerHTML += `
            <button
                class="${i === currentPage ? "active-page" : ""}"
                onclick="changePage(${i})">
                ${i}
            </button>
        `;

    }

    container.innerHTML += `
        <button
            ${currentPage === totalPages ? "disabled" : ""}
            onclick="changePage(${currentPage + 1})">
            Next
        </button>
    `;

}
function changePage(page) {

    const totalPages = Math.ceil(filteredUsers.length / ROWS_PER_PAGE);

    if (page < 1 || page > totalPages)
        return;

    currentPage = page;

    renderUsers();

}
function showError(message) {

    alert(message);

}
function switchManagementTab(tab) {

    const usersPanel =
        document.getElementById(
            "usersManagementPanel"
        );

    const requestsPanel =
        document.getElementById(
            "requestsManagementPanel"
        );

    const usersTab =
        document.getElementById(
            "usersTab"
        );

    const requestsTab =
        document.getElementById(
            "requestsTab"
        );


    if (tab === "requests") {

        usersPanel.classList.add(
            "hidden"
        );

        requestsPanel.classList.remove(
            "hidden"
        );

        usersTab.classList.remove(
            "active"
        );

        requestsTab.classList.add(
            "active"
        );

        loadChairProposals();

    } else {

        usersPanel.classList.remove(
            "hidden"
        );

        requestsPanel.classList.add(
            "hidden"
        );

        usersTab.classList.add(
            "active"
        );

        requestsTab.classList.remove(
            "active"
        );

    }

}
async function loadChairProposals() {

    const container =
        document.getElementById(
            "requestsContainer"
        );

    container.innerHTML = `
        <div class="request-loading">
            Loading chair proposals...
        </div>
    `;


    try {

        const requests =
            await apiRequest(
                "/chair-promotion-requests/pending"
            );


        if (
            !Array.isArray(requests) ||
            requests.length === 0
        ) {

            container.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-inbox"></i>
                    <h3>No pending chair proposals</h3>
                    <p>
                        There are currently no committee
                        proposals awaiting review.
                    </p>
                </div>
            `;

            return;

        }


        container.innerHTML =
            requests
                .map(request =>
                    renderChairProposal(request)
                )
                .join("");


    } catch (error) {

        console.error(
            "Unable to load chair proposals:",
            error
        );


        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <h3>Unable to load requests</h3>
                <p>
                    Please try again.
                </p>
            </div>
        `;

    }

}
function renderChairProposal(request) {

    const user =
        request.user || {};

    return `
        <div
            class="request-card chair-proposal-card"
            data-request-id="${request.id}"
        >

            <div class="request-card-header">

                <div>

                    <span class="request-type-badge chair">
                        <i class="fa-solid fa-landmark"></i>
                        CHAIR PROPOSAL
                    </span>

                    <h3>
                        ${request.committeeName}
                    </h3>

                </div>

                <span class="request-status pending">
                    PENDING
                </span>

            </div>


            <div class="request-user">

                <strong>
                    ${user.fullName || "Unknown User"}
                </strong>

                <span>
                    ${user.email || ""}
                </span>

            </div>


            <div class="request-details">

                <div>
                    <strong>Category</strong>
                    <span>
                        ${request.category || "—"}
                    </span>
                </div>

                <div>
                    <strong>Date</strong>
                    <span>
                        ${request.date || "—"}
                    </span>
                </div>

                <div>
                    <strong>Time</strong>
                    <span>
                        ${request.time || "—"}
                    </span>
                </div>

                <div>
                    <strong>Mode</strong>
                    <span>
                        ${request.mode || "—"}
                    </span>
                </div>

            </div>


            <div class="request-description">

                <strong>
                    Committee Description
                </strong>

                <p>
                    ${request.description || "No description provided."}
                </p>

            </div>


            <div class="request-description">

                <strong>
                    Why should they chair it?
                </strong>

                <p>
                    ${request.proposalReason || "No reason provided."}
                </p>

            </div>


            <div class="request-actions">

                <button
                    class="btn-danger"
                    onclick="rejectChairProposal(${request.id})"
                >
                    <i class="fa-solid fa-xmark"></i>
                    Reject
                </button>


                <button
                    class="btn-primary"
                    onclick="approveChairProposal(${request.id})"
                >
                    <i class="fa-solid fa-check"></i>
                    Approve & Create Committee
                </button>

            </div>

        </div>
    `;

}
async function approveChairProposal(id) {

    openRequestConfirm(
        "Approve Chair Proposal",
        "Approve this proposal and create the committee?",
        "Approve & Create",
        async () => {

            showLoader();

            try {

                await apiRequest(
                    `/chair-promotion-requests/${id}/approve?comment=Approved%20by%20administrator.`,
                    "PUT"
                );



                    FuryToast.success(
                        "Chair proposal approved and committee created."
                    );



                await loadChairProposals();
                await updateRequestCount();

            } catch (error) {

                console.error(
                    "Failed to approve chair proposal:",
                    error
                );



                    FuryToast.error(
                        error?.message ||
                        "Unable to approve chair proposal."
                    );



            } finally {

                hideLoader();

            }

        }
    );

}
async function rejectChairProposal(id) {

    openRequestConfirm(
        "Reject Chair Proposal",
        "Are you sure you want to reject this committee proposal?",
        "Reject",
        async () => {

            showLoader();

            try {

                await apiRequest(
                    `/chair-promotion-requests/${id}/reject?comment=Rejected%20by%20administrator.`,
                    "PUT"
                );

  
                    FuryToast.success(
                        "Chair proposal rejected."
                    );



                await loadChairProposals();
                await updateRequestCount();

            } catch (error) {

                console.error(
                    "Failed to reject chair proposal:",
                    error
                );



                    FuryToast.error(
                        error?.message ||
                        "Unable to reject chair proposal."
                    );



            } finally {

                hideLoader();

            }

        }
    );

}
async function loadCharacterChangeRequests() {

    const container =
        document.getElementById(
            "requestsContainer"
        );

    container.innerHTML = `
        <div class="request-loading">
            Loading character change requests...
        </div>
    `;


    try {

        const requests =
            await apiRequest(
                "/character-change-requests/pending"
            );


        if (
            !Array.isArray(requests) ||
            requests.length === 0
        ) {

            container.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-inbox"></i>
                    <h3>No pending character changes</h3>
                    <p>
                        There are currently no character
                        change requests awaiting review.
                    </p>
                </div>
            `;

            return;

        }


        container.innerHTML =
            requests
                .map(request =>
                    renderCharacterChangeRequest(
                        request
                    )
                )
                .join("");


    } catch (error) {

        console.error(
            "Unable to load character change requests:",
            error
        );


        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <h3>Unable to load requests</h3>
                <p>Please try again.</p>
            </div>
        `;

    }

}
function renderCharacterChangeRequest(request) {

    const user =
        request.user || {};

    const committee =
        request.committee || {};

    return `
        <div
            class="request-card character-change-card"
            data-request-id="${request.id}"
        >

            <div class="request-card-header">

                <div>

                    <span class="request-type-badge character">
                        <i class="fa-solid fa-user-pen"></i>
                        CHARACTER CHANGE
                    </span>

                    <h3>
                        ${user.fullName || "Unknown User"}
                    </h3>

                </div>

                <span class="request-status pending">
                    PENDING
                </span>

            </div>


            <div class="request-user">

                <strong>
                    ${user.email || ""}
                </strong>

            </div>


            <div class="request-details">

                <div>
                    <strong>Committee</strong>
                    <span>
                        ${committee.name || "—"}
                    </span>
                </div>

                <div>
                    <strong>Current Character</strong>
                    <span>
                       ${request.currentCharacter?.name || request.currentCharacter?.characterName || "—"}
                    </span>
                </div>

                <div>
                    <strong>Requested Character</strong>
                    <span>
                        ${request.requestedCharacter?.name || request.requestedCharacter?.characterName || "—"}
                    </span>
                </div>

            </div>


            <div class="request-description">

                <strong>
                    Reason
                </strong>

                <p>
                    ${request.reason || "No reason provided."}
                </p>

            </div>


            <div class="request-actions">

                <button
                    class="btn-danger"
                    onclick="rejectCharacterChange(${request.id})"
                >
                    <i class="fa-solid fa-xmark"></i>
                    Reject
                </button>


                <button
                    class="btn-primary"
                    onclick="approveCharacterChange(${request.id})"
                >
                    <i class="fa-solid fa-check"></i>
                    Approve
                </button>

            </div>

        </div>
    `;

}
async function approveCharacterChange(id) {

    openRequestConfirm(
        "Approve Character Change",
        "Approve this character change request?",
        "Approve",
        async () => {

            showLoader();

            try {

                await apiRequest(
                    `/character-change-requests/${id}/approve?comment=Approved%20by%20administrator.`,
                    "PUT"
                );

                
                    FuryToast.success(
                        "Character change approved."
                    );

            

                await loadCharacterChangeRequests();
                await updateRequestCount();

            } catch (error) {

                console.error(
                    "Failed to approve character change:",
                    error
                );



                    FuryToast.error(
                        error?.message ||
                        "Unable to approve character change."
                    );


            } finally {

                hideLoader();

            }

        }
    );

}
async function rejectCharacterChange(id) {

    openRequestConfirm(
        "Reject Character Change",
        "Are you sure you want to reject this character change?",
        "Reject",
        async () => {

            showLoader();

            try {

                await apiRequest(
                    `/character-change-requests/${id}/reject?comment=Rejected%20by%20administrator.`,
                    "PUT"
                );


                    FuryToast.success(
                        "Character change rejected."
                    );



                await loadCharacterChangeRequests();
                await updateRequestCount();

            } catch (error) {

                console.error(
                    "Failed to reject character change:",
                    error
                );


                    FuryToast.error(
                        error?.message ||
                        "Unable to reject character change."
                    );



            } finally {

                hideLoader();

            }

        }
    );

}
async function loadWithdrawalRequests() {

    const container =
        document.getElementById(
            "requestsContainer"
        );

    container.innerHTML = `
        <div class="request-loading">
            Loading withdrawal requests...
        </div>
    `;


    try {

        const requests =
            await apiRequest(
                "/committee-withdrawal-requests/pending"
            );


        if (
            !Array.isArray(requests) ||
            requests.length === 0
        ) {

            container.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-inbox"></i>
                    <h3>No pending withdrawal requests</h3>
                    <p>
                        There are currently no committee
                        withdrawal requests awaiting review.
                    </p>
                </div>
            `;

            return;

        }


        container.innerHTML =
            requests
                .map(request =>
                    renderWithdrawalRequest(request)
                )
                .join("");


    } catch (error) {

        console.error(
            "Unable to load withdrawal requests:",
            error
        );


        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <h3>Unable to load requests</h3>
                <p>Please try again.</p>
            </div>
        `;

    }

}
function renderWithdrawalRequest(request) {

    const user =
        request.user || {};

    const committee =
        request.committee || {};

    return `
        <div
            class="request-card withdrawal-card"
            data-request-id="${request.id}"
        >

            <div class="request-card-header">

                <div>

                    <span class="request-type-badge withdrawal">
                        <i class="fa-solid fa-right-from-bracket"></i>
                        LEAVE COMMITTEE
                    </span>

                    <h3>
                        ${user.fullName || "Unknown User"}
                    </h3>

                </div>

                <span class="request-status pending">
                    PENDING
                </span>

            </div>


            <div class="request-user">

                <strong>
                    ${user.email || ""}
                </strong>

            </div>


            <div class="request-details">

                <div>
                    <strong>Committee</strong>
                    <span>
                        ${committee.name || "—"}
                    </span>
                </div>

                <div>
                    <strong>Submitted</strong>
                    <span>
                        ${request.createdAt
                            ? new Date(
                                request.createdAt
                              ).toLocaleDateString()
                            : "—"}
                    </span>
                </div>

            </div>


            <div class="request-description">

                <strong>
                    Reason
                </strong>

                <p>
                    ${request.reason ||
                      "No reason provided."}
                </p>

            </div>


            <div class="request-actions">

                <button
                    class="btn-danger"
                    onclick="rejectWithdrawalRequest(${request.id})"
                >
                    <i class="fa-solid fa-xmark"></i>
                    Reject
                </button>


                <button
                    class="btn-primary"
                    onclick="approveWithdrawalRequest(${request.id})"
                >
                    <i class="fa-solid fa-check"></i>
                    Approve
                </button>

            </div>

        </div>
    `;

}
async function approveWithdrawalRequest(id) {

    openRequestConfirm(
        "Approve Withdrawal",
        "Approve this committee withdrawal request?",
        "Approve",
        async () => {

            showLoader();

            try {

                await apiRequest(
                    `/committee-withdrawal-requests/${id}/approve?comment=Approved%20by%20administrator.`,
                    "PUT"
                );



                    FuryToast.success(
                        "Committee withdrawal approved."
                    );



                await loadWithdrawalRequests();
                await updateRequestCount();

            } catch (error) {

                console.error(
                    "Failed to approve withdrawal:",
                    error
                );



                    FuryToast.error(
                        error?.message ||
                        "Unable to approve withdrawal request."
                    );


            } finally {

                hideLoader();

            }

        }
    );

}

async function rejectWithdrawalRequest(id) {

    openRequestConfirm(
        "Reject Withdrawal",
        "Are you sure you want to reject this committee withdrawal request?",
        "Reject",
        async () => {

            showLoader();

            try {

                await apiRequest(
                    `/committee-withdrawal-requests/${id}/reject?comment=Rejected%20by%20administrator.`,
                    "PUT"
                );



                    FuryToast.success(
                        "Committee withdrawal rejected."
                    );


                await loadWithdrawalRequests();
                await updateRequestCount();

            } catch (error) {

                console.error(
                    "Failed to reject withdrawal:",
                    error
                );



                    FuryToast.error(
                        error?.message ||
                        "Unable to reject withdrawal request."
                    );



            } finally {

                hideLoader();

            }

        }
    );

}
async function loadAllRequests() {

    const container =
        document.getElementById(
            "requestsContainer"
        );

    container.innerHTML = `
        <div class="request-loading">
            Loading requests...
        </div>
    `;


    try {

        const [
            characterRequests,
            withdrawalRequests,
            chairRequests
        ] = await Promise.all([

            apiRequest(
                "/character-change-requests/pending"
            ),

            apiRequest(
                "/committee-withdrawal-requests/pending"
            ),

            apiRequest(
                "/chair-promotion-requests/pending"
            )

        ]);


        const requests = [

            ...(Array.isArray(characterRequests)
                ? characterRequests.map(
                    request => ({
                        ...request,
                        requestType: "character"
                    })
                )
                : []),

            ...(Array.isArray(withdrawalRequests)
                ? withdrawalRequests.map(
                    request => ({
                        ...request,
                        requestType: "withdrawal"
                    })
                )
                : []),

            ...(Array.isArray(chairRequests)
                ? chairRequests.map(
                    request => ({
                        ...request,
                        requestType: "chair"
                    })
                )
                : [])

        ];


        if (!requests.length) {

            container.innerHTML = `
                <div class="empty-state">

                    <i class="fa-solid fa-inbox"></i>

                    <h3>
                        No pending requests
                    </h3>

                    <p>
                        There are currently no requests
                        awaiting review.
                    </p>

                </div>
            `;

            return;

        }


        container.innerHTML =
            requests
                .map(request => {

                    if (
                        request.requestType ===
                        "character"
                    ) {

                        return renderCharacterChangeRequest(
                            request
                        );

                    }


                    if (
                        request.requestType ===
                        "withdrawal"
                    ) {

                        return renderWithdrawalRequest(
                            request
                        );

                    }


                    return renderChairProposal(
                        request
                    );

                })
                .join("");


    } catch (error) {

        console.error(
            "Unable to load all requests:",
            error
        );


        container.innerHTML = `
            <div class="empty-state">

                <i class="fa-solid fa-triangle-exclamation"></i>

                <h3>
                    Unable to load requests
                </h3>

                <p>
                    Please try again.
                </p>

            </div>
        `;

    }

}
async function updateRequestCount() {

    const badge =
        document.getElementById(
            "requestCountBadge"
        );

    if (!badge) {
        return;
    }


    try {

        const [
            characterRequests,
            withdrawalRequests,
            chairRequests
        ] = await Promise.all([

            apiRequest(
                "/character-change-requests/pending"
            ),

            apiRequest(
                "/committee-withdrawal-requests/pending"
            ),

            apiRequest(
                "/chair-promotion-requests/pending"
            )

        ]);


        const characterCount =
            Array.isArray(characterRequests)
                ? characterRequests.length
                : 0;


        const withdrawalCount =
            Array.isArray(withdrawalRequests)
                ? withdrawalRequests.length
                : 0;


        const chairCount =
            Array.isArray(chairRequests)
                ? chairRequests.length
                : 0;


        const total =
            characterCount +
            withdrawalCount +
            chairCount;


        badge.textContent =
            total;


        if (total > 0) {

            badge.classList.remove(
                "hidden"
            );

        } else {

            badge.classList.add(
                "hidden"
            );

        }

    } catch (error) {

        console.error(
            "Unable to update request count:",
            error
        );

        badge.classList.add(
            "hidden"
        );

    }

}
function openRequestConfirm(title, message, confirmText, onConfirm) {

    const modal =
        document.getElementById(
            "requestConfirmModal"
        );

    document.getElementById(
        "requestConfirmTitle"
    ).textContent = title;

    document.getElementById(
        "requestConfirmMessage"
    ).textContent = message;

    const confirmButton =
        document.getElementById(
            "confirmRequestAction"
        );

    confirmButton.textContent =
        confirmText;

    confirmButton.classList.remove(
    "btn-danger",
    "btn-primary"
);

if (
    confirmText.toLowerCase().includes("reject")
) {

    confirmButton.classList.add(
        "btn-danger"
    );

} else {

    confirmButton.classList.add(
        "btn-primary"
    );

}

    modal.classList.remove("hidden");


    const closeModal = () => {

        modal.classList.add("hidden");

    };


    document.getElementById(
        "cancelRequestConfirm"
    ).onclick = closeModal;

    document.getElementById(
        "closeRequestConfirm"
    ).onclick = closeModal;


    confirmButton.onclick = async () => {

        closeModal();

        await onConfirm();

    };

}