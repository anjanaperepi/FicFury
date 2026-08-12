async function loadUsers() {

    try {

        const response =
            await fetch(
                `${CONFIG.API_BASE_URL}/users`
            );

        const users =
            await response.json();

        const dropdown =
            document.getElementById(
                "delegateSelect"
            );

        dropdown.innerHTML =
            '<option value="">Select Delegate</option>';

        users.forEach(user => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                user.id;

            option.textContent =
                user.fullName;

            dropdown.appendChild(
                option
            );

        });

    }
    catch(error){

        console.error(
            "Failed to load users",
            error
        );

    }

    async function loadCommittees() {

    try {

        const response =
            await fetch(
                `${CONFIG.API_BASE_URL}/committees`
            );

        const committees =
            await response.json();

        const dropdown =
            document.getElementById(
                "committeeSelect"
            );

        dropdown.innerHTML =
            '<option value="">Select Committee</option>';

        committees.forEach(
            committee => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    committee.id;

                option.textContent =
                    committee.name;

                dropdown.appendChild(
                    option
                );

            }
        );

    }
    catch(error){

        console.error(
            "Failed to load committees",
            error
        );

    }

}
async function loadAwards() {

    try {

        const response =
            await fetch(
                `${CONFIG.API_BASE_URL}/awards`
            );

        const awards =
            await response.json();

        const tbody =
            document.getElementById(
                "awardsTableBody"
            );

        tbody.innerHTML = "";

        awards.forEach(
            award => {

                const row =
                    document.createElement(
                        "tr"
                    );

                row.innerHTML = `

                    <td>
                        ${award.user.fullName}
                    </td>

                    <td>
                        ${award.committee.name}
                    </td>

                    <td>
                        ${award.awardType}
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
            "Failed to load awards",
            error
        );

    }

}

async function assignAward(
    event
) {

    event.preventDefault();

    const data = {

        userId:
            parseInt(
                document.getElementById(
                    "delegateSelect"
                ).value
            ),

        committeeId:
            parseInt(
                document.getElementById(
                    "committeeSelect"
                ).value
            ),

        awardType:
            document.getElementById(
                "awardType"
            ).value

    };

    try {

        const response =
            await fetch(

                `${CONFIG.API_BASE_URL}/awards`,

                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                        "application/json"

                    },

                    body:
                    JSON.stringify(
                        data
                    )

                }

            );

        if(response.ok){

            alert(
                "Award Assigned Successfully"
            );

            document
                .getElementById(
                    "awardForm"
                )
                .reset();

            loadAwards();

        }
        else {

            alert(
                "Failed to assign award"
            );

        }

    }
    catch(error){

        console.error(error);

        alert(
            "Error assigning award"
        );

    }

}
document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadUsers();

        loadCommittees();

        loadAwards();

        document
            .getElementById(
                "awardForm"
            )
            .addEventListener(
                "submit",
                assignAward
            );

    }
);

}