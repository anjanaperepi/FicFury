const MotionPanel = {

    room: null,

    motions: [],

    pendingMotions: [],

    pollingInterval: null,

    async init(room) {

        this.room = room;

        this.registerEvents();

        await this.refresh();

        this.startPolling();

    },

registerEvents() {

    console.log("MotionPanel.registerEvents()");

    const form = document.getElementById("motionForm");

    console.log("motionForm =", form);

    if (!form) {
        console.error("motionForm not found");
        return;
    }

    form.addEventListener("submit", (event) => {

        console.log("FORM SUBMITTED");

        this.submitMotion(event);

    });

},
async submitMotion(event) {

    event.preventDefault();

    try {

        const motionType =
            document.getElementById("motionType").value;

        const duration =
            parseInt(
                document.getElementById("motionDuration")
                    .value
            );

        const priority =
            document.getElementById("motionPriority").value;

        const purpose =
            document.getElementById("motionPurpose")
                .value
                .trim();

        if (
            !motionType ||
            !purpose
        ) {

            DebateUtils.showToast(
                "Please complete all required fields."
            );

            return;

        }

        const request = {

            sessionId:
                this.room.state.sessionId,

            delegateId: this.room.state.user.id,

            motionType,

            durationMinutes: duration,

            purpose,

            priority

        };

        console.log("Submitting motion...");
        console.log(request);
        await DebateAPI.post(
            "/debate/motions",
            request
        );

        console.log("Motion submitted.");

        DebateUtils.showToast(
            "Motion submitted successfully."
        );

        document
            .getElementById("motionForm")
            .reset();

        await this.refresh();

    }
    catch (error) {

        DebateUtils.showToast(
            error.message
        );

    }

},

async refresh() {

    if (!this.room.state.sessionId)
        return;

console.log("Loading motions...");

    this.motions =
        await DebateAPI.get(
            `/debate/motions/session/${this.room.state.sessionId}`
        );

console.log(this.motions);

    this.pendingMotions =
        await DebateAPI.get(
            `/debate/motions/session/${this.room.state.sessionId}/pending`
        );

    this.renderFeed();

    this.renderPendingQueue();
    this.registerMotionButtons();

},
renderFeed() {

    const feed =
        document.getElementById("motionFeed");

    const count =
        document.getElementById("motionCount");

    if (!feed)
        return;

if (count) {

    count.textContent =
        `${this.motions.length} Motion${this.motions.length === 1 ? "" : "s"}`;

}

    if (this.motions.length === 0) {

        feed.innerHTML = `
            <div class="empty-feed">
                <i class="fa-solid fa-comments"></i>
                <h3>Debate Awaits</h3>
                <p>No motions have been submitted yet.</p>
            </div>
        `;

        return;

    }
 
    feed.innerHTML = "";

    this.motions.forEach(motion => {

        const card =
            document.createElement("article");

        card.className =
            `motion-card ${motion.status.toLowerCase()}`;



        console.log(
    "Status:", motion.status,
    "User:", this.room.state.user.id,
    "Chair:", this.room.state.session.chairId
);
        card.innerHTML = `

            <div class="motion-header">

                <div class="motion-type">

                    <span class="motion-indicator"></span>

                    <h3>${this.formatMotionType(motion.motionType)}</h3>

                </div>

                <span class="motion-time">

                    ${this.formatTime(motion.createdAt)}

                </span>

            </div>

            <div class="motion-meta">

                <span>

                    <strong>Raised By:</strong>

                    ${motion.delegateName}

                </span>

                <span>

                    <strong>Duration:</strong>

                    ${motion.durationMinutes} Minutes

                </span>

            </div>

            <div class="motion-purpose">

                ${motion.purpose}

            </div>

<div class="motion-footer">

    <span class="status-badge ${motion.status.toLowerCase()}">

        ${motion.status}

    </span>

    ${
        motion.status === "APPROVED" &&
        this.room.state.user.id === this.room.state.session.chairId
            ? `
                <button
                    class="execute-motion-btn"
                    data-id="${motion.id}">
                    Execute
                </button>
              `
            : ""
    }

</div>

        `;
   console.log(card.outerHTML);
        feed.appendChild(card);

    });

},
formatMotionType(type) {

    return type
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, c => c.toUpperCase());

},

