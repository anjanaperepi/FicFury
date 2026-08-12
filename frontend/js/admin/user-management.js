document.addEventListener(
    "DOMContentLoaded",
    async () => {

        if (!Auth.isLoggedIn()) {

            window.location.href =
                "../login.html";

            return;
        }

        await loadUsers();

    }
);


// =========================
// LOAD USERS
// =========================

async function loadUsers() {

    try {

        const users =
            await apiRequest(
                "/users"
            );

        const tbody =
            document.getElementById(
                "userTableBody"
            );

        if (!tbody) return;

        tbody.innerHTML = "";

        users.forEach(user => {

            tbody.innerHTML += `

                <tr>

                    <td>${user.id}</td>

                    <td>${user.fullName}</td>

                    <td>${user.email}</td>

                    <td>${user.role}</td>

                    <td>${user.status}</td>

                    <td>

                        <button
                        onclick="viewUser(${user.id})">

                        View

                        </button>

                        <button
                        onclick="editRole(${user.id})">

                        Role

                        </button>

                        <button
                        onclick="toggleStatus(${user.id})">

                        ${user.status === 'ACTIVE'
                            ? 'Suspend'
                            : 'Activate'}

                        </button>

                        <button
                        onclick="deleteUser(${user.id})">

                        Delete

                        </button>

                    </td>

                </tr>

            `;

        });

    }
    catch(error){

        console.error(error);

    }

}


// =========================
// VIEW USER
// =========================

async function viewUser(id) {

    try {

        const user =
            await apiRequest(
                `/users/${id}`
            );

        const modal =
            document.getElementById(
                "userDetails"
            );

        if (!modal) return;

        modal.innerHTML = `

            <h3>${user.fullName}</h3>

            <p>Email: ${user.email}</p>

            <p>Username: ${user.username}</p>

            <p>Role: ${user.role}</p>

            <p>Status: ${user.status}</p>

            <p>Joined: ${user.createdAt}</p>

        `;

    }
    catch(error){

        console.error(error);

    }

}


// =========================
// ROLE MANAGEMENT
// =========================

function editRole(id) {

    document.getElementById(
        "selectedUserId"
    ).value = id;

}


// =========================
// UPDATE ROLE
// =========================

async function updateRole() {

    const id =
        document.getElementById(
            "selectedUserId"
        ).value;

    const role =
        document.getElementById(
            "roleSelect"
        ).value;

    if (!id || !role)
        return;

    try {

        await apiRequest(
            `/users/${id}/role`,
            "PUT",
            {
                role
            }
        );

        alert(
            "Role Updated"
        );

        await loadUsers();

    }
    catch(error){

        console.error(error);

    }

}


// =========================
// SUSPEND / ACTIVATE
// =========================

async function toggleStatus(id) {

    try {

        await apiRequest(
            `/users/${id}/toggle-status`,
            "PUT"
        );

        await loadUsers();

    }
    catch(error){

        console.error(error);

    }

}


// =========================
// DELETE USER
// =========================

async function deleteUser(id) {

    const confirmDelete =
        confirm(
            "Delete this user?"
        );

    if (!confirmDelete)
        return;

    try {

        await apiRequest(
            `/users/${id}`,
            "DELETE"
        );

        alert(
            "User Deleted"
        );

        await loadUsers();

    }
    catch(error){

        console.error(error);

    }

}


// =========================
// SEARCH USERS
// =========================

function searchUsers() {

    const search =
        document
            .getElementById(
                "userSearch"
            )
            .value
            .toLowerCase();

    const rows =
        document.querySelectorAll(
            "#userTableBody tr"
        );

    rows.forEach(row => {

        row.style.display =
            row.innerText
                .toLowerCase()
                .includes(search)
            ? ""
            : "none";

    });

}


// =========================
// FILTER BY ROLE
// =========================

function filterUsers() {

    const selectedRole =
        document.getElementById(
            "roleFilter"
        ).value;

    const rows =
        document.querySelectorAll(
            "#userTableBody tr"
        );

    rows.forEach(row => {

        if (
            selectedRole === "ALL"
        ) {

            row.style.display = "";
            return;

        }

        const role =
            row.children[3]
                .innerText
                .trim();

        row.style.display =
            role === selectedRole
            ? ""
            : "none";

    });

}