/* ==========================================================
   FIC FURY
   CHAIR DASHBOARD
========================================================== */

const ChairDashboard = {

    data: null,

    committees: [],

    registrations: [],

    selectedCommittee: null,

    currentSession: null,

    isCreatingSession: false,

    isInitiatingSession: false,

    pollingInterval: null
};


/* ==========================================================
   INITIALIZATION
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    initializeChairDashboard
);


async function initializeChairDashboard() {

    try {

        showLoading();

        prepareDashboardLayout();

        initializeQuickActions();

        initializeSessionButtons();

        await loadChairDashboard();

        hideLoading();

    } catch (error) {

        console.error(
            "Chair Dashboard initialization failed:",
            error
        );

        hideLoading();
    }
}


/* ==========================================================
   DASHBOARD LAYOUT
========================================================== */

function prepareDashboardLayout() {

    /*
     * Remove modules that do not exist in the Chair system.
     */

    removeElementById("attendancePercentage");

    removeElementById("paperCount");

    removeActionByPage(
        "attendance-management.html"
    );

    removeActionByPage(
        "position-papers.html"
    );


    /*
     * Remove the parent stat cards if their
     * elements still exist in the HTML.
     */

    const attendance =
        document.getElementById(
            "attendancePercentage"
        );

    if (attendance) {

        attendance.closest(
            ".stat-card"
        )?.remove();
    }


    const papers =
        document.getElementById(
            "paperCount"
        );

    if (papers) {

        papers.closest(
            ".stat-card"
        )?.remove();
    }


    /*
     * Convert the Quick Actions area into
     * a compact toolbar.
     */

    const quickActions =
        document.querySelector(
            ".quick-actions-grid"
        );

    if (quickActions) {

        quickActions.classList.add(
            "compact-quick-actions"
        );
    }


    /*
     * Add compact styling dynamically so
     * you do not need to change CSS yet.
     */

    if (
        !document.getElementById(
            "chair-dashboard-compact-style"
        )
    ) {

        const style =
            document.createElement("style");

        style.id =
            "chair-dashboard-compact-style";

        style.textContent = `

            /* ==============================
               COMPACT STAT CARDS
            ============================== */

            .stats-grid {

                grid-template-columns:
                    repeat(2, minmax(0, 1fr));

                gap: 18px;

                margin-bottom: 22px;
            }


            .stat-card {

                min-height: 110px;

                padding: 20px 24px;

                display: flex;

                align-items: center;

                gap: 18px;
            }


            .stat-card h2 {

                margin: 0 0 4px;

                font-size: 28px;
            }


            .stat-card p {

                margin: 0;

                font-size: 14px;
            }


            /* ==============================
               COMPACT QUICK ACTIONS
            ============================== */

            .compact-quick-actions {

                display: grid !important;

                grid-template-columns:
                    repeat(4, minmax(0, 1fr));

                gap: 10px !important;

                margin-top: 8px;
            }


            .compact-quick-actions
            .action-card {

                min-height: 0 !important;

                height: auto !important;

                padding: 12px 14px !important;

                display: flex !important;

                align-items: center;

                gap: 10px;

                cursor: pointer;

                transition:
                    transform .15s ease,
                    box-shadow .15s ease;
            }


            .compact-quick-actions
            .action-card:hover {

                transform:
                    translateY(-2px);
            }


            .compact-quick-actions
            .action-icon {

                width: 34px !important;

                height: 34px !important;

                min-width: 34px;

                display: flex;

                align-items: center;

                justify-content: center;
            }


            .compact-quick-actions
            .action-card h3 {

                margin: 0 !important;

                font-size: 14px !important;

                line-height: 1.2;
            }


            .compact-quick-actions
            .action-card p {

                display: none !important;
            }


            /* ==============================
               DEBATE STATUS
            ============================== */

            .debate-status-value {

                text-transform: uppercase;

                font-weight: 800;

                letter-spacing: .5px;
            }


            .status-badge {

                display: inline-flex;

                align-items: center;

                justify-content: center;

                padding: 6px 12px;

                border: 2px solid #000;

                background: #ffd400;

                font-size: 12px;

                font-weight: 800;

                text-transform: uppercase;
            }


            @media (max-width: 900px) {

                .compact-quick-actions {

                    grid-template-columns:
                        repeat(2, 1fr);
                }

            }


            @media (max-width: 600px) {

                .stats-grid {

                    grid-template-columns: 1fr;
                }


                .compact-quick-actions {

                    grid-template-columns: 1fr;
                }

            }

        `;

        document.head.appendChild(style);
    }
}


