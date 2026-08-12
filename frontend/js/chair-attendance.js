async function loadDelegates() {

    try {

        const response =
            await fetch(

                `${CONFIG.API_BASE_URL}/registrations/approved`

            );

        const registrations =
            await response.json();

        const tbody =
            document.getElementById(
                "attendanceTableBody"
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
                        ${registration.user.fullName}
                    </td>

                    <td>
                        ${registration.committee.name}
                    </td>

                    <td>

                        <select
                            id="status-${registration.id}"
                        >

                            <option value="PRESENT">
                                Present
                            </option>

                            <option value="ABSENT">
                                Absent
                            </option>

                            <option value="LATE">
                                Late
                            </option>

                        </select>

                    </td>

                    <td>

                        <button
                            onclick="markAttendance(
                                ${registration.user.id},
                                ${registration.committee.id},
                                ${registration.id}
                            )"
                        >
                            Save
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

        console.error(error);

    }

}
async function markAttendance(

    userId,
    committeeId,
    registrationId

) {

    const status =

        document.getElementById(
            `status-${registrationId}`
        ).value;

    try {

        const response =
            await fetch(

                `${CONFIG.API_BASE_URL}/attendance`,

                {

                    method:"POST",

                    headers:{
                        "Content-Type":
                        "application/json"
                    },

                    body:JSON.stringify({

                        userId,
                        committeeId,
                        status

                    })

                }

            );

        if(response.ok){

            alert(
                "Attendance Saved"
            );

        }

    }
    catch(error){

        console.error(error);

    }

}

document.addEventListener(
    "DOMContentLoaded",
    loadDelegates
);