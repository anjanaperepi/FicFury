document.addEventListener(
    "DOMContentLoaded",
    async () => {

        if (!Auth.isLoggedIn()) {

            window.location.href =
                "../login.html";

            return;
        }

        await loadRegistrations();

        await loadCharacters();

    }
);


// =========================
// LOAD REGISTRATIONS
// =========================

async function loadRegistrations() {

    try {

        const registrations =
            await apiRequest(
                "/registrations"
            );

        const tbody =
            document.getElementById(
                "registrationTableBody"
            );

        if (!tbody) return;

        tbody.innerHTML = "";

        registrations.forEach(registration => {

            tbody.innerHTML += `

                <tr>

                    <td>
                        ${registration.delegateName}
                    </td>

                    <td>
                        ${registration.committeeName}
                    </td>

                    <td>
                        ${registration.characterName || "-"}
                    </td>

                    <td>
                        <span class="status">
                            ${registration.status}
                        </span>
                    </td>

                    <td>

                        <button
                        onclick="approveRegistration(${registration.id})">

                        Approve

                        </button>

                        <button
                        onclick="waitlistRegistration(${registration.id})">

                        Waitlist

                        </button>

                        <button
                        onclick="rejectRegistration(${registration.id})">

                        Reject

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
// APPROVE
// =========================

async function approveRegistration(id) {

    try {

        await apiRequest(
            `/registrations/${id}/approve`,
            "PUT"
        );

        alert(
            "Delegate Approved"
        );

        await loadRegistrations();

    }
    catch(error){

        console.error(error);

    }

}


// =========================
// WAITLIST
// =========================

async function waitlistRegistration(id) {

    try {

        await apiRequest(
            `/registrations/${id}/waitlist`,
            "PUT"
        );

        alert(
            "Delegate Waitlisted"
        );

        await loadRegistrations();

    }
    catch(error){

        console.error(error);

    }

}


// =========================
// REJECT
// =========================

async function rejectRegistration(id) {

    const confirmReject =
        confirm(
            "Reject Registration?"
        );

    if (!confirmReject)
        return;

    try {

        await apiRequest(
            `/registrations/${id}/reject`,
            "PUT"
        );

        alert(
            "Registration Rejected"
        );

        await loadRegistrations();

    }
    catch(error){

        console.error(error);

    }

}


// =========================
// LOAD CHARACTERS
// =========================

async function loadCharacters() {

    try {

        const characters =
            await apiRequest(
                "/characters"
            );

        const select =
            document.getElementById(
                "characterAssignment"
            );

        if (!select) return;

        select.innerHTML =
            '<option value="">Select Character</option>';

        characters.forEach(character => {

            select.innerHTML += `

                <option value="${character.id}">

                    ${character.name}

                </option>

            `;

        });

    }
    catch(error){

        console.error(error);

    }

}


// =========================
// ASSIGN CHARACTER
// =========================

async function assignCharacter() {

    const registrationId =
        document.getElementById(
            "registrationId"
        ).value;

    const characterId =
        document.getElementById(
            "characterAssignment"
        ).value;

    if (
        !registrationId ||
        !characterId
    ) {

        alert(
            "Select Registration and Character"
        );

        return;
    }

    try {

        await apiRequest(
            `/registrations/${registrationId}/assign-character`,
            "PUT",
            {
                characterId
            }
        );

        alert(
            "Character Assigned"
        );

        await loadRegistrations();

    }
    catch(error){

        console.error(error);

    }

}


// =========================
// SEARCH
// =========================

function searchRegistrations() {

    const search =
        document
            .getElementById(
                "registrationSearch"
            )
            .value
            .toLowerCase();

    const rows =
        document.querySelectorAll(
            "#registrationTableBody tr"
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
// FILTER STATUS
// =========================

function filterRegistrations() {

    const selectedStatus =
        document.getElementById(
            "statusFilter"
        ).value;

    const rows =
        document.querySelectorAll(
            "#registrationTableBody tr"
        );

    rows.forEach(row => {

        if (
            selectedStatus === "ALL"
        ) {

            row.style.display = "";
            return;
        }

        const status =
            row.children[3]
                .innerText
                .trim();

        row.style.display =
            status === selectedStatus
            ? ""
            : "none";

    });

}


// =========================
// EXPORT CSV
// =========================

async function exportRegistrations() {

    try {

        window.open(
            `${CONFIG.API_BASE_URL}/registrations/export`,
            "_blank"
        );

    }
    catch(error){

        console.error(error);

    }

}