function removeElementById(id) {

    const element =
        document.getElementById(id);

    if (!element) {
        return;
    }

    const card =
        element.closest(".stat-card");

    if (card) {

        card.remove();

    } else {

        element.remove();
    }
}


function removeActionByPage(page) {

    document
        .querySelectorAll(
            `.action-card[data-page="${page}"]`
        )
        .forEach(card => {

            card.remove();

        });
}


/* ==========================================================
   LOADING
========================================================== */

function showLoading() {

    const overlay =
        document.getElementById(
            "loadingOverlay"
        );

    if (overlay) {

        overlay.classList.remove(
            "hidden"
        );
    }
}


function hideLoading() {

    const overlay =
        document.getElementById(
            "loadingOverlay"
        );

    if (overlay) {

        overlay.classList.add(
            "hidden"
        );
    }
}


/* ==========================================================
   LOAD CHAIR DASHBOARD
========================================================== */

async function loadChairDashboard() {

    const user =
        Auth.getCurrentUser();

    if (!user) {

        throw new Error(
            "No logged in user."
        );
    }


    console.log(
        "Current Chair:",
        user
    );


    const response =
        await apiRequest(
            "/dashboard/chair"
        );


    console.log(
        "Chair Dashboard:",
        response
    );


    ChairDashboard.data =
        response;


    /*
     * The dashboard response already contains
     * the registrations used by the Chair system.
     */

    ChairDashboard.registrations =
        Array.isArray(
            response.registrations
        )
            ? response.registrations
            : [];


    ChairDashboard.committees =
        Array.isArray(
            response.committees
        )
            ? response.committees
            : [];


    if (
        ChairDashboard.committees.length === 0
    ) {

        console.warn(
            "No committees assigned to chair."
        );

        populateHero();

        populateStatistics();

        populateCommittee();

        await loadAnnouncements();

        return;
    }


    ChairDashboard.selectedCommittee =
        ChairDashboard.committees[0];


    populateCommitteeSelector();

    populateHero();

    await refreshSelectedCommittee();

    await loadAnnouncements();
}


/* ==========================================================
   REFRESH SELECTED COMMITTEE
========================================================== */

async function refreshSelectedCommittee() {

    populateHero();

    updateDelegateCount();

    await loadDebateSession();

    updateDebateStatus();

    updateChairDebateRoomAccess();

    populateCommittee();
}


/* ==========================================================
   HERO
========================================================== */

function populateHero() {

    const committee =
        ChairDashboard.selectedCommittee;


    if (!committee) {
        return;
    }


    const chairName =
        document.getElementById(
            "chairName"
        );


    if (chairName) {

        chairName.textContent =
            ChairDashboard.data?.chairName ||
            Auth.getCurrentUser()?.name ||
            "Chairperson";
    }


    const agenda =
        document.getElementById(
            "committeeAgenda"
        );


    if (agenda) {

        agenda.textContent =
            committee.description ||
            "Committee management and debate session";
    }
}


/* ==========================================================
   COMMITTEE SELECTOR
========================================================== */

function populateCommitteeSelector() {

    const selector =
        document.getElementById(
            "committeeSelector"
        );


    if (!selector) {
        return;
    }


    selector.innerHTML = "";


    ChairDashboard.committees.forEach(
        committee => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                committee.id;


            option.textContent =
                committee.name;


            selector.appendChild(
                option
            );
        }
    );


    if (
        ChairDashboard.selectedCommittee
    ) {

        selector.value =
            ChairDashboard.selectedCommittee.id;
    }


    /*
     * Prevent duplicate change listeners.
     */

    selector.onchange =
        async function(event) {

            const committeeId =
                Number(
                    event.target.value
                );


            ChairDashboard.selectedCommittee =
                ChairDashboard.committees.find(
                    committee =>
                        Number(
                            committee.id
                        ) === committeeId
                );


            await refreshSelectedCommittee();
        };
}


/* ==========================================================
   STATISTICS
========================================================== */

function populateStatistics() {

    updateDelegateCount();

    updateDebateStatus();
}


/* ==========================================================
   DELEGATE COUNT
========================================================== */

