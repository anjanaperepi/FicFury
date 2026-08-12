/* ==========================================================
   FIC FURY
   ADMIN DASHBOARD / COMMAND CENTER
========================================================== */

const Dashboard = {

    stats: {},

    recentRegistrations: [],

    recentActivity: [],

    committees: []

};

document.addEventListener("DOMContentLoaded", initializeDashboard);


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
            loadRecentRegistrations(),
            loadCommittees()
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

    if (!user) {
        return;
    }

    const nameElement =
        document.getElementById("adminName");

    if (nameElement) {

        nameElement.textContent =
            user.fullName || "Administrator";
    }
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
        .querySelectorAll(".quick-action-item")
        .forEach(item => {

            item.addEventListener(
                "click",
                () => {

                    const page =
                        item.dataset.page;

                    if (page) {

                        window.location.href =
                            page;
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

        const stats =
            await apiRequest(
                "/dashboard/stats"
            );

        Dashboard.stats = stats;

        updateStatistics(stats);

    } catch (error) {

        console.error(
            "Failed to load dashboard statistics:",
            error
        );

        updateStatistics({});
    }
}


function updateStatistics(stats) {

    const values = {

        userCount:
            stats?.totalUsers ?? 0,

        committeeCount:
            stats?.totalCommittees ?? 0,

        characterCount:
            stats?.totalCharacters ?? 0,

        registrationCount:
            stats?.totalRegistrations ?? 0
    };


    Object.entries(values).forEach(
        ([id, value]) => {

            const element =
                document.getElementById(id);

            if (element) {

                element.textContent =
                    value;
            }
        }
    );


    updatePulseCounts(
        values.committeeCount,
        values.registrationCount
    );
}


function updatePulseCounts(
    committeeCount,
    registrationCount
) {

    const committeeElement =
        document.getElementById(
            "pulseCommitteeCount"
        );


    const registrationElement =
        document.getElementById(
            "pulseRegistrationCount"
        );


    if (committeeElement) {

        committeeElement.textContent =
            committeeCount;
    }


    if (registrationElement) {

        registrationElement.textContent =
            registrationCount;
    }
}


/* ==========================================================
   COMMITTEES
========================================================== */



async function loadCommittees() {

    const container =
        document.getElementById(
            "committeeSpotlight"
        );

    if (!container) {
        console.warn(
            "committeeSpotlight container not found."
        );
        return;
    }

    try {

        container.innerHTML = `
            <div class="committee-loading">
                <i class="fa-solid fa-spinner fa-spin"></i>
                Loading committees...
            </div>
        `;

        const response =
            await apiRequest(
                "/committees",
                "GET"
            );

        console.log(
            "🏛️ Committees loaded:",
            response
        );

        const committees =
            Array.isArray(response)
                ? response
                : (
                    response?.data ||
                    response?.content ||
                    []
                );

        Dashboard.committees =
            committees;

        renderCommitteeSpotlight();

    } catch (error) {

        console.error(
            "Failed to load committees:",
            error
        );

        Dashboard.committees = [];

        container.innerHTML = `
            <div class="committee-empty">

                <div class="committee-empty-icon">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                </div>

                <h3>
                    Unable to load committees
                </h3>

                <p>
                    We couldn't retrieve the committee list.
                    Try refreshing the dashboard.
                </p>

            </div>
        `;
    }
}

/* ==========================================================
   COMMITTEE SPOTLIGHT
========================================================== */

function renderCommitteeSpotlight() {

    const container =
        document.getElementById(
            "committeeSpotlight"
        );


    if (!container) {
        return;
    }


    if (
        !Dashboard.committees ||
        Dashboard.committees.length === 0
    ) {

        container.innerHTML = `

            <div class="committee-empty">

                <i
                    class="fa-solid fa-building-columns">
                </i>

                <strong>
                    No committees available
                </strong>

                <span>
                    Create your first fictional committee
                    to get started.
                </span>

            </div>
        `;

        return;
    }


    const committees =
        [...Dashboard.committees]
            .sort(sortByDate)
            .slice(0, 3);


    container.innerHTML =
        committees
            .map(createCommitteeCard)
            .join("");
}


/* ==========================================================
   COMMITTEE CARD
========================================================== */

function createCommitteeCard(committee) {

    const name =
        committee?.name ||
        "Untitled Committee";


    const category =
        committee?.category ||
        committee?.type ||
        "FICTION";


    const mode =
        committee?.mode ||
        "ONLINE";


    const chair =
        committee?.chairpersonName ||
        "Chair not assigned";


    const date =
        formatCommitteeDate(
            committee?.date
        );


    const time =
        committee?.time ||
        "";


    const metaDate =
        date === "-"
            ? ""
            : date;


    return `

        <article class="committee-card">

            <div class="committee-card-top">

                <span class="committee-type">
                    ${escapeHtml(category)}
                </span>

                <span class="committee-mode">
                    ${escapeHtml(mode)}
                </span>

            </div>


            <h3>
                ${escapeHtml(name)}
            </h3>


            <div class="committee-meta">

                <span>

                    <i
                        class="fa-regular fa-calendar">
                    </i>

                    ${escapeHtml(
                        metaDate ||
                        "Date TBA"
                    )}

                </span>


                ${
                    time
                        ? `

                            <span>

                                <i
                                    class="fa-regular fa-clock">
                                </i>

                                ${escapeHtml(time)}

                            </span>

                        `
                        : ""
                }

            </div>


            <div class="committee-card-footer">

                <span class="committee-chair">

                    Chair:

                    <strong>
                        ${escapeHtml(chair)}
                    </strong>

                </span>


                <a
                    class="committee-manage"
                    href="committee-management.html">

                    Manage

                    <i
                        class="fa-solid fa-arrow-right">
                    </i>

                </a>

            </div>

        </article>

    `;
}


/* ==========================================================
   NEXT SESSION
========================================================== */

function updateNextSession() {

    const nameElement =
        document.getElementById(
            "nextSessionName"
        );


    const metaElement =
        document.getElementById(
            "nextSessionMeta"
        );


    if (
        !Dashboard.committees ||
        Dashboard.committees.length === 0
    ) {

        if (nameElement) {

            nameElement.textContent =
                "No sessions scheduled";
        }


        if (metaElement) {

            metaElement.textContent =
                "Create a committee to begin";
        }


        return;
    }


    const sorted =
        [...Dashboard.committees]
            .sort(sortByDate);


    const next =
        sorted.find(
            committee =>
                parseCommitteeDate(
                    committee?.date
                ) !== null
        ) ||
        sorted[0];


    if (nameElement) {

        nameElement.textContent =
            next?.name ||
            "Upcoming session";
    }


    if (metaElement) {

        const date =
            formatCommitteeDate(
                next?.date
            );


        const time =
            next?.time
                ? ` • ${next.time}`
                : "";


        metaElement.textContent =
            `${date}${time}`;
    }
}


/* ==========================================================
   DATE SORTING
========================================================== */

function sortByDate(first, second) {

    const firstDate =
        parseCommitteeDate(
            first?.date
        );


    const secondDate =
        parseCommitteeDate(
            second?.date
        );


    if (firstDate === null) {
        return 1;
    }


    if (secondDate === null) {
        return -1;
    }


    return firstDate - secondDate;
}


function parseCommitteeDate(value) {

    if (!value) {
        return null;
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return null;
    }


    return date;
}


function formatCommitteeDate(value) {

    const date =
        parseCommitteeDate(value);


    if (!date) {
        return "-";
    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
}


/* ==========================================================
   RECENT REGISTRATIONS
========================================================== */

async function loadRecentRegistrations() {

    try {

        const registrations =
            await apiRequest(
                "/registrations"
            );


        Dashboard.recentRegistrations =

            (
                Array.isArray(registrations)
                    ? registrations
                    : (
                        registrations?.data ||
                        registrations?.content ||
                        []
                    )
            )

            .sort(
                (first, second) =>

                    new Date(
                        second.registeredAt || 0
                    ) -

                    new Date(
                        first.registeredAt || 0
                    )
            )

            .slice(0, 5)

            .map(
                registration => ({

                    delegateName:
                        registration.user?.fullName ||
                        "-",

                    committeeName:
                        registration.committee?.name ||
                        "-",

                    status:
                        registration.workflowStatus ||
                        "-",

                    registeredAt:
                        registration.registeredAt
                })
            );


        renderRecentRegistrations();

    } catch (error) {

        console.error(
            "Failed to load recent registrations:",
            error
        );


        Dashboard.recentRegistrations = [];

        renderRecentRegistrations();
    }
}


/* ==========================================================
   RENDER RECENT REGISTRATIONS
========================================================== */

function renderRecentRegistrations() {

    const tbody =
        document.getElementById(
            "recentRegistrations"
        );


    if (!tbody) {
        return;
    }


    if (
        Dashboard.recentRegistrations.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    class="table-empty">

                    No registrations available.

                </td>

            </tr>

        `;

        return;
    }


    tbody.innerHTML =

        Dashboard.recentRegistrations

            .map(
                createRegistrationRow
            )

            .join("");
}


/* ==========================================================
   REGISTRATION ROW
========================================================== */

function createRegistrationRow(
    registration
) {

    const status =
        String(
            registration.status || "-"
        ).toLowerCase();


    return `

        <tr>

            <td>
                ${escapeHtml(
                    registration.delegateName
                )}
            </td>


            <td>
                ${escapeHtml(
                    registration.committeeName
                )}
            </td>


            <td>

                <span
                    class="status-badge ${escapeHtml(status)}">

                    ${escapeHtml(
                        registration.status
                    )}

                </span>

            </td>


            <td>

                ${formatRegistrationDate(
                    registration.registeredAt
                )}

            </td>

        </tr>

    `;
}


/* ==========================================================
   REGISTRATION DATE
========================================================== */

function formatRegistrationDate(date) {

    if (!date) {
        return "-";
    }


    const parsed =
        new Date(date);


    if (
        Number.isNaN(
            parsed.getTime()
        )
    ) {

        return "-";
    }


    return parsed.toLocaleString(
        "en-IN",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );
}


/* ==========================================================
   HTML SAFETY
========================================================== */

function escapeHtml(value) {

    return String(
        value ?? ""
    )

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );
}