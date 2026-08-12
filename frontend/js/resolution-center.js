const ResolutionCenter = {

    room: null,

    resolutions: [],

    currentResolution: null,

    async init(room) {
console.log("ResolutionCenter initialized");
        this.room = room;

        this.registerEvents();

        await this.refresh();

    },

    isChair() {

        return this.room.state.role === "CHAIR";

    },

    registerEvents() {
console.log("Registering ResolutionCenter events");
        document
            .getElementById("newResolutionBtn")
            ?.addEventListener(
                "click",
                () => this.clearEditor()
            );

        document
            .getElementById("saveResolutionBtn")
            ?.addEventListener(
                "click",
                () => this.saveResolution()
            );

        document
            .getElementById("submitResolutionBtn")
            ?.addEventListener(
                "click",
                () => this.submitCurrentResolution()
            );

const sponsorBtn =
    document.getElementById("becomeSponsorBtn");

console.log("Sponsor button:", sponsorBtn);

if (sponsorBtn) {

    sponsorBtn.addEventListener("click", () => {

        console.log("Sponsor button clicked");

        this.becomeSponsor();

    });

}

        document
            .getElementById("becomeSignatoryBtn")
            ?.addEventListener(
                "click",
                () => this.becomeSignatory()
            );
console.log(document.getElementById("becomeSponsorBtn"));
    },

    async refresh() {

        try {

            const response =
                await DebateAPI.get(
                    `/debate/resolutions/session/${this.room.state.session.id}`
                );

            this.resolutions =
                Array.isArray(response)
                    ? response
                    : [];

            this.render();

        }

        catch (error) {

            console.error(error);

            this.resolutions = [];

        }

    },

render() {

    const delegateView =
        document.getElementById(
            "resolutionDelegateView"
        );

    const chairView =
        document.getElementById(
            "resolutionChairView"
        );

    if (this.isChair()) {

        delegateView.classList.add("hidden");
        chairView.classList.remove("hidden");

        this.renderPendingResolutions();

    }

    else {

        chairView.classList.add("hidden");
        delegateView.classList.remove("hidden");

        this.renderDelegateView();

    }

},

        renderDelegateView() {

        const list =
            document.getElementById("resolutionList");

        if (!list)
            return;

        list.innerHTML = "";

        if (this.resolutions.length === 0) {

            list.innerHTML = `
                <div class="empty-feed">

                    No resolutions available.

                </div>
            `;

            return;

        }

        this.resolutions.forEach(resolution => {

            const card =
                document.createElement("article");

            card.className = "resolution-card";

            if (
                this.currentResolution &&
                this.currentResolution.id === resolution.id
            ) {

                card.classList.add("selected");

            }

            card.dataset.id = resolution.id;

            card.innerHTML = `

                <div class="resolution-card-header">

                    <div>

                        <h3>${resolution.title}</h3>

                        <small>

                            ${resolution.authorName ?? "Unknown"}

                        </small>

                    </div>

                    <span class="status-badge ${resolution.status.toLowerCase()}">

                        ${resolution.status}

                    </span>

                </div>

                <p class="resolution-preview">

                    ${resolution.content.substring(0,150)}
                    ${resolution.content.length > 150 ? "..." : ""}

                </p>

                <div class="resolution-meta">

                    <span>

                        <i class="fa-solid fa-user-group"></i>

                        ${resolution.sponsorCount ?? 0}/
                        ${resolution.requiredSponsors}

                    </span>

                    <span>

                        <i class="fa-solid fa-signature"></i>

                        ${resolution.signatoryCount ?? 0}/
                        ${resolution.requiredSignatories}

                    </span>

                </div>

            `;

            card.onclick =
                () => this.openResolution(resolution);

            list.appendChild(card);

        });

    },

    renderChairView() {

        this.renderDelegateView();

    },

    openResolution(resolution) {

        this.currentResolution = resolution;

        document
            .getElementById("resolutionTitle")
            .value = resolution.title;

        document
            .getElementById("resolutionContent")
            .value = resolution.content;

        document
            .getElementById("saveResolutionBtn")
            .textContent = "Update Draft";

        document
            .querySelectorAll(".resolution-card")
            .forEach(card =>
                card.classList.remove("selected"));

        document
            .querySelector(
                `.resolution-card[data-id="${resolution.id}"]`
            )
            ?.classList.add("selected");

        this.loadParticipants();

    },

    clearEditor() {

        this.currentResolution = null;

        document
            .getElementById("resolutionTitle")
            .value = "";

        document
            .getElementById("resolutionContent")
            .value = "";

        document
            .getElementById("saveResolutionBtn")
            .textContent = "Save Draft";

        document
            .querySelectorAll(".resolution-card")
            .forEach(card =>
                card.classList.remove("selected"));

        const sponsorList =
            document.getElementById("sponsorList");

        if (sponsorList)
            sponsorList.innerHTML = "";

        const signatoryList =
            document.getElementById("signatoryList");

        if (signatoryList)
            signatoryList.innerHTML = "";

    },

        async saveResolution() {

        try {

            const title =
                document
                    .getElementById("resolutionTitle")
                    .value
                    .trim();

            const content =
                document
                    .getElementById("resolutionContent")
                    .value
                    .trim();

            if (!title || !content) {

                DebateUtils.showToast(
                    "Please enter a title and resolution content."
                );

                return;

            }

            let response;

            if (this.currentResolution) {

                response =
                    await DebateAPI.put(

                        `/debate/resolutions/${this.currentResolution.id}`,

                        {

                            title,

                            content

                        }

                    );

                DebateUtils.showToast(
                    "Draft updated."
                );

            }

            else {

                response =
                    await DebateAPI.post(

                        "/debate/resolutions",

                        {

                            sessionId:
                                this.room.state.session.id,

                            delegateId:
                                this.room.state.user.id,

                            title,

                            content

                        }

                    );

                DebateUtils.showToast(
                    "Draft created."
                );

            }

            this.currentResolution = response;

            await this.refresh();

            this.openResolution(response);

        }

        catch (error) {

            DebateUtils.showToast(
                error.message
            );

        }

    },

    async submitCurrentResolution() {

        if (!this.currentResolution)
            return;

        try {

            await DebateAPI.post(

                `/debate/resolutions/${this.currentResolution.id}/submit`

            );

            DebateUtils.showToast(
                "Resolution submitted."
            );

            await this.refresh();

            this.clearEditor();

        }

        catch (error) {

            DebateUtils.showToast(
                error.message
            );

        }

    },

    async loadParticipants() {

        if (!this.currentResolution)
            return;

        try {

            const sponsors =
                await DebateAPI.get(

                    `/debate/resolutions/${this.currentResolution.id}/sponsors`

                );

            const signatories =
                await DebateAPI.get(

                    `/debate/resolutions/${this.currentResolution.id}/signatories`

                );

            const sponsorList =
                document.getElementById("sponsorList");

            if (sponsorList) {

                sponsorList.innerHTML =
                    sponsors.length
                        ? sponsors.map(s => `
                            <div class="participant-chip sponsor">
                                ${s.delegateName}
                            </div>
                        `).join("")
                        : "<div class='empty-feed'>No Sponsors</div>";

            }

            const signatoryList =
                document.getElementById("signatoryList");

            if (signatoryList) {

                signatoryList.innerHTML =
                    signatories.length
                        ? signatories.map(s => `
                            <div class="participant-chip signatory">
                                ${s.delegateName}
                            </div>
                        `).join("")
                        : "<div class='empty-feed'>No Signatories</div>";

            }

        }

        catch (error) {

            console.error(error);

        }

    },

    async becomeSponsor() {
console.log("Become Sponsor clicked");
        if (!this.currentResolution)
            return;

        try {

            await DebateAPI.post(

                "/debate/resolutions/sponsors",

                {

                    resolutionId:
                        this.currentResolution.id,

                    delegateId:
                        this.room.state.user.id

                }

            );

            await this.loadParticipants();

            await this.refresh();

        }

catch (error) {

    console.error(error);

    alert(error.message);

}

    },

    async becomeSignatory() {

        if (!this.currentResolution)
            return;

        try {

            await DebateAPI.post(

                "/debate/resolutions/signatories",

                {

                    resolutionId:
                        this.currentResolution.id,

                    delegateId:
                        this.room.state.user.id

                }

            );

            await this.loadParticipants();

            await this.refresh();

        }

        catch (error) {

            DebateUtils.showToast(
                error.message
            );

        }

    },

        async approveResolution() {

        if (!this.currentResolution)
            return;

        try {

            await DebateAPI.post(

                `/debate/resolutions/${this.currentResolution.id}/approve`

            );

            DebateUtils.showToast(
                "Resolution approved."
            );

            await this.refresh();

        }

        catch (error) {

            DebateUtils.showToast(
                error.message
            );

        }

    },

    async rejectResolution() {

        if (!this.currentResolution)
            return;

        try {

            await DebateAPI.post(

                `/debate/resolutions/${this.currentResolution.id}/reject`

            );

            DebateUtils.showToast(
                "Resolution rejected."
            );

            await this.refresh();

        }

        catch (error) {

            DebateUtils.showToast(
                error.message
            );

        }

    },
    async openAmendments() {

    if (!this.currentResolution)
        return;

    try {

        await DebateAPI.post(

            `/debate/resolutions/${this.currentResolution.id}/open-amendments`

        );

        DebateUtils.showToast(
            "Amendments opened."
        );

        await this.refresh();

    }

    catch (error) {

        DebateUtils.showToast(
            error.message
        );

    }

},
async closeAmendments() {

    if (!this.currentResolution)
        return;

    const resolutionId = this.currentResolution.id;

    try {

        const pending =
            await DebateAPI.get(
                `/debate/amendments/resolution/${resolutionId}/pending`
            );

        if (pending.length > 0) {

            DebateUtils.showToast(
                "Review all pending amendments before closing."
            );

            return;
        }

        await DebateAPI.post(
            `/debate/resolutions/${resolutionId}/close-amendments`
        );

        DebateUtils.showToast(
            "Amendments closed."
        );

        await this.refresh();

    }

    catch(error){

        DebateUtils.showToast(error.message);

    }

},
async openVoting() {

    if (!this.currentResolution)
        return;

    try {

        await DebateAPI.post(

            `/debate/resolutions/${this.currentResolution.id}/open-voting`

        );

        DebateUtils.showToast(
            "Voting opened."
        );

        await this.refresh();

    }

    catch (error) {

        DebateUtils.showToast(
            error.message
        );

    }

},

async closeVoting() {

    if (!this.currentResolution)
        return;

    try {

        await DebateAPI.post(

            `/debate/resolutions/${this.currentResolution.id}/close-voting`

        );

        DebateUtils.showToast(

            "Voting closed."

        );

        await this.refresh();

    }

    catch(error){

        DebateUtils.showToast(

            error.message

        );

    }

},

    renderPendingResolutions() {

        const panel =
            document.getElementById("pendingResolutionList");

        const count =
            document.getElementById("pendingResolutionCount");

        if (!panel)
            return;

const workflowResolutions =
    this.resolutions.filter(r =>

        r.status === "SUBMITTED" ||

        r.status === "APPROVED" ||

        r.status === "AMENDMENT_OPEN" ||

        r.status === "AMENDMENTS_CLOSED" ||

        r.status === "VOTING"

    );

count.textContent =
    `${workflowResolutions.length} Active`;

        panel.innerHTML = "";

        if (!workflowResolutions.length) {

            panel.innerHTML = `
                <div class="empty-feed">

                    No submitted resolutions.

                </div>
            `;

            return;

        }

        workflowResolutions.forEach(resolution => {


            const card = document.createElement("article");

card.className = "pending-resolution-card";
const ready =
    resolution.sponsorCount >= resolution.requiredSponsors &&
    resolution.signatoryCount >= resolution.requiredSignatories;

    let actionButtons = "";

switch (resolution.status) {

    case "SUBMITTED":

        actionButtons = `
            <button
                class="secondary-btn view-resolution-btn"
                data-id="${resolution.id}">
                View
            </button>

            <button
                class="success-btn approve-resolution-btn"
                data-id="${resolution.id}"
                ${!ready ? "disabled" : ""}>
                Approve
            </button>

            <button
                class="danger-btn reject-resolution-btn"
                data-id="${resolution.id}">
                Reject
            </button>
        `;

        break;

case "APPROVED":

    actionButtons = `
        <button
            class="secondary-btn view-resolution-btn"
            data-id="${resolution.id}">
            View
        </button>

        <button
            class="primary-btn open-amendments-btn"
            data-id="${resolution.id}">
            Open Amendments
        </button>
    `;

    break;

case "AMENDMENT_OPEN":

    actionButtons = `
        <button
            class="secondary-btn view-resolution-btn"
            data-id="${resolution.id}">
            View
        </button>

        <button
            class="warning-btn close-amendments-btn"
            data-id="${resolution.id}">
            Close Amendments
        </button>
    `;

    break;

case "AMENDMENTS_CLOSED":

    actionButtons = `
        <button
            class="secondary-btn view-resolution-btn"
            data-id="${resolution.id}">
            View
        </button>

        <button
            class="success-btn open-voting-btn"
            data-id="${resolution.id}">
            Open Voting
        </button>
    `;

    break;



}
card.innerHTML = `

<div class="pending-resolution-header">

    <div>

        <h3>${resolution.title}</h3>

        <small>

            ${resolution.authorName}

        </small>

    </div>

    <span class="status-badge ${resolution.status.toLowerCase()}">

        ${resolution.status}

    </span>

</div>

<div class="resolution-progress">

    <div class="progress-item">

        <span>Sponsors</span>

        <strong>

            ${resolution.sponsorCount}/${resolution.requiredSponsors}

        </strong>

    </div>

    <div class="progress-item">

        <span>Signatories</span>

        <strong>

            ${resolution.signatoryCount}/${resolution.requiredSignatories}

        </strong>

    </div>

</div>

<div class="resolution-review-status">

    ${
        ready
        ? `
            <span class="ready-badge">

                ✓ Ready For Approval

            </span>
        `
        : `
            <span class="waiting-badge">

                Waiting for Sponsors / Signatories

            </span>
        `
    }

</div>

<div class="resolution-review-actions">

    ${actionButtons}

</div>

`;


            panel.appendChild(card);


        });

        document
    .querySelectorAll(".approve-resolution-btn")
    .forEach(button => {

        button.onclick = () => {

            this.currentResolution =
                this.resolutions.find(
                    r => r.id == button.dataset.id
                );

            this.approveResolution();

        };

    });

document
    .querySelectorAll(".reject-resolution-btn")
    .forEach(button => {

        button.onclick = () => {

            this.currentResolution =
                this.resolutions.find(
                    r => r.id == button.dataset.id
                );

            this.rejectResolution();

        };

    });

document
    .querySelectorAll(".view-resolution-btn")
    .forEach(button => {

        button.onclick = () => {

            const resolution =
                this.resolutions.find(
                    r => r.id == button.dataset.id
                );

            this.openResolution(resolution);

        };

    });

document
    .querySelectorAll(".open-amendments-btn")
    .forEach(button => {

        button.onclick = () => {

            this.currentResolution =
                this.resolutions.find(
                    r => r.id == button.dataset.id
                );

            this.openAmendments();

        };

    });

document
    .querySelectorAll(".close-amendments-btn")
    .forEach(button => {

        button.onclick = () => {

            this.currentResolution =
                this.resolutions.find(
                    r => r.id == button.dataset.id
                );

            this.closeAmendments();

        };

    });


document
    .querySelectorAll(".open-voting-btn")
    .forEach(button => {

        button.onclick = () => {

            this.currentResolution =
                this.resolutions.find(
                    r => r.id == button.dataset.id
                );

            this.openVoting();

        };

    });



document
    .querySelectorAll(".close-voting-btn")
    .forEach(button => {

        button.onclick = () => {

            this.currentResolution =
                this.resolutions.find(
                    r => r.id == button.dataset.id
                );

            this.closeVoting();

        };

    });
    }

}