function updateDelegateCount() {

    const element =
        document.getElementById(
            "delegateCount"
        );


    if (!element) {
        return;
    }


    const committee =
        ChairDashboard.selectedCommittee;


    if (!committee) {

        element.textContent = "0";

        return;
    }


    /*
     * First preference:
     * delegateCount supplied directly
     * by the committee object.
     */

    if (
        committee.delegateCount !==
        undefined &&
        committee.delegateCount !== null
    ) {

        element.textContent =
            committee.delegateCount;

        return;
    }


    /*
     * Second preference:
     * a delegates array on the committee.
     */

    if (
        Array.isArray(
            committee.delegates
        )
    ) {

        element.textContent =
            committee.delegates.length;

        return;
    }


    /*
     * Third preference:
     * count registrations belonging
     * to the selected committee.
     *
     * ACTIVE is the live delegate status.
     */

    const committeeName =
        String(
            committee.name || ""
        )
            .trim()
            .toLowerCase();


    const activeDelegates =
        ChairDashboard.registrations.filter(
            registration => {

                const registrationCommittee =
                    String(
                        registration.committeeName ||
                        registration.committee?.name ||
                        ""
                    )
                        .trim()
                        .toLowerCase();


                const status =
                    String(
                        registration.workflowStatus ||
                        registration.status ||
                        ""
                    )
                        .trim()
                        .toUpperCase();


                return (
                    registrationCommittee ===
                    committeeName
                    &&
                    (
                        status === "ACTIVE" ||
                        status === "APPROVED"
                    )
                );
            }
        );


    element.textContent =
        activeDelegates.length;
}


/* ==========================================================
   DEBATE SESSION
========================================================== */

async function loadDebateSession() {

    const user =
        Auth.getCurrentUser();


    const committee =
        ChairDashboard.selectedCommittee;


    if (!user || !committee) {

        ChairDashboard.currentSession =
            null;

        return;
    }


    try {

        const response =
            await apiRequest(
                `/debate/sessions/chair/${user.id}`
            );


        /*
         * Some APIs return a single session,
         * while others return a list.
         */

        if (
            Array.isArray(response)
        ) {

            ChairDashboard.currentSession =
                response.find(
                    session =>
                        Number(
                            session.committeeId
                        ) ===
                        Number(
                            committee.id
                        )
                ) || null;

        } else {

            const responseCommitteeId =
                response?.committeeId ??
                response?.committee?.id;


            if (
                responseCommitteeId ===
                undefined ||
                Number(
                    responseCommitteeId
                ) ===
                Number(
                    committee.id
                )
            ) {

                ChairDashboard.currentSession =
                    response;

            } else {

                ChairDashboard.currentSession =
                    null;
            }
        }


} catch (error) {

    console.error(
        "Failed to load debate session:",
        error
    );

    ChairDashboard.currentSession =
        null;
}
}


/* ==========================================================
   DEBATE STATUS
========================================================== */
/* ==========================================================
   DEBATE STATUS STAT CARD
========================================================== */

function updateDebateStatus() {

    /*
     * The stat card should always reflect the
     * currently selected committee's debate session.
     */

    const session =
        ChairDashboard.currentSession;


    /* ------------------------------------------
       Find the status value element
    ------------------------------------------ */

    const statusElement =
        document.getElementById(
            "activeDebates"
        );


    if (!statusElement) {

        console.warn(
            "Debate status stat element (#activeDebates) not found."
        );

        return;
    }


    /* ------------------------------------------
       Determine status
    ------------------------------------------ */

    let status =
        "NO SESSION";


    if (session?.status) {

        status =
            String(session.status)
                .replace(/_/g, " ")
                .toUpperCase();
    }


    /* ------------------------------------------
       Update displayed value
    ------------------------------------------ */

    statusElement.textContent =
        status;


    statusElement.classList.add(
        "debate-status-value"
    );


    /* ------------------------------------------
       Find the stat card
    ------------------------------------------ */

    const card =
        statusElement.closest(
            ".stat-card"
        );


    if (!card) {
        return;
    }


    /* ------------------------------------------
       Update label
    ------------------------------------------ */

    const label =
        card.querySelector("p");


    if (label) {

        label.textContent =
            "Debate Status";
    }


    /* ------------------------------------------
       Remove old status classes
    ------------------------------------------ */

    card.classList.remove(
        "status-active",
        "status-draft",
        "status-pending",
        "status-stopped",
        "status-archived",
        "status-none"
    );


    /* ------------------------------------------
       Apply status class
    ------------------------------------------ */

    switch (session?.status) {

        case "ACTIVE":

            card.classList.add(
                "status-active"
            );

            break;


        case "DRAFT":

            card.classList.add(
                "status-draft"
            );

            break;


        case "AWAITING_ADMIN_APPROVAL":

            card.classList.add(
                "status-pending"
            );

            break;


        case "STOPPED":

            card.classList.add(
                "status-stopped"
            );

            break;


        case "ARCHIVED":

            card.classList.add(
                "status-archived"
            );

            break;


        default:

            card.classList.add(
                "status-none"
            );

            break;
    }


    /* ------------------------------------------
       Responsive font size
    ------------------------------------------ */

    if (status.length > 18) {

        statusElement.style.fontSize =
            "16px";

    } else if (status.length > 12) {

        statusElement.style.fontSize =
            "19px";

    } else {

        statusElement.style.fontSize =
            "26px";
    }
}
function updateChairDebateRoomAccess() {

    const button =
        document.querySelector(
            '.quick-action[data-page="debate-room.html"]'
        );

    if (!button) {
        return;
    }

    const active =
        ChairDashboard.currentSession?.status ===
        "ACTIVE";


    if (active) {

        button.classList.remove(
            "debate-room-disabled"
        );

        button.dataset.sessionActive =
            "true";

    } else {

        button.classList.add(
            "debate-room-disabled"
        );

        button.dataset.sessionActive =
            "false";

    }

}
/* ==========================================================
   COMMITTEE SESSION CARD
========================================================== */

