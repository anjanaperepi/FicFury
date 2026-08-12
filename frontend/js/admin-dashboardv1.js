/* ==========================================================
   ADMIN DASHBOARD
========================================================== */

const Dashboard = {

    stats: {},

    recentRegistrations: [],

    recentActivity: []

};

document.addEventListener(

    "DOMContentLoaded",

    initializeDashboard

);
/* ==========================================================
   INITIALIZATION
========================================================== */

async function initializeDashboard() {

    try {

        showLoading();

        initializeButtons();

        initializeQuickActions();

        loadAdminName();

        await Promise.all([

            loadDashboardStats(),

            loadRecentRegistrations()

        ]);

        hideLoading();

    }

    catch (error) {

        console.error(
            "Dashboard initialization failed:",
            error
        );

        hideLoading();

        Utils.showToast(
            "Unable to load dashboard.",
            "error"
        );

    }

}
/* ==========================================================
   LOADING
========================================================== */

function showLoading() {

    document

        .getElementById("loadingOverlay")

        ?.classList.remove("hidden");

}

function hideLoading() {

    document

        .getElementById("loadingOverlay")

        ?.classList.add("hidden");

}
/* ==========================================================
   USER
========================================================== */

function loadAdminName() {

    const user = Auth.getCurrentUser();
    const displayName = user.fullName || "User";
    if (!user) return;

    document.getElementById("adminName").textContent =
    user.fullName;

}
/* ==========================================================
   BUTTONS
========================================================== */

function initializeButtons() {

    document

        .getElementById("refreshDashboard")

        ?.addEventListener(

            "click",

            initializeDashboard

        );

    document

        .getElementById("createCommitteeBtn")

        ?.addEventListener(

            "click",

            () => {

                window.location.href =

                    "committee-management.html";

            }

        );

}
/* ==========================================================
   QUICK ACTIONS
========================================================== */

function initializeQuickActions() {

    document

        .querySelectorAll(".action-card")

        .forEach(card => {

            card.addEventListener(

                "click",

                () => {

                    const page =

                        card.dataset.page;

                    if (page) {

                        window.location.href = page;

                    }

                }

            );

        });

}
/* ==========================================================
   DASHBOARD STATISTICS
========================================================== */

async function loadDashboardStats() {

    try {

        const stats = await apiRequest( "/dashboard/stats");

        Dashboard.stats = stats;
        updateStatistics(stats);

    }

    catch (error) {

        console.error(

            "Failed to load dashboard statistics:",

            error

        );

        Utils.showToast(

            "Unable to load dashboard statistics.",

            "error"

        );

    }

}


/* ==========================================================
   RECENT REGISTRATIONS
========================================================== */

async function loadRecentRegistrations() {

    try {

        // Reuse the admin registrations endpoint. It is the same source used
        // by delegate management and avoids a separate dashboard-only access
        // rule for this small, derived view.
        const registrations = await apiRequest("/registrations");

       
        console.log(
            "Recent Registrations:",
            registrations
        );

        Dashboard.recentRegistrations = registrations
            .sort((first, second) =>
                new Date(second.registeredAt || 0) -
                new Date(first.registeredAt || 0)
            )
            .slice(0, 5)
            .map(registration => ({
                delegateName: registration.user?.fullName || "-",
                committeeName: registration.committee?.name || "-",
                characterName:
                    registration.character?.name
                    || registration.character?.title
                    || "Not assigned",
                status: registration.workflowStatus || "-",
                registeredAt: registration.registeredAt
            }));

        renderRecentRegistrations();

    }

    catch(error){

        console.error(error);

    }

}


    


/* ==========================================================
   RENDER RECENT REGISTRATIONS
========================================================== */

function renderRecentRegistrations() {

    const tbody = document.getElementById(

        "recentRegistrations"

    );

    if (!tbody) return;

    if (Dashboard.recentRegistrations.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td colspan="3">

                    No registrations available.

                </td>

            </tr>

        `;

        return;

    }

    tbody.innerHTML = Dashboard.recentRegistrations

        .map(createRegistrationRow)

        .join("");

}

/* ==========================================================
   CREATE REGISTRATION ROW
========================================================== */

function createRegistrationRow(registration) {

    return `

        <tr>

            <td>

                ${registration.delegateName}

            </td>

            <td>

                ${registration.committeeName}

            </td>

            <td>

                <span class="status-badge ${registration.status.toLowerCase()}">

                    ${registration.status}

                </span>

            </td>
            <td>

    ${formatRegistrationDate(registration.registeredAt)}

</td>

        </tr>

    `;

}
/* ==========================================================
   UPDATE STATISTICS
========================================================== */

function updateStatistics(stats) {

    document

        .getElementById("userCount")

        .textContent =

        stats.totalUsers ?? 0;

    document

        .getElementById("committeeCount")

        .textContent =

        stats.totalCommittees ?? 0;

    document

        .getElementById("characterCount")

        .textContent =

        stats.totalCharacters ?? 0;

    document

        .getElementById("registrationCount")

        .textContent =

        stats.totalRegistrations ?? 0;

}
function formatRegistrationDate(date) {

    return new Date(date).toLocaleString(

        "en-IN",

        {

            dateStyle: "medium",

            timeStyle: "short"

        }

    );

}
