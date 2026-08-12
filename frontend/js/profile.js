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

