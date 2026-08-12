const SpeakerQueue = {

    room: null,

    queue: [],

    currentSpeaker: null,
    timerInterval: null,

    isCompletingSpeaker: false,

lastTimerValue: null,

    async init(room) {

this.room = room;

if (!room.state.sessionId)
    return;

await this.refresh();

this.registerEvents();

//this.startPolling();

    },

    async refresh() {

        if (!this.room.state.sessionId)
            return;

        try {

            this.queue = await DebateAPI.get(
                `/debate/speakers/session/${this.room.state.sessionId}`
            );

        } catch (e) {

            this.queue = [];

            console.error(e);

        }

// Don't ask for the current speaker unless one can exist.
if (this.room.state.session.status === "ACTIVE") {

    try {

        this.currentSpeaker = await DebateAPI.get(
            `/debate/speakers/session/${this.room.state.sessionId}/current`
        );

        this.lastTimerValue = this.currentSpeaker
            ? this.currentSpeaker.remainingTimeSeconds
            : null;

    } catch {

        this.currentSpeaker = null;
        this.lastTimerValue = null;

    }

} else {

    this.currentSpeaker = null;
    this.lastTimerValue = null;

}

        this.render();

    },

    async requestSpeaker() {
        if (this.room.state.session.status !== "ACTIVE") {

    DebateUtils.showToast(
        "The debate has not started yet."
    );

    return;

}
        try {

            await DebateAPI.post(
                "/debate/speakers",
                {
                    sessionId: this.room.state.sessionId,
                    delegateId: this.room.state.user.id,
                    allottedTimeSeconds: 90
                }
            );

            DebateUtils.showToast("Speaker request submitted.");

            await this.refresh();

        }
        catch (error) {

            DebateUtils.showToast(error.message);

        }

    },

    render() {

        const queueList =
            document.getElementById("speakerQueueList");

        const queueCount =
            document.getElementById("queueCount");

        const currentSpeaker =
            document.getElementById("currentSpeakerName");

        queueList.innerHTML = "";

        queueCount.textContent =
    `${this.queue.length} Speaker${
        this.queue.length === 1 ? "" : "s"
    }`;

        if (this.currentSpeaker) {

            currentSpeaker.textContent =
                this.currentSpeaker.delegateName;

        }
        else {

currentSpeaker.textContent =
    this.queue.length
        ? "Waiting for Chair to start the next speaker"
        : "No Speaker Requests";

        }

if (this.queue.length === 0) {

    queueList.innerHTML =
        "<li>No speakers in queue.</li>";

    this.updateChairControls();

    return;

}
        this.queue.forEach(speaker => {

            const li = document.createElement("li");

li.innerHTML = `
<div class="speaker-row">

    <div>

        <strong>${speaker.delegateName}</strong>

        <div class="speaker-status">

            ${speaker.status}

        </div>

    </div>

    <span>

        #${speaker.queuePosition}

    </span>

</div>
`;

            queueList.appendChild(li);

        });
this.updateChairControls();

this.renderTimer();

if (
    this.currentSpeaker &&
    this.currentSpeaker.timerRunning &&
    !this.timerInterval
) {

    this.startTimerCountdown();

}
    },


    renderTimer() {

    const timer =
        document.getElementById("speakerTimer");

    if (!timer)
        return;

    if (!this.currentSpeaker) {

        timer.textContent = "00:00";

        timer.className = "speaker-timer";

        return;

    }

    const seconds =
        this.currentSpeaker.remainingTimeSeconds;

    const minutes =
        Math.floor(seconds / 60);

    const remaining =
        seconds % 60;

    timer.textContent =
        `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;

    timer.className = "speaker-timer";

    if (seconds <= 10) {

        timer.classList.add("danger");

    }
    else if (seconds <= 30) {

        timer.classList.add("warning");

    }
    else {

        timer.classList.add("normal");

    }

},

startTimerCountdown() {

    // Stop any existing timer
    clearInterval(this.timerInterval);
    this.timerInterval = null;

    // Nothing to count down
    if (
        !this.currentSpeaker ||
        !this.currentSpeaker.timerRunning
    ) {
        return;
    }

    this.timerInterval = setInterval(() => {

        // Speaker disappeared
        if (
            !this.currentSpeaker ||
            !this.currentSpeaker.timerRunning
        ) {

            clearInterval(this.timerInterval);
            this.timerInterval = null;

            return;

        }

this.currentSpeaker.remainingTimeSeconds = Math.max(
    0,
    this.currentSpeaker.remainingTimeSeconds - 1
);

        this.renderTimer();

        if (this.currentSpeaker.remainingTimeSeconds <= 0) {

            clearInterval(this.timerInterval);
            this.timerInterval = null;

            DebateUtils.showToast(
                "Speech time has expired."
            );

if (!this.isCompletingSpeaker) {
    this.completeSpeaker();
}

        }

    }, 1000);

}, 

updateChairControls() {

    const session = this.room.state.session;
    const speaker = this.currentSpeaker;

    const startBtn = document.getElementById("startSpeakerBtn");

    const pauseBtn = document.getElementById("pauseSpeakerBtn");
    const resumeBtn = document.getElementById("resumeSpeakerBtn");
    const skipBtn = document.getElementById("skipSpeakerBtn");
    const completeBtn = document.getElementById("completeSpeakerBtn");
    const extendBtn = document.getElementById("extendTimeBtn");

    const sessionActive =
        session &&
        session.status === "ACTIVE";

    const hasQueue =
        this.queue.length > 0;

    const hasSpeaker =
        speaker !== null;

    if (startBtn) {

        startBtn.disabled =
            !sessionActive ||
            !hasQueue ||
            hasSpeaker;

        startBtn.innerHTML =
            hasSpeaker
                ? `<i class="fa-solid fa-microphone"></i> Speaker Active`
                : `<i class="fa-solid fa-play"></i> Start Next Speaker`;

    }

    if (pauseBtn) {

        pauseBtn.disabled =
            !hasSpeaker ||
            !speaker.timerRunning;

    }

    if (resumeBtn) {

        resumeBtn.disabled =
            !hasSpeaker ||
            speaker.timerRunning;

    }

    if (skipBtn)
        skipBtn.disabled = !hasSpeaker;

    if (completeBtn)
        completeBtn.disabled = !hasSpeaker;

    if (extendBtn)
        extendBtn.disabled = !hasSpeaker;

},

    registerEvents() {

        const requestBtn =
            document.getElementById("requestSpeakerBtn");

        if (requestBtn) {

            requestBtn.addEventListener(
                "click",
                () => this.requestSpeaker()
            );

        }

        const startBtn = document.getElementById("startSpeakerBtn");
        if (startBtn) {
            startBtn.addEventListener("click", () => this.startSpeaker());
        }

        const pauseBtn = document.getElementById("pauseSpeakerBtn");
        if (pauseBtn) {
            pauseBtn.addEventListener("click", () => this.pauseSpeaker());
        }

        const resumeBtn = document.getElementById("resumeSpeakerBtn");
        if (resumeBtn) {
            resumeBtn.addEventListener("click", () => this.resumeSpeaker());
        }

        const skipBtn = document.getElementById("skipSpeakerBtn");
        if (skipBtn) {
            skipBtn.addEventListener("click", () => this.skipSpeaker());
        }

        const completeBtn = document.getElementById("completeSpeakerBtn");
        if (completeBtn) {
            completeBtn.addEventListener("click", () => this.completeSpeaker());
        }



        this.room.elements.extendTimeBtn
            ?.addEventListener(
                "click",
                () => this.extendTime()
            );

    },

startPolling() {

    if (this.pollingInterval) {
        return;
    }

    this.pollingInterval = setInterval(async () => {

        await this.refresh();

    }, 5000);

},
async startSpeaker() {

    try {

await DebateAPI.post(
    `/debate/speakers/session/${this.room.state.sessionId}/start`
);

        DebateUtils.showToast("Speaker started.");

        await this.refresh();

    } catch (error) {

        DebateUtils.showToast(error.message);

    }

},
async pauseSpeaker() {

    try {

if (!this.currentSpeaker) {
    return;
}

await DebateAPI.post(
    `/debate/speakers/${this.currentSpeaker.id}/pause`
);

        DebateUtils.showToast("Speaker paused.");
        await this.refresh();
        clearInterval(this.timerInterval);
        this.timerInterval = null;


    } catch (error) {

        DebateUtils.showToast(error.message);

    }

},

async resumeSpeaker() {

    try {

if (!this.currentSpeaker) {
    return;
}

await DebateAPI.post(
    `/debate/speakers/${this.currentSpeaker.id}/resume`
);

        DebateUtils.showToast("Speaker resumed.");
        await this.refresh();
        this.startTimerCountdown();

    } 
    
    catch (error) {

        DebateUtils.showToast(error.message);

    }

},


async skipSpeaker() {

    try {

if (!this.currentSpeaker) {
    return;
}

await DebateAPI.post(
    `/debate/speakers/${this.currentSpeaker.id}/skip`
);

        DebateUtils.showToast("Speaker skipped.");

        await this.refresh();

    } catch (error) {

        DebateUtils.showToast(error.message);

    }

},
async completeSpeaker() {


    if (this.isCompletingSpeaker)
    return;

this.isCompletingSpeaker = true;

    try {

if (!this.currentSpeaker) {
    return;
}

await DebateAPI.post(
    `/debate/speakers/${this.currentSpeaker.id}/complete`
);

        DebateUtils.showToast("Speaker completed.");

        await this.refresh();
        this.currentSpeaker = null;

        this.render();
        clearInterval(this.timerInterval);
        this.timerInterval = null;

    } catch (error) {

        DebateUtils.showToast(error.message);

    }

    finally {

    this.isCompletingSpeaker = false;

}

},
async extendTime() {

if (!this.currentSpeaker) {
    return;
}

await DebateAPI.post(
    `/debate/speakers/${this.currentSpeaker.id}/extend?seconds=30`
);

await this.refresh();

this.startTimerCountdown();

}


};