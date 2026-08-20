/* ==========================================================
   FIC FURY
   PROFILE PAGE
   ========================================================== */

const Profile = {

    user: null,

    dashboard: null,

    registrations: [],

    certificateEligible: null,


    /* ======================================================
       INITIALIZATION
       ====================================================== */

    async init() {

        console.log("Initializing Profile...");

        try {

            this.user = this.getCurrentUser();

            if (!this.user) {

                console.warn(
                    "No authenticated user found."
                );

                window.location.href = "login.html";

                return;
            }


            await this.loadProfile();

            console.log(
                "Profile initialized successfully."
            );

        } catch (error) {

            console.error(
                "Profile initialization failed:",
                error
            );

            this.showPageError();

        }

    },


    /* ======================================================
       CURRENT USER
       ====================================================== */

    getCurrentUser() {

        /*
         * Your dashboard uses Auth.getCurrentUser()
         * when available.
         */

        if (
            typeof Auth !== "undefined" &&
            typeof Auth.getCurrentUser === "function"
        ) {

            const user =
                Auth.getCurrentUser();

            if (user) {

                return user;

            }

        }


        /*
         * Fallback for the existing localStorage
         * structure used elsewhere in FIC FURY.
         */

        const storedUser =
            localStorage.getItem(
                CONFIG.USER_KEY
            );

        if (storedUser) {

            try {

                return JSON.parse(
                    storedUser
                );

            } catch (error) {

                console.error(
                    "Unable to parse stored user:",
                    error
                );

            }

        }


        return null;

    },


    /* ======================================================
       LOAD PROFILE
       ====================================================== */

    async loadProfile() {

this.dashboard =
    await apiRequest(
        "/dashboard/delegate"
    );

this.registrations =
    await apiRequest(
        `/registrations/user/${this.user.id}`
    );

this.certificateEligible =
    await apiRequest(
        "/certificates/eligibility"
    );


        console.log(
            "Profile dashboard:",
            this.dashboard
        );

        console.log(
            "Profile registrations:",
            this.registrations
        );


        this.renderProfile();

    },


    /* ======================================================
       RENDER EVERYTHING
       ====================================================== */

    renderProfile() {

        this.renderUser();

        this.renderIdentity();

        this.renderStatistics();

        this.renderCertificate();

        this.renderRegistrations();

        this.initCharacterChange();

        this.loadCharacterChangeStatus();

        this.initCommitteeWithdrawal();

        this.initChairProposal();

    },


    /* ======================================================
       USER
       ====================================================== */

    renderUser() {

        const user =
            this.dashboard?.user ||
            this.user ||
            {};


        const name =
            user.fullName ||
            user.name ||
            "Delegate";


        this.setText(
            "profileName",
            name
        );


        /*
         * Optional compatibility if the HTML
         * contains these elements later.
         */

        this.setText(
            "profileEmail",
            user.email || "-"
        );

    },


    /* ======================================================
       ROLE / IDENTITY
       ====================================================== */

    renderIdentity() {

        const role =
            this.user?.role ||
            this.user?.roles?.[0] ||
            "DELEGATE";


        this.setText(
            "profileRole",
            this.formatRole(role)
        );

    },


    /* ======================================================
       STATISTICS
       ====================================================== */

    renderStatistics() {

        const registrations =
            Array.isArray(this.registrations)
                ? this.registrations
                : [];


        const total =
            registrations.length;


        const approved =
            registrations.filter(
                registration =>
                    this.getRegistrationStatus(
                        registration
                    ) === "APPROVED"
            ).length;


        const pending =
            registrations.filter(
                registration =>
                    this.getRegistrationStatus(
                        registration
                    ) === "PENDING"
            ).length;


        this.setText(
            "totalRegistrations",
            total
        );


        this.setText(
            "approvedRegistrations",
            approved
        );


        this.setText(
            "pendingRegistrations",
            pending
        );


        /*
         * Attendance comes from the delegate
         * dashboard response.
         */

        const attendanceStats =
            this.dashboard?.attendanceStats;


        const attendancePercentage =
            attendanceStats?.attendancePercentage;


        this.setText(
            "attendancePercentage",
            this.formatPercentage(
                attendancePercentage
            )
        );

    },


    /* ======================================================
       CERTIFICATE
       ====================================================== */
renderCertificate() {

    const eligible =
        this.certificateEligible;


    const element =
        document.getElementById(
            "certificateEligibility"
        );


    if (!element) {

        return;
    }


    if (eligible === true) {

        element.innerHTML = `
            <span class="certificate-status eligible">
                <i class="fa-solid fa-circle-check"></i>
                Eligible
            </span>
        `;

        return;
    }


    if (eligible === false) {

        element.innerHTML = `
            <span class="certificate-status not-eligible">
                <i class="fa-solid fa-circle-xmark"></i>
                Not Eligible
            </span>
        `;

        return;
    }


    element.innerHTML = `
        <span class="certificate-status pending">
            <i class="fa-solid fa-hourglass-half"></i>
            Checking...
        </span>
    `;
},

    /* ======================================================
       REGISTRATION TABLE
       ====================================================== */

    renderRegistrations() {

        const tbody =
            document.getElementById(
                "registrationsBody"
            );


        if (!tbody) {

            console.warn(
                "registrationsBody not found."
            );

            return;

        }


        if (
            !Array.isArray(
                this.registrations
            ) ||
            this.registrations.length === 0
        ) {

            tbody.innerHTML = `
                <tr>

                    <td
                        colspan="3"
                        class="profile-empty-state"
                    >

                        <i class="fa-solid fa-building-columns"></i>

                        <strong>
                            No registrations yet
                        </strong>

                        <p>
                            You haven't registered
                            for a committee yet.
                        </p>

                    </td>

                </tr>
            `;

            return;

        }


        tbody.innerHTML =
            this.registrations
                .map(
                    registration =>
                        this.createRegistrationRow(
                            registration
                        )
                )
                .join("");

    },

    initCharacterChange() {

    const button =
        document.getElementById(
            "requestCharacterChangeBtn"
        );

    if (!button) {
        return;
    }


button.addEventListener(
    "click",
    () => {

        if (
            button.disabled
        ) {

            FuryToast.info(
                "Your character change request is already awaiting review."
            );

            return;

        }

        this.openCharacterChangeModal();

    }
);

    document
        .getElementById(
            "closeCharacterChangeModal"
        )
        ?.addEventListener(
            "click",
            () => this.closeCharacterChangeModal()
        );


    document
        .getElementById(
            "cancelCharacterChange"
        )
        ?.addEventListener(
            "click",
            () => this.closeCharacterChangeModal()
        );


    document
        .getElementById(
            "submitCharacterChange"
        )
        ?.addEventListener(
            "click",
            () => this.submitCharacterChange()
        );

},

async loadCharacterChangeStatus() {

    const button =
        document.getElementById(
            "requestCharacterChangeBtn"
        );

    if (!button) {
        return;
    }


    try {

        const requests =
            await apiRequest(
                "/character-change-requests/my"
            );


        const pendingRequest =
            Array.isArray(requests)
                ? requests.find(
                    request =>
                        String(
                            request.status
                        ).toUpperCase() ===
                        "PENDING"
                )
                : null;


        if (pendingRequest) {

            button.disabled = true;

            button.innerHTML = `
                <i class="fa-solid fa-clock"></i>
                CHARACTER CHANGE REQUEST PENDING
            `;

            button.classList.add(
                "request-pending"
            );

            button.title =
                "Your character change request is awaiting review.";

        }

    } catch (error) {

        console.error(
            "Unable to load character change status:",
            error
        );

    }

},
initCommitteeWithdrawal() {

    const button =
        document.getElementById(
            "leaveCommitteeBtn"
        );

    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        () => {

            if (button.disabled) {

                FuryToast.info(
                    "Your committee withdrawal request is already awaiting review."
                );

                return;

            }

            this.openCommitteeWithdrawalModal();

        }
    );


    document
        .getElementById(
            "closeLeaveCommitteeModal"
        )
        ?.addEventListener(
            "click",
            () => this.closeCommitteeWithdrawalModal()
        );


    document
        .getElementById(
            "cancelLeaveCommittee"
        )
        ?.addEventListener(
            "click",
            () => this.closeCommitteeWithdrawalModal()
        );


    document
        .getElementById(
            "submitLeaveCommittee"
        )
        ?.addEventListener(
            "click",
            () => this.submitCommitteeWithdrawal()
        );


    this.loadCommitteeWithdrawalStatus();

},
openCommitteeWithdrawalModal() {

    const registration =
        this.registrations.find(
            item =>
                this.getRegistrationStatus(item) ===
                "ACTIVE"
        );


    if (!registration) {

        FuryToast.warning(
            "You don't have an active committee registration."
        );

        return;

    }


    const modal =
        document.getElementById(
            "leaveCommitteeModal"
        );


    if (modal) {

        modal.classList.remove(
            "hidden"
        );

    }

},
closeCommitteeWithdrawalModal() {

    const modal =
        document.getElementById(
            "leaveCommitteeModal"
        );


    if (modal) {

        modal.classList.add(
            "hidden"
        );

    }

},
async submitCommitteeWithdrawal() {

    const reason =
        document.getElementById(
            "withdrawalReason"
        );


    const submitButton =
        document.getElementById(
            "submitLeaveCommittee"
        );


    try {

        if (submitButton) {

            submitButton.disabled =
                true;

        }


        await apiRequest(
            "/committee-withdrawal-requests",
            "POST",
            {
                reason:
                    reason?.value.trim() || ""
            }
        );


        this.closeCommitteeWithdrawalModal();


        if (reason) {

            reason.value = "";

        }


        FuryToast.success(
            "Committee withdrawal request submitted successfully."
        );


        this.loadCommitteeWithdrawalStatus();


    } catch (error) {

        console.error(
            "Committee withdrawal request failed:",
            error
        );


        FuryToast.error(
            error?.message ||
            "Unable to submit withdrawal request."
        );


    } finally {

        if (submitButton) {

            submitButton.disabled =
                false;

        }

    }

},
async loadCommitteeWithdrawalStatus() {

    const button =
        document.getElementById(
            "leaveCommitteeBtn"
        );


    if (!button) {
        return;
    }


    try {

        const requests =
            await apiRequest(
                "/committee-withdrawal-requests/my"
            );


        const pendingRequest =
            Array.isArray(requests)
                ? requests.find(
                    request =>
                        String(
                            request.status
                        ).toUpperCase() ===
                        "PENDING"
                )
                : null;


        if (pendingRequest) {

            button.disabled =
                true;

            button.innerHTML = `
                <i class="fa-solid fa-clock"></i>
                WITHDRAWAL REQUEST PENDING
            `;

            button.classList.add(
                "request-pending"
            );

            button.title =
                "Your committee withdrawal request is awaiting review.";

        }

    } catch (error) {

        console.error(
            "Unable to load withdrawal status:",
            error
        );

    }

},
initChairProposal() {

    const button =
        document.getElementById(
            "proposeCommitteeBtn"
        );

    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        () => {

            if (button.disabled) {

                FuryToast.info(
                    "Your committee proposal is already awaiting review."
                );

                return;

            }

            this.openChairProposalModal();

        }
    );


    document
        .getElementById(
            "closeChairProposalModal"
        )
        ?.addEventListener(
            "click",
            () => this.closeChairProposalModal()
        );


    document
        .getElementById(
            "cancelChairProposal"
        )
        ?.addEventListener(
            "click",
            () => this.closeChairProposalModal()
        );


    document
        .getElementById(
            "submitChairProposal"
        )
        ?.addEventListener(
            "click",
            () => this.submitChairProposal()
        );


    this.loadChairProposalStatus();

},
async loadChairProposalStatus() {

    const button =
        document.getElementById(
            "proposeCommitteeBtn"
        );

    if (!button) {
        return;
    }


    try {

        const requests =
            await apiRequest(
                "/chair-promotion-requests/my"
            );


        const pendingRequest =
            Array.isArray(requests)
                ? requests.find(
                    request =>
                        String(
                            request.status
                        ).toUpperCase() ===
                        "PENDING"
                )
                : null;


        if (pendingRequest) {

            button.disabled = true;

            button.innerHTML = `
                <i class="fa-solid fa-clock"></i>
                COMMITTEE PROPOSAL PENDING
            `;

            button.classList.add(
                "request-pending"
            );

            button.title =
                "Your committee proposal is awaiting administrator review.";

        }

    } catch (error) {

        console.error(
            "Unable to load chair proposal status:",
            error
        );

    }

},
openChairProposalModal() {

    const modal =
        document.getElementById(
            "chairProposalModal"
        );

    if (modal) {

        modal.classList.remove(
            "hidden"
        );

    }

},
closeChairProposalModal() {

    const modal =
        document.getElementById(
            "chairProposalModal"
        );

    if (modal) {

        modal.classList.add(
            "hidden"
        );

    }

},
async submitChairProposal() {

    const submitButton =
        document.getElementById(
            "submitChairProposal"
        );


    const data = {

        committeeName:
            document.getElementById(
                "proposalCommitteeName"
            )?.value.trim(),

        category:
            document.getElementById(
                "proposalCategory"
            )?.value.trim(),

        description:
            document.getElementById(
                "proposalDescription"
            )?.value.trim(),

        date:
            document.getElementById(
                "proposalDate"
            )?.value,

        time:
            document.getElementById(
                "proposalTime"
            )?.value,

        mode:
            document.getElementById(
                "proposalMode"
            )?.value,

        venue:
            document.getElementById(
                "proposalVenue"
            )?.value.trim(),

        meetingLink:
            document.getElementById(
                "proposalMeetingLink"
            )?.value.trim(),

        proposalReason:
            document.getElementById(
                "proposalReason"
            )?.value.trim()

    };


    if (!data.committeeName) {

        FuryToast.warning(
            "Please enter a committee name."
        );

        return;

    }


    if (!data.date) {

        FuryToast.warning(
            "Please select a committee date."
        );

        return;

    }


    if (!data.time) {

        FuryToast.warning(
            "Please select a committee time."
        );

        return;

    }


    if (!data.proposalReason) {

        FuryToast.warning(
            "Please explain why you want to chair this committee."
        );

        return;

    }


    try {

        if (submitButton) {

            submitButton.disabled = true;

        }


        await apiRequest(
            "/chair-promotion-requests",
            "POST",
            data
        );


        this.closeChairProposalModal();


        this.clearChairProposalForm();


        FuryToast.success(
            "Committee proposal submitted successfully."
        );


        this.loadChairProposalStatus();


    } catch (error) {

        console.error(
            "Chair proposal submission failed:",
            error
        );


        FuryToast.error(
            error?.message ||
            "Unable to submit committee proposal."
        );


    } finally {

        if (submitButton) {

            submitButton.disabled = false;

        }

    }

},
clearChairProposalForm() {

    const fields = [
        "proposalCommitteeName",
        "proposalCategory",
        "proposalDescription",
        "proposalDate",
        "proposalTime",
        "proposalMode",
        "proposalVenue",
        "proposalMeetingLink",
        "proposalReason"
    ];


    fields.forEach(
        id => {

            const element =
                document.getElementById(id);

            if (element) {

                element.value = "";

            }

        }
    );

},
async openCharacterChangeModal() {

    const registration =
        this.registrations.find(
            item =>
                this.getRegistrationStatus(item) ===
                "ACTIVE"
        );


    if (!registration) {

        FuryToast.warning(
            "You need an active committee registration to request a character change."
        );

        return;

    }


    const modal =
        document.getElementById(
            "characterChangeModal"
        );


    const select =
        document.getElementById(
            "requestedCharacter"
        );


    if (!modal || !select) {
        return;
    }


    select.innerHTML = `
        <option value="">
            Loading characters...
        </option>
    `;


    modal.classList.remove("hidden");


    try {

        const committeeId =
            registration.committee?.id;


        if (!committeeId) {
            throw new Error(
                "Committee information is unavailable."
            );
        }


const characters =
    await apiRequest(
        `/characters/committee/${committeeId}/available`
    );

const currentCharacterId =
    registration.character?.id;


const availableCharacters =
    Array.isArray(characters)
        ? characters.filter(
            character =>
                character.id !==
                currentCharacterId
        )
        : [];


        if (
            availableCharacters.length === 0
        ) {

            select.innerHTML = `
                <option value="">
                    No other characters available
                </option>
            `;

            return;

        }


        select.innerHTML = `
            <option value="">
                Select a character
            </option>
        `;


        availableCharacters.forEach(
            character => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    character.id;

                option.textContent =
                    character.name;

                select.appendChild(
                    option
                );

            }
        );


    } catch (error) {

        console.error(
            "Unable to load characters:",
            error
        );


        select.innerHTML = `
            <option value="">
                Unable to load characters
            </option>
        `;


        FuryToast.error(
            "Unable to load characters. Please try again."
        );

    }

},
closeCharacterChangeModal() {

    const modal =
        document.getElementById(
            "characterChangeModal"
        );


    if (modal) {

        modal.classList.add(
            "hidden"
        );

    }

},
async submitCharacterChange() {

    const select =
        document.getElementById(
            "requestedCharacter"
        );

    const reason =
        document.getElementById(
            "characterChangeReason"
        );


    const requestedCharacterId =
        select?.value;


    if (!requestedCharacterId) {

        FuryToast.warning(
            "Please select a character."
        );

        return;

    }


    try {

await apiRequest(
    "/character-change-requests",
    "POST",
    {
        requestedCharacterId:
            Number(requestedCharacterId),

        reason:
            reason?.value.trim() || ""
    }
);

        this.closeCharacterChangeModal();

        FuryToast.success(
            "Character change request submitted successfully."
        );




        if (select) {
            select.value = "";
        }


        if (reason) {
            reason.value = "";
        }


    } catch (error) {

        console.error(
            "Character change request failed:",
            error
        );


FuryToast.error(
    error?.message === "HTTP 403"
        ? "This character is already assigned."
        : (
            error?.message ||
            "Unable to submit character change request."
        )
);

    }

},


    /* ======================================================
       REGISTRATION ROW
       ====================================================== */

    createRegistrationRow(
        registration
    ) {

        const committee =
            registration.committee?.name ||
            registration.committeeName ||
            "-";


        const character =
            registration.character?.name ||
            registration.characterName ||
            "Not Assigned";


        const status =
            this.getRegistrationStatus(
                registration
            );


        const statusClass =
            this.getStatusClass(
                status
            );


        return `
            <tr>

                <td>
                    <strong>
                        <i class="fa-solid fa-building-columns"></i>
                        ${this.escapeHTML(
                            committee
                        )}
                    </strong>
                </td>


                <td>

                    <i class="fa-solid fa-user-secret"></i>

                    ${this.escapeHTML(
                        character
                    )}

                </td>


                <td>

                    <span
                        class="registration-status ${statusClass}"
                    >

                        ${this.escapeHTML(
                            status
                        )}

                    </span>

                </td>

            </tr>
        `;

    },


    /* ======================================================
       REGISTRATION STATUS
       ====================================================== */

    getRegistrationStatus(
        registration
    ) {

        return (
            registration?.workflowStatus ||
            registration?.status ||
            "PENDING"
        )
            .toString()
            .toUpperCase();

    },


    /* ======================================================
       STATUS CLASS
       ====================================================== */

    getStatusClass(status) {

        switch (
            status.toUpperCase()
        ) {

            case "APPROVED":
            case "ACTIVE":
                return "active";


            case "PENDING":
                return "pending";


            case "REJECTED":
                return "rejected";


            default:
                return "pending";

        }

    },


    /* ======================================================
       ROLE FORMATTER
       ====================================================== */

    formatRole(role) {

        if (!role) {

            return "Delegate";

        }


        return role
            .toString()
            .replace(
                "ROLE_",
                ""
            )
            .toLowerCase()
            .replace(
                /^\w/,
                character =>
                    character.toUpperCase()
            );

    },


    /* ======================================================
       PERCENTAGE
       ====================================================== */

    formatPercentage(value) {

        if (
            value === null ||
            value === undefined ||
            Number.isNaN(
                Number(value)
            )
        ) {

            return "0%";

        }


        return `${Number(value)}%`;

    },


    /* ======================================================
       PAGE ERROR
       ====================================================== */

    showPageError() {

        const tbody =
            document.getElementById(
                "registrationsBody"
            );


        if (!tbody) {

            return;

        }


        tbody.innerHTML = `
            <tr>

                <td
                    colspan="3"
                    class="profile-empty-state"
                >

                    <i class="fa-solid fa-triangle-exclamation"></i>

                    <strong>
                        Unable to load profile
                    </strong>

                    <p>
                        Please refresh the page
                        and try again.
                    </p>

                </td>

            </tr>
        `;

    },


    /* ======================================================
       SAFE TEXT
       ====================================================== */

    setText(id, value) {

        const element =
            document.getElementById(id);


        if (!element) {

            return;

        }


        element.textContent =
            value ?? "-";

    },


    /* ======================================================
       HTML ESCAPE
       ====================================================== */

    escapeHTML(value) {

        return String(value ?? "")
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }

};


/* ==========================================================
   START PROFILE
   ========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        Profile.init();

    }
);