function populateCommittee() {

    const committee =
        ChairDashboard.selectedCommittee;

    if (!committee) {
        return;
    }

    /* ------------------------------------------
       Committee name
    ------------------------------------------ */

    const name =
        document.getElementById(
            "debateCommitteeName"
        );

    if (name) {
        name.textContent =
            committee.name || "Committee";
    }


    /* ------------------------------------------
       Session status badge
    ------------------------------------------ */

    const badge =
        document.getElementById(
            "sessionStatusBadge"
        );

    const session =
        ChairDashboard.currentSession;


    if (badge) {

        let status = "NO SESSION";

        if (session?.status) {

            status =
                String(session.status)
                    .replace(/_/g, " ")
                    .toUpperCase();
        }

        badge.textContent = status;


        /* Reset classes */

        badge.className =
            "status-badge";


        /* Add state-specific class */

        switch (session?.status) {

            case "ACTIVE":
                badge.classList.add("active");
                break;

            case "DRAFT":
                badge.classList.add("draft");
                break;

            case "AWAITING_ADMIN_APPROVAL":
                badge.classList.add("pending");
                break;

            case "STOPPED":
                badge.classList.add("stopped");
                break;

            case "ARCHIVED":
                badge.classList.add("archived");
                break;

            default:
                badge.classList.add("draft");
                break;
        }
    }


    /* ------------------------------------------
       Render the correct session controls
    ------------------------------------------ */

    renderSessionControls();
}
/* ==========================================================
   SESSION CONTROLS
========================================================== */

function renderSessionControls() {

    const session =
        ChairDashboard.currentSession;


    /* ------------------------------------------
       Find whichever session button currently
       exists in the HTML
    ------------------------------------------ */

    let button =
        document.getElementById(
            "createSessionBtn"
        );


    if (!button) {

        button =
            document.getElementById(
                "initiateSessionBtn"
            );
    }


    if (!button) {
        return;
    }


    /* ------------------------------------------
       NO SESSION
    ------------------------------------------ */

    if (
        !session ||
        session.status === "ARCHIVED"
    ) {

        button.id =
            "createSessionBtn";

        button.className =
            "btn btn-primary";

        button.disabled = false;

        button.innerHTML = `
            <i class="fa-solid fa-plus"></i>
            Create Debate Session
        `;


        /* Remove old listener */

        button.onclick = null;


        /* Add create listener */

        button.onclick =
            createDebateSession;


        return;
    }


    /* ------------------------------------------
       DRAFT
    ------------------------------------------ */

    if (
        session.status === "DRAFT"
    ) {

        button.id =
            "initiateSessionBtn";

        button.className =
            "btn btn-success";

        button.disabled = false;

        button.innerHTML = `
            <i class="fa-solid fa-play"></i>
            Initiate Session
        `;


        button.onclick = null;

        button.onclick =
            initiateDebateSession;


        return;
    }


    /* ------------------------------------------
       AWAITING ADMIN APPROVAL
    ------------------------------------------ */

    if (
        session.status ===
        "AWAITING_ADMIN_APPROVAL"
    ) {

        button.id =
            "sessionPendingBtn";

        button.className =
            "btn btn-warning";

        button.disabled = true;

        button.innerHTML = `
            <i class="fa-solid fa-clock"></i>
            Awaiting Admin Approval
        `;


        button.onclick = null;


        return;
    }


    /* ------------------------------------------
       ACTIVE
    ------------------------------------------ */

    if (
        session.status === "ACTIVE"
    ) {

        button.id =
            "activeSessionBtn";

        button.className =
            "btn btn-success";

        button.disabled = false;

        button.innerHTML = `
            <i class="fa-solid fa-comments"></i>
            Debate Session Active
        `;


        button.onclick = null;


        /*
         * We don't invent a new backend endpoint here.
         * The Debate Room remains accessible through
         * the sidebar / Quick Actions.
         */

        return;
    }



/* ------------------------------------------
   STOPPED
------------------------------------------ */

if (session.status === "STOPPED") {

    /*
     * The previous session has ended.
     * Creating a new session will produce a
     * fresh DRAFT session.
     */

    button.id = "createSessionBtn";

    button.className = "btn btn-primary";

    button.disabled = false;

    button.innerHTML = `
        <i class="fa-solid fa-plus"></i>
        Create Debate Session
    `;

    button.onclick = null;

    button.onclick = createDebateSession;

    return;
}

    /* ------------------------------------------
       FALLBACK
    ------------------------------------------ */

    button.id =
        "sessionStatusBtn";

    button.className =
        "btn btn-secondary";

    button.disabled = true;

    button.innerHTML = `
        <i class="fa-solid fa-circle-info"></i>
        ${String(session.status || "Session")}
    `;

    button.onclick = null;
}
/* ==========================================================
   QUICK ACTIONS
========================================================== */

