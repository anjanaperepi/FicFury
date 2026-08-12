async function loadPendingRegistrations() {

    try {

        const response =
            await fetch(
                `${CONFIG.API_BASE_URL}/registrations/pending`
            );

        const registrations =
            await response.json();

        const tbody =
            document.getElementById(
                "registrationsTableBody"
            );

        tbody.innerHTML = "";

        if (
            registrations.length === 0
        ) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="6">
                        No pending registrations
                    </td>
                </tr>
            `;

            return;

        }

        registrations.forEach(
            registration => {

                const row =
                    document.createElement(
                        "tr"
                    );

                row.innerHTML = `

                    <td>
                        ${registration.id}
                    </td>

                    <td>
                        ${registration.user.fullName}
                    </td>

                    <td>
                        ${registration.committee.name}
                    </td>

                    <td>
                        ${registration.character.title}
                    </td>

                    <td>
                        ${registration.status}
                    </td>

                    <td>

                        <button
                            class="approve-btn"
                            onclick="approveRegistration(${registration.id})"
                        >
                            Approve
                        </button>

                        <button
                            class="reject-btn"
                            onclick="rejectRegistration(${registration.id})"
                        >
                            Reject
                        </button>

                    </td>

                `;

                tbody.appendChild(
                    row
                );

            }
        );

    }
    catch(error){

        console.error(
            error
        );

    }

}
async function approveRegistration(
    registrationId
) {

    try {

        const response =
            await fetch(

                `${CONFIG.API_BASE_URL}/registrations/${registrationId}/approve`,

                {
                    method: "PUT"
                }

            );

        if (
            response.ok
        ) {

            alert(
                "Registration Approved"
            );

            loadPendingRegistrations();

        }

    }
    catch(error){

        console.error(
            error
        );

    }

}

async function rejectRegistration(
    registrationId
) {

    try {

        const response =
            await fetch(

                `${CONFIG.API_BASE_URL}/registrations/${registrationId}/reject`,

                {
                    method: "PUT"
                }

            );

        if (
            response.ok
        ) {

            alert(
                "Registration Rejected"
            );

            loadPendingRegistrations();

        }

    }
    catch(error){

        console.error(
            error
        );

    }

}
document.addEventListener(
    "DOMContentLoaded",
    loadPendingRegistrations
);