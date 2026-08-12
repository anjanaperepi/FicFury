async function loadMyRegistrations() {

    const user =
        JSON.parse(
            localStorage.getItem(
                CONFIG.USER_KEY
            )
        );

    try {

        const response =
            await fetch(

                `${CONFIG.API_BASE_URL}/registrations/user/${user.id}`

            );

        const registrations =
            await response.json();

        const tbody =
            document.getElementById(
                "myRegistrationsTableBody"
            );

        tbody.innerHTML = "";

        registrations.forEach(
            registration => {

                const row =
                    document.createElement(
                        "tr"
                    );

                row.innerHTML = `

                    <td>
                        ${registration.committee.name}
                    </td>

                    <td>
                        ${registration.character.title}
                    </td>

                    <td>
                        ${registration.status}
                    </td>

                `;

                tbody.appendChild(
                    row
                );

            }
        );

    }
    catch(error){

        console.error(error);

    }

}

document.addEventListener(
    "DOMContentLoaded",
    loadMyRegistrations
);