async function loadUsers() {

    try {

        const response =
            await fetch(
                `${CONFIG.API_BASE_URL}/users`
            );

        const users =
            await response.json();

        const tbody =
            document.getElementById(
                "usersTableBody"
            );

        tbody.innerHTML = "";

        users.forEach(user => {

            const row =
                document.createElement(
                    "tr"
                );

            row.innerHTML = `

                <td>${user.id}</td>

                <td>${user.fullName}</td>

                <td>${user.email}</td>

                <td>

                    <select
                        onchange="updateRole(
                            ${user.id},
                            this.value
                        )"
                    >

                        <option value="DELEGATE"
                            ${user.role === "DELEGATE" ? "selected" : ""}
                        >
                            Delegate
                        </option>

                        <option value="CHAIR"
                            ${user.role === "CHAIR" ? "selected" : ""}
                        >
                            Chair
                        </option>

                        <option value="ADMIN"
                            ${user.role === "ADMIN" ? "selected" : ""}
                        >
                            Admin
                        </option>

                    </select>

                </td>

                <td>${user.status}</td>

                <td>

                    <button
                        onclick="activateUser(${user.id})"
                    >
                        Activate
                    </button>

                    <button
                        onclick="suspendUser(${user.id})"
                    >
                        Suspend
                    </button>

                </td>

            `;

            tbody.appendChild(row);

        });

    }
    catch(error){

        console.error(error);

    }

}
async function updateRole(
    userId,
    role
) {

    await fetch(

        `${CONFIG.API_BASE_URL}/users/${userId}/role`,

        {
            method: "PUT",

            headers: {
                "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
                role
            })

        }

    );

    loadUsers();

}
async function activateUser(
    userId
) {

    await fetch(

        `${CONFIG.API_BASE_URL}/users/${userId}/status`,

        {
            method: "PUT",

            headers: {
                "Content-Type":
                "application/json"
            },

            body: JSON.stringify({

                status:
                "ACTIVE"

            })

        }

    );

    loadUsers();

}
async function suspendUser(
    userId
) {

    await fetch(

        `${CONFIG.API_BASE_URL}/users/${userId}/status`,

        {
            method: "PUT",

            headers: {
                "Content-Type":
                "application/json"
            },

            body: JSON.stringify({

                status:
                "SUSPENDED"

            })

        }

    );

    loadUsers();

}
document.addEventListener(
    "DOMContentLoaded",
    loadUsers
);