function initializeQuickActions() {

    document
        .querySelectorAll(
            ".action-card"
        )
        .forEach(card => {

            card.addEventListener(
                "click",
                () => {

                    const page =
                        card.dataset.page;


                    if (page) {

                        window.location.href =
                            page;
                    }
                }
            );
        });
}


/* ==========================================================
   SESSION BUTTONS
========================================================== */

function initializeSessionButtons() {

    const createBtn =
        document.getElementById(
            "createSessionBtn"
        );


    if (createBtn) {

        createBtn.addEventListener(
            "click",
            createDebateSession
        );
    }
}


/* ==========================================================
   CREATE DEBATE SESSION
========================================================== */

async function createDebateSession() {

    if (
        ChairDashboard.isCreatingSession
    ) {
        return;
    }


    const committee =
        ChairDashboard.selectedCommittee;


    if (!committee) {

        alert(
            "Please select a committee first."
        );

        return;
    }


if (
    ChairDashboard.currentSession &&
    !["ARCHIVED", "STOPPED"].includes(
        ChairDashboard.currentSession.status
    )
) {

    alert(
        "A debate session already exists for this committee."
    );

    return;
}


    ChairDashboard.isCreatingSession =
        true;


    const createBtn =
        document.getElementById(
            "createSessionBtn"
        );


    try {

        const user =
            Auth.getCurrentUser();


        if (createBtn) {

            createBtn.disabled =
                true;

            createBtn.innerHTML =
                `
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    Creating...
                `;
        }


        const response =
            await apiRequest(
                "/debate/sessions",
                "POST",
                {
                    committeeId:
                        committee.id,

                    chairId:
                        user.id
                }
            );


        ChairDashboard.currentSession =
            response;


        updateDebateStatus();

        populateCommittee();


if (createBtn) {
    renderSessionControls();
}


    } catch (error) {

        console.error(
            "Failed to create debate session:",
            error
        );


        if (createBtn) {

            createBtn.disabled =
                false;

            createBtn.innerHTML =
                `
                    <i class="fa-solid fa-plus"></i>
                    Create Debate Session
                `;
        }


        alert(
            "Failed to create debate session."
        );


    } finally {

        ChairDashboard.isCreatingSession =
            false;
    }
}


/* ==========================================================
   INITIATE DEBATE SESSION
========================================================== */

