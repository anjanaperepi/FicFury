let users = [];
let filteredUsers = [];

const ROWS_PER_PAGE = 10;
let currentPage = 1;

document.addEventListener("DOMContentLoaded", init);

async function init() {
    registerEvents();
    await loadUsers();
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