formatTime(time) {

    return new Date(time)
        .toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });

},

renderPendingQueue() {

    const container =
        document.getElementById("pendingMotionList");

const count =
    document.getElementById("pendingCount");

if (count) {

    count.textContent =
        `${this.pendingMotions.length} Pending`;

}

    if (this.pendingMotions.length === 0) {

        container.innerHTML = `
            <div class="empty-feed">
                <i class="fa-solid fa-check-circle"></i>
                <h3>No Pending Motions</h3>
                <p>All motions have been reviewed.</p>
            </div>
        `;

        return;

    }

    container.innerHTML = "";

    this.pendingMotions.forEach(motion => {

        const card =
            document.createElement("article");

        card.className = "chair-motion-card";

        card.innerHTML = `

            <div class="motion-info">

                <h3>${this.formatMotionType(motion.motionType)}</h3>

                <p>
                    <strong>Raised By:</strong>
                    ${motion.delegateName}
                </p>

                <p>
                    <strong>Duration:</strong>
                    ${motion.durationMinutes} Minutes
                </p>

                <p>
                    ${motion.purpose}
                </p>

            </div>

            <div class="motion-actions">

                <button
                    class="approve-btn"
                    data-id="${motion.id}">

                    <i class="fa-solid fa-check"></i>

                    Approve

                </button>

                <button
                    class="dismiss-btn"
                    data-id="${motion.id}">

                    <i class="fa-solid fa-xmark"></i>

                    Dismiss

                </button>

            </div>

        `;

        container.appendChild(card);

    });

    this.registerMotionButtons();

},
registerMotionButtons() {

    document
        .querySelectorAll(".approve-btn")
        .forEach(button => {

            button.onclick = () =>
                this.approveMotion(
                    button.dataset.id
                );

        });

    document
        .querySelectorAll(".dismiss-btn")
        .forEach(button => {

            button.onclick = () =>
                this.dismissMotion(
                    button.dataset.id
                );

        });

document
    .querySelectorAll(".execute-motion-btn")
    .forEach(button => {

        console.log("Registering Execute:", button.dataset.id);

        button.onclick = () => {

            console.log("Execute clicked:", button.dataset.id);

            this.executeMotion(button.dataset.id);

        };

    });

},
async approveMotion(motionId) {

    try {

        await DebateAPI.post(

            `/debate/motions/${motionId}/approve?chairId=${this.room.state.user.id}`

        );

        DebateUtils.showToast(
            "Motion approved."
        );

        await this.refresh();

    }
    catch (error) {

        DebateUtils.showToast(
            error.message
        );

    }

},
async dismissMotion(motionId) {

    try {

        await DebateAPI.post(

            `/debate/motions/${motionId}/dismiss?chairId=${this.room.state.user.id}`

        );

        DebateUtils.showToast(
            "Motion dismissed."
        );

        await this.refresh();

    }
    catch (error) {

        DebateUtils.showToast(
            error.message
        );

    }

},

async executeMotion(motionId) {

    try {

        await DebateAPI.post(
            `/debate/motions/${motionId}/execute?chairId=${this.room.state.user.id}`
        );
        console.log("Motion executed.");
        DebateUtils.showToast(
            "Motion executed."
        );

        await this.refresh();

    }
    catch (error) {

        DebateUtils.showToast(
            error.message
        );

    }

},

    startPolling() {

        clearInterval(this.pollingInterval);

       // this.pollingInterval = setInterval(() => {

          //  this.refresh();

       // }, 5000);

    }

};