const AmendmentCenter = {

    room: null,

    resolutions: [],
    clauses: [],
    selectedResolution: null,
    selectedClause: null,
    pendingAmendments: [],


    /* ==========================================================
       INITIALIZATION
       ========================================================== */

    async init(room) {

        this.room = room;

        await this.refresh();

    },


    /* ==========================================================
       LOAD DATA
       ========================================================== */

    async refresh() {

        try {

            const sessionId = this.room.state.sessionId;

            const resolutions = await DebateAPI.get(
                `/debate/resolutions/session/${sessionId}`
            );

            console.log(
                "Amendment Center — Resolutions:",
                resolutions
            );

            this.resolutions = (resolutions || []).filter(
                resolution =>
                    resolution.status === "AMENDMENT_OPEN"
            );

            console.log(
                "Amendment Center — Open:",
                this.resolutions
            );

            this.selectedResolution = null;
            this.selectedClause = null;
            this.clauses = [];

            this.render();

        }

        catch (error) {

            console.error(
                "Failed to load amendment center:",
                error
            );

            DebateUtils.showToast(
                error.message || "Failed to load amendments."
            );

        }

    },


    /* ==========================================================
       MAIN RENDER
       ========================================================== */

    render() {

        const container =
            document.getElementById("amendmentContainer");

        if (!container) {

            console.error(
                "amendmentContainer not found."
            );

            return;

        }

        if (this.room.state.role === "CHAIR") {

            this.renderChairView();

        }

        else {

            this.renderDelegateView();

        }

    },


    /* ==========================================================
       DELEGATE VIEW
       ========================================================== */

    renderDelegateView() {

        const container =
            document.getElementById("amendmentContainer");

        if (!container) return;

        if (!this.resolutions.length) {

            container.innerHTML = `

                <section class="amendment-center">

                    <div class="amendment-section-header">

                        <div>

                            <span class="section-eyebrow">
                                Delegate Workspace
                            </span>

                            <h2>
                                Amendment Center
                            </h2>

                            <p>
                                Review open resolutions and propose
                                changes to individual clauses.
                            </p>

                        </div>

                    </div>


                    <div class="amendment-empty-state">

                        <div class="amendment-empty-icon">

                            <i class="fa-solid fa-file-pen"></i>

                        </div>

                        <h3>
                            No Open Amendments
                        </h3>

                        <p>
                            There are currently no resolutions
                            accepting amendments.
                        </p>

                    </div>

                </section>

            `;

            return;

        }


        container.innerHTML = `

            <section class="amendment-center">

                <div class="amendment-section-header">

                    <div>

                        <span class="section-eyebrow">
                            Delegate Workspace
                        </span>

                        <h2>
                            Amendment Center
                        </h2>

                        <p>
                            Review open resolutions and propose
                            changes to individual clauses.
                        </p>

                    </div>

                    <div class="amendment-count-badge">

                        <strong>
                            ${this.resolutions.length}
                        </strong>

                        <span>
                            Open
                        </span>

                    </div>

                </div>


                <div class="amendment-workspace">


                    <!-- =========================================
                         LEFT — RESOLUTION LIST
                    ========================================== -->

                    <aside class="amendment-list-panel">

                        <div class="amendment-list-header">

                            <div>

                                <span class="panel-label">
                                    Active
                                </span>

                                <h3>
                                    Resolutions
                                </h3>

                            </div>

                            <div class="amendment-list-icon">

                                <i class="fa-solid fa-file-signature"></i>

                            </div>

                        </div>


                        <div class="amendment-resolution-list">

                            ${this.resolutions
                                .map(
                                    resolution =>
                                        this.renderResolutionCard(
                                            resolution
                                        )
                                )
                                .join("")}

                        </div>

                    </aside>


                    <!-- =========================================
                         RIGHT — CLAUSE AREA
                    ========================================== -->

                    <section class="amendment-editor-panel">

                        <div
                            id="amendmentDetails"
                            class="amendment-details-empty"
                        >

                            <div class="amendment-empty-icon">

                                <i class="fa-solid fa-arrow-left"></i>

                            </div>

                            <h3>
                                Select a Resolution
                            </h3>

                            <p>
                                Choose an open resolution from the
                                left to view its clauses.
                            </p>

                        </div>

                    </section>

                </div>

            </section>

        `;


        this.registerDelegateResolutionEvents();

    },


    /* ==========================================================
       RESOLUTION CARD
       ========================================================== */

    renderResolutionCard(resolution) {

        const selected =
            this.selectedResolution &&
            this.selectedResolution.id === resolution.id;

        const preview =
            resolution.content ||
            "No resolution description available.";

        return `

            <article
                class="
                    amendment-resolution-card
                    ${selected ? "selected" : ""}
                "
                data-resolution="${resolution.id}"
            >

                <div class="amendment-resolution-card-header">

                    <div>

                        <h3>
                            ${this.escapeHtml(
                                resolution.title ||
                                "Untitled Resolution"
                            )}
                        </h3>

                        <small>
                            ${this.escapeHtml(
                                resolution.submittedByName ||
                                "Unknown"
                            )}
                        </small>

                    </div>

                    <span class="status-badge amendment_open">

                        AMENDMENT OPEN

                    </span>

                </div>


                <p class="amendment-resolution-preview">

                    ${this.escapeHtml(
                        this.truncate(preview, 150)
                    )}

                </p>


                <div class="amendment-resolution-meta">

                    <span>

                        <i class="fa-solid fa-file-lines"></i>

                        Clauses available

                    </span>

                    <span>

                        <i class="fa-solid fa-pen"></i>

                        Amend

                    </span>

                </div>

            </article>

        `;

    },


    /* ==========================================================
       DELEGATE RESOLUTION EVENTS
       ========================================================== */

    registerDelegateResolutionEvents() {

        document
            .querySelectorAll(
                ".amendment-resolution-card"
            )
            .forEach(card => {

                card.onclick = () => {

                    const resolutionId =
                        Number(card.dataset.resolution);

                    this.loadClauses(resolutionId);

                };

            });

    },


    /* ==========================================================
       LOAD CLAUSES
       ========================================================== */

    async loadClauses(resolutionId) {

        try {

            this.selectedResolution =
                this.resolutions.find(
                    resolution =>
                        resolution.id === resolutionId
                );


            if (!this.selectedResolution) {

                DebateUtils.showToast(
                    "Resolution not found."
                );

                return;

            }


            this.clauses =
                await DebateAPI.get(
                    `/debate/clauses/resolution/${resolutionId}`
                );


            this.renderClauses();

        }

        catch (error) {

            console.error(
                "Failed to load clauses:",
                error
            );

            DebateUtils.showToast(
                error.message ||
                "Failed to load clauses."
            );

        }

    },


    /* ==========================================================
       CLAUSE VIEW
       ========================================================== */

    renderClauses() {

        const container =
            document.getElementById(
                "amendmentDetails"
            );

        if (!container) return;


        container.innerHTML = `

            <div class="amendment-editor-header">

                <div>

                    <span class="section-eyebrow">
                        Open Resolution
                    </span>

                    <h3>

                        ${this.escapeHtml(
                            this.selectedResolution.title
                        )}

                    </h3>

                    <p>

                        ${this.clauses.length}
                        clause${this.clauses.length === 1 ? "" : "s"}
                        available for amendment.

                    </p>

                </div>


                <span class="status-badge amendment_open">

                    AMENDMENT OPEN

                </span>

            </div>


            <div class="amendment-clause-list">

                ${
                    this.clauses.length
                        ? this.clauses
                            .map(
                                clause =>
                                    this.renderClauseCard(
                                        clause
                                    )
                            )
                            .join("")
                        : `

                            <div class="amendment-empty-state compact">

                                <i class="fa-solid fa-file-circle-xmark"></i>

                                <h3>
                                    No Clauses Found
                                </h3>

                                <p>
                                    This resolution does not currently
                                    contain any clauses.
                                </p>

                            </div>

                        `
                }

            </div>

        `;


        this.registerClauseEvents();

    },


    /* ==========================================================
       CLAUSE CARD
       ========================================================== */

    renderClauseCard(clause) {

        return `

            <article class="amendment-clause-card">

                <div class="amendment-clause-header">

                    <div>

                        <span class="clause-number">

                            Clause
                            ${this.escapeHtml(
                                clause.clauseNumber
                            )}

                        </span>

                    </div>

                    <span class="amendment-clause-type">

                        ${this.escapeHtml(
                            clause.clauseType ||
                            "OPERATIVE"
                        )}

                    </span>

                </div>


                <div class="amendment-clause-content">

                    <p>

                        ${this.escapeHtml(
                            clause.content ||
                            "No clause content."
                        )}

                    </p>

                </div>


                <div class="amendment-clause-actions">

                    <button
                        class="amend-clause-btn"
                        data-id="${clause.id}"
                    >

                        <i class="fa-solid fa-pen-to-square"></i>

                        Propose Amendment

                    </button>

                </div>

            </article>

        `;

    },


    /* ==========================================================
       CLAUSE EVENTS
       ========================================================== */

    registerClauseEvents() {

        document
            .querySelectorAll(
                ".amend-clause-btn"
            )
            .forEach(button => {

                button.onclick = () => {

                    const clauseId =
                        Number(button.dataset.id);

                    this.openAmendmentModal(
                        clauseId
                    );

                };

            });

    },


    /* ==========================================================
       AMENDMENT MODAL
       ========================================================== */

    openAmendmentModal(clauseId) {

        this.selectedClause =
            this.clauses.find(
                clause =>
                    clause.id === clauseId
            );


        if (!this.selectedClause) {

            DebateUtils.showToast(
                "Clause not found."
            );

            return;

        }


        this.renderAmendmentModal();

    },


    renderAmendmentModal() {

        const clause =
            this.selectedClause;


        DebateUtils.showModal(`

            <div class="amendment-modal">

                <div class="amendment-modal-header">

                    <div>

                        <span class="section-eyebrow">
                            Proposed Change
                        </span>

                        <h2>
                            Amend Clause
                            ${this.escapeHtml(
                                clause.clauseNumber
                            )}
                        </h2>

                    </div>

                    <span class="amendment-modal-badge">

                        AMENDMENT

                    </span>

                </div>


                <div class="amendment-current-clause">

                    <span class="modal-label">
                        Current Clause
                    </span>

                    <p>

                        ${this.escapeHtml(
                            clause.content
                        )}

                    </p>

                </div>


                <div class="form-group">

                    <label for="amendmentType">
                        Amendment Type
                    </label>

                    <select id="amendmentType">

                        <option value="MODIFY">
                            Modify Clause
                        </option>

                        <option value="DELETE">
                            Delete Clause
                        </option>

                        <option value="ADD">
                            Add Clause After
                        </option>

                    </select>

                </div>


                <div class="form-group">

                    <label for="proposedText">
                        Proposed Text
                    </label>

                    <textarea
                        id="proposedText"
                        rows="7"
                        placeholder="Enter the proposed amendment..."
                    ></textarea>

                </div>


                <div class="amendment-modal-actions">

                    <button
                        id="cancelAmendmentBtn"
                        class="secondary-btn"
                    >

                        Cancel

                    </button>

                    <button
                        id="submitAmendmentBtn"
                        class="primary-btn"
                    >

                        <i class="fa-solid fa-paper-plane"></i>

                        Submit Amendment

                    </button>

                </div>

            </div>

        `);


        this.registerAmendmentModalEvents();

    },


    registerAmendmentModalEvents() {

        const cancelButton =
            document.getElementById(
                "cancelAmendmentBtn"
            );


        const submitButton =
            document.getElementById(
                "submitAmendmentBtn"
            );


        if (cancelButton) {

            cancelButton.onclick = () => {

                DebateUtils.closeModal();

            };

        }


        if (submitButton) {

            submitButton.onclick = () => {

                this.submitAmendment();

            };

        }

    },


    /* ==========================================================
       SUBMIT AMENDMENT
       ========================================================== */

    async submitAmendment() {

        try {

            const typeElement =
                document.getElementById(
                    "amendmentType"
                );


            const textElement =
                document.getElementById(
                    "proposedText"
                );


            if (!typeElement || !textElement) {

                DebateUtils.showToast(
                    "Amendment form is unavailable."
                );

                return;

            }


            const amendmentType =
                typeElement.value;


            const proposedText =
                textElement.value.trim();


            if (
                amendmentType !== "DELETE" &&
                !proposedText
            ) {

                DebateUtils.showToast(
                    "Please enter amendment text."
                );

                return;

            }


            const request = {

                resolutionId:
                    this.selectedResolution.id,

                clauseId:
                    this.selectedClause.id,

                delegateId:
                    this.room.state.user.id,

                amendmentType:
                    amendmentType,

                proposedText:
                    proposedText

            };


            if (amendmentType === "ADD") {

                request.insertAfterClauseId =
                    this.selectedClause.id;

            }


            console.log(
                "Submitting Amendment:",
                request
            );


            await DebateAPI.post(
                "/debate/amendments",
                request
            );


            DebateUtils.closeModal();


            DebateUtils.showToast(
                "Amendment submitted successfully."
            );


            await this.refresh();

        }

        catch (error) {

            console.error(
                "Amendment submission failed:",
                error
            );

            DebateUtils.showToast(
                error.message ||
                "Failed to submit amendment."
            );

        }

    },


    /* ==========================================================
       CHAIR VIEW
       ========================================================== */

    renderChairView() {

        const container =
            document.getElementById(
                "amendmentContainer"
            );

        if (!container) return;


        if (!this.resolutions.length) {

            container.innerHTML = `

                <section class="amendment-center">

                    <div class="amendment-section-header">

                        <div>

                            <span class="section-eyebrow">
                                Chair Workspace
                            </span>

                            <h2>
                                Amendment Center
                            </h2>

                            <p>
                                Review and manage proposed
                                amendments.
                            </p>

                        </div>

                    </div>


                    <div class="amendment-empty-state">

                        <div class="amendment-empty-icon">

                            <i class="fa-solid fa-scale-balanced"></i>

                        </div>

                        <h3>
                            No Active Amendment Sessions
                        </h3>

                        <p>
                            No resolutions are currently open
                            for amendments.
                        </p>

                    </div>

                </section>

            `;

            return;

        }


        container.innerHTML = `

            <section class="amendment-center">

                <div class="amendment-section-header">

                    <div>

                        <span class="section-eyebrow">
                            Chair Workspace
                        </span>

                        <h2>
                            Amendment Center
                        </h2>

                        <p>
                            Review, approve or reject proposed
                            amendments.
                        </p>

                    </div>

                    <div class="amendment-count-badge">

                        <strong>
                            ${this.resolutions.length}
                        </strong>

                        <span>
                            Open
                        </span>

                    </div>

                </div>


                <div class="amendment-workspace">


                    <!-- =====================================
                         LEFT — OPEN RESOLUTIONS
                    ====================================== -->

                    <aside class="amendment-list-panel">

                        <div class="amendment-list-header">

                            <div>

                                <span class="panel-label">
                                    Chair Review
                                </span>

                                <h3>
                                    Resolutions
                                </h3>

                            </div>

                            <div class="amendment-list-icon">

                                <i class="fa-solid fa-gavel"></i>

                            </div>

                        </div>


                        <div class="amendment-resolution-list">

                            ${this.resolutions
                                .map(
                                    resolution =>
                                        this.renderChairResolutionCard(
                                            resolution
                                        )
                                )
                                .join("")}

                        </div>

                    </aside>


                    <!-- =====================================
                         RIGHT — REVIEW PANEL
                    ====================================== -->

                    <section class="amendment-editor-panel">

                        <div
                            id="amendmentDetails"
                            class="amendment-details-empty"
                        >

                            <div class="amendment-empty-icon">

                                <i class="fa-solid fa-gavel"></i>

                            </div>

                            <h3>
                                Select a Resolution
                            </h3>

                            <p>
                                Choose a resolution to review
                                its pending amendments.
                            </p>

                        </div>

                    </section>

                </div>

            </section>

        `;


        this.registerChairEvents();

    },


    /* ==========================================================
       CHAIR RESOLUTION CARD
       ========================================================== */

    renderChairResolutionCard(resolution) {

        const selected =
            this.selectedResolution &&
            this.selectedResolution.id === resolution.id;


        return `

            <article
                class="
                    amendment-resolution-card
                    ${selected ? "selected" : ""}
                "
                data-resolution="${resolution.id}"
            >

                <div class="amendment-resolution-card-header">

                    <div>

                        <h3>

                            ${this.escapeHtml(
                                resolution.title ||
                                "Untitled Resolution"
                            )}

                        </h3>

                        <small>

                            Submitted by
                            ${this.escapeHtml(
                                resolution.submittedByName ||
                                "Unknown"
                            )}

                        </small>

                    </div>

                    <span class="status-badge amendment_open">

                        OPEN

                    </span>

                </div>


                <p class="amendment-resolution-preview">

                    Review pending amendments submitted
                    against this resolution.

                </p>


                <div class="amendment-resolution-meta">

                    <span>

                        <i class="fa-solid fa-gavel"></i>

                        Chair Review

                    </span>

                    <span>

                        <i class="fa-solid fa-file-pen"></i>

                        Amendments

                    </span>

                </div>

            </article>

        `;

    },


    /* ==========================================================
       CHAIR EVENTS
       ========================================================== */

    registerChairEvents() {

        document
            .querySelectorAll(
                ".amendment-resolution-card"
            )
            .forEach(card => {

                card.onclick = () => {

                    const resolutionId =
                        Number(card.dataset.resolution);

                    this.openReviewPanel(
                        resolutionId
                    );

                };

            });

    },


    /* ==========================================================
       REVIEW PANEL
       ========================================================== */

    async openReviewPanel(resolutionId) {

        try {

            this.selectedResolution =
                this.resolutions.find(
                    resolution =>
                        resolution.id === resolutionId
                );


            if (!this.selectedResolution) {

                DebateUtils.showToast(
                    "Resolution not found."
                );

                return;

            }


            this.pendingAmendments =
                await DebateAPI.get(
                    `/debate/amendments/resolution/${resolutionId}/pending`
                );


            console.log(
                "Pending Amendments:",
                this.pendingAmendments
            );


            this.renderReviewPanel();

        }

        catch (error) {

            console.error(
                "Failed to load pending amendments:",
                error
            );

            DebateUtils.showToast(
                error.message ||
                "Failed to load pending amendments."
            );

        }

    },


    /* ==========================================================
       RENDER REVIEW PANEL
       ========================================================== */

    renderReviewPanel() {

        const container =
            document.getElementById(
                "amendmentDetails"
            );

        if (!container) return;


        container.innerHTML = `

            <div class="amendment-editor-header">

                <div>

                    <span class="section-eyebrow">
                        Chair Review
                    </span>

                    <h3>

                        ${this.escapeHtml(
                            this.selectedResolution.title
                        )}

                    </h3>

                    <p>

                        Review proposed changes before
                        they are applied.

                    </p>

                </div>


                <span class="status-badge amendment_open">

                    REVIEW

                </span>

            </div>


            <div class="amendment-review-summary">

                <div>

                    <span>
                        Pending Amendments
                    </span>

                    <strong>
                        ${this.pendingAmendments.length}
                    </strong>

                </div>

            </div>


            <div class="amendment-review-list">

                ${
                    this.pendingAmendments.length
                        ? this.pendingAmendments
                            .map(
                                amendment =>
                                    this.renderPendingAmendment(
                                        amendment
                                    )
                            )
                            .join("")
                        : `

                            <div class="amendment-empty-state compact">

                                <div class="amendment-empty-icon">

                                    <i class="fa-solid fa-circle-check"></i>

                                </div>

                                <h3>
                                    No Pending Amendments
                                </h3>

                                <p>
                                    There are currently no amendments
                                    waiting for your review.
                                </p>

                            </div>

                        `
                }

            </div>

        `;


        this.registerReviewEvents();

    },


    /* ==========================================================
       PENDING AMENDMENT CARD
       ========================================================== */

    renderPendingAmendment(amendment) {

        const type =
            amendment.amendmentType ||
            "MODIFY";


        return `

            <article class="pending-amendment-card">


                <div class="pending-amendment-header">

                    <div>

                        <span class="clause-number">

                            Clause
                            ${this.escapeHtml(
                                amendment.clauseNumber ||
                                "—"
                            )}

                        </span>

                        <h4>

                            ${this.escapeHtml(
                                type
                            )}

                        </h4>

                    </div>


                    <span class="amendment-review-status">

                        PENDING

                    </span>

                </div>


                <div class="amendment-comparison">


                    <div class="amendment-comparison-block current">

                        <span>
                            Current
                        </span>

                        <p>

                            ${this.escapeHtml(
                                amendment.currentContent ||
                                "No current content."
                            )}

                        </p>

                    </div>


                    <div class="amendment-comparison-arrow">

                        <i class="fa-solid fa-arrow-right"></i>

                    </div>


                    <div class="amendment-comparison-block proposed">

                        <span>
                            Proposed
                        </span>

                        <p>

                            ${this.escapeHtml(
                                amendment.proposedText ||
                                "No proposed text."
                            )}

                        </p>

                    </div>

                </div>


                <div class="pending-amendment-actions">

                    <button
                        class="success-btn approve-amendment-btn"
                        data-id="${amendment.id}"
                    >

                        <i class="fa-solid fa-check"></i>

                        Approve

                    </button>


                    <button
                        class="danger-btn reject-amendment-btn"
                        data-id="${amendment.id}"
                    >

                        <i class="fa-solid fa-xmark"></i>

                        Reject

                    </button>

                </div>


            </article>

        `;

    },


    /* ==========================================================
       REVIEW EVENTS
       ========================================================== */

    registerReviewEvents() {

        document
            .querySelectorAll(
                ".approve-amendment-btn"
            )
            .forEach(button => {

                button.onclick = () => {

                    this.approveAmendment(
                        Number(button.dataset.id)
                    );

                };

            });


        document
            .querySelectorAll(
                ".reject-amendment-btn"
            )
            .forEach(button => {

                button.onclick = () => {

                    this.rejectAmendment(
                        Number(button.dataset.id)
                    );

                };

            });

    },


    /* ==========================================================
       APPROVE
       ========================================================== */

    async approveAmendment(id) {

        try {

            await DebateAPI.post(
                `/debate/amendments/${id}/approve`
            );


            DebateUtils.showToast(
                "Amendment approved."
            );


            await this.openReviewPanel(
                this.selectedResolution.id
            );

        }

        catch (error) {

            console.error(
                "Failed to approve amendment:",
                error
            );

            DebateUtils.showToast(
                error.message ||
                "Failed to approve amendment."
            );

        }

    },


    /* ==========================================================
       REJECT
       ========================================================== */

    async rejectAmendment(id) {

        try {

            await DebateAPI.post(
                `/debate/amendments/${id}/reject`
            );


            DebateUtils.showToast(
                "Amendment rejected."
            );


            await this.openReviewPanel(
                this.selectedResolution.id
            );

        }

        catch (error) {

            console.error(
                "Failed to reject amendment:",
                error
            );

            DebateUtils.showToast(
                error.message ||
                "Failed to reject amendment."
            );

        }

    },


    /* ==========================================================
       HELPERS
       ========================================================== */

    truncate(text, length = 150) {

        if (!text) return "";

        if (text.length <= length) {
            return text;
        }

        return text.substring(0, length) + "...";

    },


    escapeHtml(value) {

        if (value === null || value === undefined) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }

};


window.AmendmentCenter = AmendmentCenter;