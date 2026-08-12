const SessionManagement = {

    state: {

        token: null,

        sessions: [],

            isProcessing: false

    },

    elements: {},

    async init() {

        console.log("Initializing Session Management...");

        this.loadUser();

        this.cacheElements();

        await this.loadSessions();

        this.renderSessions();

        this.registerEvents();

        console.log("Session Management Ready");

    },

    loadUser() {

        this.state.token =
            localStorage.getItem(CONFIG.TOKEN_KEY);

if (!this.state.token) {

    window.location.href = "../login.html";
    return;

}

    },

    cacheElements() {

        this.elements = {

            tableBody:
                document.getElementById("sessionTableBody")

        };

    },

registerEvents() {

    console.log("Registering Session Events...");

    this.elements.tableBody.addEventListener(
        "click",
        (event) => this.handleTableClick(event)
    );

},

async handleTableClick(event) {

    const button = event.target.closest("button");

    if (!button) {
        return;
    }

    const sessionId = button.dataset.id;

    if (button.classList.contains("activate-btn")) {

        await this.activateSession(sessionId);

    }
    else if (button.classList.contains("stop-btn")) {

        await this.stopSession(sessionId);

    }
    else if (button.classList.contains("archive-btn")) {

        await this.archiveSession(sessionId);

    }

},


async activateSession(sessionId) {

    const confirmed = confirm(
    "Activate this debate session?\n\nThis will allow delegates to join."
);

if (!confirmed) {
    return;
}

if (this.state.isProcessing) {
    return;
}

this.state.isProcessing = true;
    try {

     const button = document.querySelector(
    `[data-id="${sessionId}"]`
);

if (button) {

    button.disabled = true;

    button.innerHTML =
        `<i class="fa-solid fa-spinner fa-spin"></i> Activating`;

}   
        await apiRequest(
            `/debate/sessions/${sessionId}/activate`,
            "POST"
        );

Utils.showToast(
    "Debate session is now LIVE.",
    "success"
);

await this.loadSessions();

this.renderSessions();

setTimeout(() => {

    Utils.showToast(
        "Delegates and Chair can now access the debate room.",
        "info"
    );

}, 1000);

    }
catch (error) {

    const button = document.querySelector(
        `[data-id="${sessionId}"]`
    );

    if (button) {

        button.disabled = false;

        button.innerHTML = "Activate";

    }

    console.error(error);

}
finally {

    this.state.isProcessing = false;

}

},
async stopSession(sessionId) {

    const confirmed = confirm(
    "Stop this debate session?\n\nDelegates will no longer be able to participate."
);

if (!confirmed) {
    return;
}

    try {

        await apiRequest(
            `/debate/sessions/${sessionId}/stop`,
            "POST"
        );

        Utils.showToast(
            "Session stopped.",
            "success"
        );

        await this.loadSessions();

        this.renderSessions();

    }
    catch (error) {

        console.error(error);

    }

},
async archiveSession(sessionId) {

    try {

        await apiRequest(
            `/debate/sessions/${sessionId}/archive`,
            "POST"
        );

        Utils.showToast(
            "Session archived.",
            "success"
        );

        await this.loadSessions();

        this.renderSessions();

    }
    catch (error) {

        console.error(error);

    }

},
async loadSessions() {

    try {

        this.state.sessions = await apiRequest(
            "/debate/sessions"
        );

        console.log(this.state.sessions);

    }
    catch (error) {

        console.error("Load Sessions Error:",error);

    }

},

renderSessions() {

    this.elements.tableBody.innerHTML = "";

    this.state.sessions.forEach(session => {

        const row = document.createElement("tr");

        row.innerHTML = `

            <td>${session.committeeName}</td>

            <td>

                <span class="status-badge">

                    ${this.getDisplayStatus(session.status)}

                </span>

            </td>

            <td>${this.formatDate(session.activatedAt)}</td>

            <td>${session.chairName}</td>

            <td>

                ${this.renderActions(session)}

            </td>

        `;

        this.elements.tableBody.appendChild(row);

    });

},

renderActions(session) {

    switch (session.status) {

case "DRAFT":

    return `
        <span class="status-text text-warning">

            Waiting for Chair to Initiate

        </span>
    `;

            case "INITIATED":
        return `
            <button class="btn btn-success activate-btn"
                    data-id="${session.id}">
                Activate
            </button>
        `;


        case "ACTIVE":

            return `
                <button
                    class="btn btn-danger stop-btn"
                    data-id="${session.id}">
                    Stop
                </button>

                <button
                    class="btn btn-secondary archive-btn"
                    data-id="${session.id}">
                    Archive
                </button>
            `;

    case "ARCHIVED":

        return `
            <span class="status-text">
                Archived
            </span>
        `;

        default:

            return "-";

    }

},
formatDate(date) {

    if (!date) {
        return "-";
    }

    return new Date(date).toLocaleString();

},
getDisplayStatus(status) {

    switch (status) {

        case "DRAFT":
            return "Draft";

        case "INITIATED":
            return "Awaiting Approval";

        case "ACTIVE":
            return "Live";

        case "STOPPED":
            return "Ended";

        case "ARCHIVED":
            return "Archived";

        default:
            return status;

    }

}

};

document.addEventListener(

    "DOMContentLoaded",

    () => SessionManagement.init()

);