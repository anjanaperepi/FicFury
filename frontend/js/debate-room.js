const DebateRoom = {

    state: {

        token: null,

        role: null,

        user: null,

        committeeId: null,

        sessionId: null,

        committee: null,

        timerInterval: null,

        session: null

    },



    elements: {},



async init() {

    this.loadLoggedInUser();
    console.log(this.state);

    if (this.state.role === "ADMIN") {

        window.location.href =
            "admin-session-management.html";

        return;

    }

    this.cacheElements();

    this.setupRoleView();

const sessionLoaded = await this.loadActiveSession();

if (!sessionLoaded) {
    console.error(
        "Debate Room initialization stopped: no valid session."
    );
    return;
}

    this.renderCommittee();
    
this.renderSessionStatus(); 

    this.registerEvents();
    this.initializeWorkspaceTabs();

    await SpeakerQueue.init(this);

await MotionPanel.init(this);
await ResolutionCenter.init(this);
await AmendmentCenter.init(this);
await VotingCenter.init(this);
await ResultsCenter.init(this);
await TimelineCenter.init(this);
await this.loadAnnouncements();

},



loadLoggedInUser() {

    this.state.token =
        localStorage.getItem(CONFIG.TOKEN_KEY);

    this.state.committeeId =
        localStorage.getItem("committeeId");

    const storedUser =
        localStorage.getItem(CONFIG.USER_KEY);

    if (!this.state.token) {
        DebateUtils.redirectToLogin();
        return;
    }

    if (!storedUser) {
        console.error(
            "No logged-in user found."
        );

        DebateUtils.redirectToLogin();
        return;
    }

    try {

        this.state.user =
            JSON.parse(storedUser);

    } catch (error) {

        console.error(
            "Invalid user data:",
            error
        );

        localStorage.removeItem(
            CONFIG.USER_KEY
        );

        DebateUtils.redirectToLogin();

        return;
    }

    this.state.role =
        this.state.user?.role ?? null;


    console.log(
        "Debate Room user:",
        this.state.user
    );

    console.log(
        "Debate Room committeeId:",
        this.state.committeeId
    );

    console.log(
        "Debate Room role:",
        this.state.role
    );
},



    cacheElements() {

            this.elements = {

        committeeName:
            document.getElementById("committeeName"),

        chairName:
            document.getElementById("chairName"),

        committeeMode:
            document.getElementById("committeeMode"),

        sessionTimer:
            document.getElementById("sessionTimer"),

        delegatePanel:
            document.getElementById("delegatePanel"),

        chairPanel:
            document.getElementById("chairPanel"),

       

        startSpeakerBtn:
            document.getElementById("startSpeakerBtn"),

        pauseSpeakerBtn:
            document.getElementById("pauseSpeakerBtn"),

        resumeSpeakerBtn:
            document.getElementById("resumeSpeakerBtn"),

        skipSpeakerBtn:
            document.getElementById("skipSpeakerBtn"),

        completeSpeakerBtn:
            document.getElementById("completeSpeakerBtn"),

        extendTimeBtn:
            document.getElementById("extendTimeBtn"),


sessionStatus:
    document.getElementById("chairSessionStatus") ?? null,

sessionBadge:
    document.getElementById("sessionBadge") ?? null,


chairSessionBadge:
    document.getElementById("chairSessionBadge") ?? null,

        startSessionBtn:
            document.getElementById("startSessionBtn"),

        stopSessionBtn:
            document.getElementById("stopSessionBtn"),



        exitDebateBtn:
    document.getElementById("exitDebateBtn"),
    };

    },



setupRoleView() {

    const panels = [

        this.elements.delegatePanel,

        this.elements.chairPanel,

        

    ];

    panels.forEach(panel => {

        if (panel) {

            panel.classList.add("hidden");

        }

    });

    switch (this.state.role) {

        case "DELEGATE":

            this.elements.delegatePanel?.classList.remove("hidden");

            break;

        case "CHAIR":

            this.elements.chairPanel?.classList.remove("hidden");

            break;



        default:

            console.error("Unknown role:", this.state.role);

    }

},


async loadActiveSession() {

    try {

        let session;

        // ================================
        // CHAIR
        // ================================
        if (this.state.role === "CHAIR") {

            if (!this.state.user?.id) {
                console.error("Chair user ID is missing.");
                DebateUtils.showToast(
                    "Unable to identify chair."
                );
                return false;
            }

            session = await DebateAPI.get(
                `/debate/sessions/chair/${this.state.user.id}`
            );

        }

        // ================================
        // DELEGATE
        // ================================
        else if (this.state.role === "DELEGATE") {

            if (!this.state.committeeId) {
                console.error(
                    "Committee ID is missing."
                );

                DebateUtils.showToast(
                    "No committee selected."
                );

                return false;
            }

            session = await DebateAPI.get(
                `/debate/sessions/active/${this.state.committeeId}`
            );

        }

        // ================================
        // INVALID ROLE
        // ================================
        else {

            console.error(
                "Unknown role:",
                this.state.role
            );

            DebateUtils.showToast(
                "Invalid user role."
            );

            return false;
        }


        // ================================
        // VALIDATE SESSION
        // ================================
        if (!session || !session.id) {

            console.error(
                "Invalid session response:",
                session
            );

            DebateUtils.showToast(
                "No debate session found."
            );

            return false;
        }


        // ================================
        // STORE SESSION
        // ================================
this.state.session = session;
this.state.sessionId = session.id;

console.log(
    "Loaded Session:",
    session
);

console.log(
    "Session ID:",
    this.state.sessionId
);

this.startSessionTimer();

return true;

    }
    catch (error) {

        console.error(
            "LOAD SESSION ERROR:",
            error
        );

        if (error.response) {

            console.log(
                "Status:",
                error.response.status
            );

            console.log(
                "Body:",
                error.response.data
            );
        }

        this.state.session = null;
        this.state.sessionId = null;

if (!session || !session.id) {

    console.log(
        "No active debate session yet."
    );

    this.state.session = null;
    this.state.sessionId = null;

    return false;
}

        return false;
    }
},

isSessionActive() {

    return (
        this.state.session &&
        this.state.session.status === "ACTIVE"
    );

},

renderCommittee() {

    if (!this.state.session)
        return;

    const session = this.state.session;

    this.elements.committeeName.textContent =
        session.committeeName ?? "Not Available";

    this.elements.chairName.textContent =
        session.chairName ?? "Not Assigned";

    this.elements.committeeMode.textContent =
        session.committeeMode ??
        session.mode ??
        "Not Specified";

},



registerEvents() {

    console.log("Registering events...");

    const startSessionBtn =
        this.elements.startSessionBtn;

    if (startSessionBtn) {

        startSessionBtn.addEventListener(
            "click",
            () => this.initiateSession()
        );

    }

    const stopSessionBtn =
    this.elements.stopSessionBtn;

    if (stopSessionBtn) {

        stopSessionBtn.addEventListener(
            "click",
            () => this.stopSession()
        );
    

    }

    const publishAnnouncementBtn =
    document.getElementById("publishAnnouncementBtn");

if (publishAnnouncementBtn) {

    publishAnnouncementBtn.addEventListener(
        "click",
        () => this.publishAnnouncement()
    );

}

if (this.elements.exitDebateBtn) {

    this.elements.exitDebateBtn.addEventListener(
        "click",
        () => this.exitDebate()
    );

}

    

},

async initiateSession() {

    try {

        const session = await DebateAPI.post(

            `/debate/sessions/${this.state.sessionId}/initiate`

        );

        DebateUtils.showToast("Debate session initiated.");

        this.state.session = session;

        this.renderSessionStatus();
        await SpeakerQueue.refresh();

    }
    catch (error) {

        console.error(error);

        DebateUtils.showToast(error.message);

    }



},
renderSessionStatus() {

    if (!this.state.session) {
        return;
    }

    const status = this.state.session.status;

    const headerBadge = this.elements.sessionBadge;
    const chairBadge = this.elements.chairSessionBadge;
    const chairStatus = this.elements.sessionStatus;

    const startBtn = this.elements.startSessionBtn;
    const stopBtn = this.elements.stopSessionBtn;


    // =========================================
    // SESSION STATUS
    // =========================================

    let statusText = status;
    let badgeText = status;
    let badgeClass = "session-status waiting";


    switch (status) {

        case "DRAFT":

            statusText = "Draft";
            badgeText = "DRAFT";
            badgeClass = "session-status waiting";

            if (startBtn) {
                startBtn.disabled = false;
            }

            if (stopBtn) {
                stopBtn.disabled = true;
            }

            break;


        case "INITIATED":

            statusText = "Awaiting Admin Approval";
            badgeText = "PENDING";
            badgeClass = "session-status pending";

            if (startBtn) {
                startBtn.disabled = true;
            }

            if (stopBtn) {
                stopBtn.disabled = true;
            }

            break;


        case "ACTIVE":

            statusText = "Debate Live";
            badgeText = "LIVE";
            badgeClass = "session-status live";

            if (startBtn) {
                startBtn.disabled = true;
            }

            if (stopBtn) {
                stopBtn.disabled = false;
            }

            break;


        case "STOPPED":

            statusText = "Debate Ended";
            badgeText = "ENDED";
            badgeClass = "session-status ended";

            if (startBtn) {
                startBtn.disabled = true;
            }

            if (stopBtn) {
                stopBtn.disabled = true;
            }

            break;


        case "ARCHIVED":

            statusText = "Archived";
            badgeText = "ARCHIVED";
            badgeClass = "session-status archived";

            if (startBtn) {
                startBtn.disabled = true;
            }

            if (stopBtn) {
                stopBtn.disabled = true;
            }

            break;


        default:

            statusText = status;
            badgeText = status;

            if (startBtn) {
                startBtn.disabled = true;
            }

            if (stopBtn) {
                stopBtn.disabled = true;
            }

            break;
    }


    // =========================================
    // TOP HEADER
    // =========================================

    if (headerBadge) {

        headerBadge.textContent = badgeText;
        headerBadge.className = badgeClass;

    }


    // =========================================
    // CHAIR SESSION BADGE
    // =========================================

    if (chairBadge) {

        chairBadge.textContent = badgeText;
        chairBadge.className = badgeClass;

    }


    // =========================================
    // CHAIR STATUS TEXT
    // =========================================

    if (chairStatus) {

        chairStatus.textContent = statusText;

    }

},


renderMotionFeed(motions = []) {

    const feed =
        document.getElementById("motionFeed");

    feed.innerHTML = "";

    if (!motions.length) {

        feed.innerHTML = `
            <div class="empty-feed">

                <i class="fa-solid fa-comments"></i>

                <h3>No Motions</h3>

                <p>
                    No motions have been submitted.
                </p>

            </div>
        `;

        return;
    }

},
async loadAnnouncements() {


        if (!this.state.sessionId) {
        console.warn(
            "Skipping announcements: no session ID."
        );
        return;
    }

    try {

        const announcements =
            await DebateAPI.get(
                `/debate/announcements/session/${this.state.sessionId}`
            );

        this.renderAnnouncements(announcements);

    }
    catch (error) {

                console.error(
            "Failed to load announcements:",
            error
        );

    }

},
renderAnnouncements(announcements = []) {

    const panel =
        document.getElementById("announcementList");

    if (!panel)
        return;

    panel.innerHTML = "";

    if (!announcements.length) {

        panel.innerHTML =
            "<div class='empty-feed'>No announcements.</div>";

        return;

    }

    announcements.forEach(a => {

        const card =
            document.createElement("article");

        card.className = "announcement-card";

        card.innerHTML = `

            <h4>${a.title}</h4>

            <p>${a.message}</p>

            <small>

                ${a.chairName}

                •
                ${new Date(a.createdAt).toLocaleString()}

            </small>

        `;

        panel.appendChild(card);

    });

},
startSessionTimer() {

    // Clear any existing timer
    if (this.state.timerInterval) {
        clearInterval(this.state.timerInterval);
        this.state.timerInterval = null;
    }

    const timerElement =
        this.elements.sessionTimer;

    if (!timerElement) {
        console.warn(
            "Session timer element not found."
        );
        return;
    }

    const session =
        this.state.session;

    if (!session) {
        timerElement.textContent = "00:00:00";
        return;
    }

    // Only run the live timer for an active debate
    if (
        session.status !== "ACTIVE" ||
        !session.activatedAt
    ) {
        timerElement.textContent = "00:00:00";
        return;
    }

    const activatedAt =
        new Date(session.activatedAt);

    if (Number.isNaN(activatedAt.getTime())) {
        console.error(
            "Invalid session activation time:",
            session.activatedAt
        );

        timerElement.textContent = "00:00:00";
        return;
    }

    const updateTimer = () => {

        const now = Date.now();

        const elapsedSeconds =
            Math.max(
                0,
                Math.floor(
                    (now - activatedAt.getTime()) / 1000
                )
            );

        const hours =
            Math.floor(elapsedSeconds / 3600);

        const minutes =
            Math.floor(
                (elapsedSeconds % 3600) / 60
            );

        const seconds =
            elapsedSeconds % 60;

        timerElement.textContent =
            `${String(hours).padStart(2, "0")}:` +
            `${String(minutes).padStart(2, "0")}:` +
            `${String(seconds).padStart(2, "0")}`;
    };

    // Show immediately
    updateTimer();

    // Then update every second
    this.state.timerInterval =
        setInterval(updateTimer, 1000);
},
async stopSession() {

    try {

        const session = await DebateAPI.post(
            `/debate/sessions/${this.state.sessionId}/stop`
        );

        this.state.session = session;

        this.renderSessionStatus();
        await SpeakerQueue.refresh();

        DebateUtils.showToast(
            "Debate session ended."
        );

    }
    catch (error) {

        console.error(error);

        DebateUtils.showToast(error.message);

    }

},

async publishAnnouncement() {

    try {

        const title =
            document
                .getElementById("announcementTitle")
                .value
                .trim();

        const message =
            document
                .getElementById("announcementMessage")
                .value
                .trim();

        if (!title || !message) {

            DebateUtils.showToast(
                "Please enter a title and message."
            );

            return;

        }

        await DebateAPI.post(
            "/debate/announcements",
            {
                sessionId: this.state.sessionId,
                chairId: this.state.user.id,
                title,
                message,
                pinned: false
            }
        );

        DebateUtils.showToast(
            "Announcement published."
        );

        document.getElementById("announcementTitle").value = "";
        document.getElementById("announcementMessage").value = "";

        await this.loadAnnouncements();

    }
    catch (error) {

        DebateUtils.showToast(
            error.message
        );

    }

},

initializeWorkspaceTabs() {

    const tabs =
        document.querySelectorAll(".debate-tab");

    const workspaces = {

        motions:
            document.getElementById("motionWorkspace"),

        resolutions:
            document.getElementById("resolutionWorkspace"),

        amendments:
            document.getElementById("amendmentWorkspace"),

        voting:
            document.getElementById("votingWorkspace"),

        results:
            document.getElementById("resultsWorkspace"),

        timeline:
            document.getElementById("timelineWorkspace")

    };

    tabs.forEach(tab => {

        tab.addEventListener("click", () => {

            tabs.forEach(t =>
                t.classList.remove("active"));

            Object.values(workspaces)
                .forEach(workspace =>
                    workspace.classList.add("hidden"));

            tab.classList.add("active");

            const workspace =
                workspaces[tab.dataset.workspace];

            if (workspace) {

                workspace.classList.remove("hidden");

            }

        });

    });

},

async exitDebate() {

    const warning =

this.state.role === "CHAIR"

&&

this.state.session.status === "ACTIVE"

?
`
The debate session is still LIVE.

Leaving the room will NOT stop the debate.

You can return at any time.
`

:

`
You are about to leave the debate room.
`;
DebateUtils.showModal(`

    <div class="modal-header">

        <h2>
            <i class="fa-solid fa-right-from-bracket"></i>
            Leave Debate Room
        </h2>

    </div>

    <div class="modal-body">

        <p>${warning}</p>

        <p>
            You will return to your dashboard.
        </p>

    </div>

    <div class="modal-footer">

        <button
            class="secondary-btn"
            id="cancelExitBtn">

            Cancel

        </button>

        <button
            class="primary-btn"
            id="confirmExitBtn">

            Exit Debate

        </button>

    </div>

`);

    document
        .getElementById("cancelExitBtn")
        .onclick = DebateUtils.closeModal;

    document
        .getElementById("confirmExitBtn")
        .onclick = () => this.confirmExit();



    

},

confirmExit() {

    DebateUtils.closeModal();

    localStorage.removeItem("sessionId");

    localStorage.removeItem("committeeId");

    switch(this.state.role){

        case "CHAIR":

            window.location.href =
                "chair-dashboard.html";

            break;

        case "DELEGATE":

            window.location.href =
                "dashboard.html";

            break;

        default:

            window.location.href =
                "login.html";

    }

}

}

document.addEventListener("DOMContentLoaded", () => {

    DebateRoom.init();

});