async function initiateDebateSession() {

    const session =
        ChairDashboard.currentSession;


    if (!session) {
        return;
    }


    if (
        session.status !==
        "DRAFT"
    ) {

        alert(
            "Only draft sessions can be initiated."
        );

        return;
    }


    if (
        ChairDashboard.isInitiatingSession
    ) {
        return;
    }


    ChairDashboard.isInitiatingSession =
        true;


    const button =
        document.getElementById(
            "initiateSessionBtn"
        );


    try {

        if (button) {

            button.disabled =
                true;

            button.innerHTML =
                `
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    Initiating...
                `;
        }


        const response =
            await apiRequest(
                `/debate/sessions/${session.id}/initiate`,
                "POST"
            );


        ChairDashboard.currentSession =
            response;


        updateDebateStatus();

        populateCommittee();


        startSessionPolling();


    } catch (error) {

        console.error(
            "Failed to initiate session:",
            error
        );


        if (button) {

            button.disabled =
                false;

            button.innerHTML =
                `
                    <i class="fa-solid fa-play"></i>
                    Initiate Session
                `;
        }


        alert(
            "Failed to initiate session."
        );


    } finally {

        ChairDashboard.isInitiatingSession =
            false;
    }
}


/* ==========================================================
   SESSION POLLING
========================================================== */

async function pollSessionStatus() {

    const session =
        ChairDashboard.currentSession;


    if (!session) {
        return;
    }


    try {

        const latest =
            await apiRequest(
                `/debate/sessions/${session.id}`
            );


        ChairDashboard.currentSession =
            latest;


        updateDebateStatus();

        populateCommittee();


        if (
            latest.status === "ACTIVE" ||
            latest.status === "STOPPED" ||
            latest.status === "ARCHIVED"
        ) {

            stopSessionPolling();
        }


    } catch (error) {

        console.error(
            "Failed to update debate status:",
            error
        );
    }
}


function startSessionPolling() {

    stopSessionPolling();


    ChairDashboard.pollingInterval =
        setInterval(
            pollSessionStatus,
            5000
        );
}


function stopSessionPolling() {

    if (
        ChairDashboard.pollingInterval
    ) {

        clearInterval(
            ChairDashboard.pollingInterval
        );

        ChairDashboard.pollingInterval =
            null;
    }
}


/* ==========================================================
   ANNOUNCEMENTS
========================================================== */

async function loadAnnouncements() {

    const container =
        document.getElementById(
            "committeeActivity"
        );


    if (!container) {
        return;
    }


    try {

        const announcements =
            await apiRequest(
                "/announcements/my",
                "GET"
            );


        if (
            !announcements ||
            announcements.length === 0
        ) {

            container.innerHTML = `
                <div class="activity-item">

                    <div class="activity-icon">
                        <i class="fa-solid fa-bullhorn"></i>
                    </div>

                    <div>

                        <strong>
                            No announcements
                        </strong>

                        <p>
                            There are currently
                            no announcements.
                        </p>

                    </div>

                </div>
            `;

            return;
        }


        container.innerHTML =
            announcements
                .map(
                    announcement =>
                        createAnnouncementItem(
                            announcement
                        )
                )
                .join("");


    } catch (error) {

        console.error(
            "Failed to load announcements:",
            error
        );


        container.innerHTML = `
            <div class="activity-item">

                <div class="activity-icon">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                </div>

                <div>

                    <strong>
                        Unable to load announcements
                    </strong>

                    <p>
                        Please refresh the dashboard.
                    </p>

                </div>

            </div>
        `;
    }
}


function createAnnouncementItem(
    announcement
) {

    const title =
        escapeText(
            announcement.title ||
            "Announcement"
        );


    const content =
        escapeText(
            announcement.content ||
            ""
        );


    const committeeName =
        escapeText(
            announcement.committeeName ||
            "Global Announcement"
        );


    const createdBy =
        escapeText(
            announcement.createdByName ||
            announcement.createdBy ||
            "Administration"
        );


    const publishedAt =
        announcement.publishedAt ||
        announcement.createdAt;


    return `
        <div class="activity-item announcement-item">

            <div class="activity-icon">

                <i class="fa-solid fa-bullhorn"></i>

            </div>

            <div class="announcement-content">

                <strong>
                    ${title}
                </strong>

                <p>
                    ${content}
                </p>

                <small>

                    <i class="fa-solid fa-building"></i>

                    ${committeeName}

                    &nbsp;•&nbsp;

                    ${createdBy}

                    &nbsp;•&nbsp;

                    ${formatDate(
                        publishedAt
                    )}

                </small>

            </div>

        </div>
    `;
}


/* ==========================================================
   HELPERS
========================================================== */

function escapeText(value) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        String(
            value ?? ""
        );

    return div.innerHTML;
}


function formatDate(date) {

    if (!date) {
        return "";
    }


    const parsed =
        new Date(date);


    if (
        Number.isNaN(
            parsed.getTime()
        )
    ) {

        return "";
    }


    return parsed.toLocaleString(
        "en-IN",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );
}