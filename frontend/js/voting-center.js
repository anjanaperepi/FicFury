const VotingCenter = {

    room: null,
    resolutions: [],


    /* ==========================================================
       INITIALIZATION
       ========================================================== */

    async init(room) {

        this.room = room;

        await this.refresh();

    },


    /* ==========================================================
       LOAD CURRENT VOTING RESOLUTIONS
       ========================================================== */

    async refresh() {

        try {

            const sessionId =
                this.room.state.sessionId;


            const resolutions =
                await DebateAPI.get(
                    `/debate/resolutions/session/${sessionId}`
                );


            this.resolutions =
                (resolutions || []).filter(
                    resolution =>
                        resolution.status === "VOTING"
                );


            /* -----------------------------------------------
               Load voting information for each resolution
            ------------------------------------------------ */

            for (const resolution of this.resolutions) {

                resolution.results =
                    await DebateAPI.get(
                        `/debate/votes/results/${resolution.id}/${this.room.state.user.id}`
                    );

            }


            this.render();

        }

        catch (error) {

            console.error(
                "Voting Center failed to load:",
                error
            );


            DebateUtils.showToast(
                error.message ||
                "Failed to load voting information."
            );

        }

    },


    /* ==========================================================
       MAIN RENDER
       ========================================================== */

    render() {

        if (
            this.room.state.role === "CHAIR"
        ) {

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
            document.getElementById(
                "votingContainer"
            );


        if (!container) {

            console.error(
                "votingContainer not found."
            );

            return;

        }


        /* -----------------------------------------------
           Empty state
        ------------------------------------------------ */

        if (!this.resolutions.length) {

            container.innerHTML = `

                <section class="voting-center">

                    <div class="voting-section-header">

                        <div>

                            <span class="section-eyebrow">
                                Delegate Workspace
                            </span>

                            <h2>
                                Resolution Voting
                            </h2>

                            <p>
                                Resolutions currently open
                                for committee voting.
                            </p>

                        </div>

                    </div>


                    <div class="voting-empty-state">

                        <div class="voting-empty-icon">

                            <i class="fa-solid fa-square-poll-vertical"></i>

                        </div>

                        <h3>
                            No Active Voting
                        </h3>

                        <p>
                            The Chair has not opened voting
                            on any resolution yet.
                        </p>

                    </div>

                </section>

            `;

            return;

        }


        /* -----------------------------------------------
           Active voting
        ------------------------------------------------ */

        container.innerHTML = `

            <section class="voting-center">

                <div class="voting-section-header">

                    <div>

                        <span class="section-eyebrow">
                            Delegate Workspace
                        </span>

                        <h2>
                            Resolution Voting
                        </h2>

                        <p>
                            Cast your vote on resolutions
                            currently before the committee.
                        </p>

                    </div>


                    <div class="voting-count-badge">

                        <strong>
                            ${this.resolutions.length}
                        </strong>

                        <span>
                            Active
                        </span>

                    </div>

                </div>


                <div class="voting-resolution-list">

                    ${this.resolutions
                        .map(
                            resolution =>
                                this.renderDelegateResolution(
                                    resolution
                                )
                        )
                        .join("")}

                </div>

            </section>

        `;


        this.registerDelegateEvents();

    },


    /* ==========================================================
       DELEGATE RESOLUTION CARD
       ========================================================== */

    renderDelegateResolution(resolution) {

        const results =
            resolution.results || {};


        const hasVoted =
            results.hasVoted === true;


        return `

            <article
                class="voting-resolution-card"
                data-resolution="${resolution.id}"
            >

                <!-- Card Header -->

                <div class="voting-card-header">

                    <div>

                        <span class="voting-card-label">
                            Resolution
                        </span>

                        <h3>

                            ${this.escapeHtml(
                                resolution.title ||
                                "Untitled Resolution"
                            )}

                        </h3>

                    </div>


                    <span class="status-badge voting">

                        VOTING

                    </span>

                </div>


                <!-- Resolution Content -->

                <div class="voting-resolution-content">

                    <p>

                        ${this.escapeHtml(
                            resolution.content ||
                            "No resolution content available."
                        )}

                    </p>

                </div>


                ${
                    hasVoted

                    ? this.renderVoteConfirmation(
                        results
                    )

                    : this.renderVoteActions(
                        resolution
                    )
                }

            </article>

        `;

    },


    /* ==========================================================
       VOTE BUTTONS
       ========================================================== */

    renderVoteActions(resolution) {

        return `

            <div class="voting-action-area">

                <div class="voting-prompt">

                    <span>
                        CAST YOUR VOTE
                    </span>

                    <p>
                        Your vote will be recorded
                        for this resolution.
                    </p>

                </div>


                <div class="vote-actions">

                    <button
                        class="vote-btn yes-btn"
                        data-resolution="${resolution.id}"
                        data-vote="YES"
                        type="button"
                    >

                        <i class="fa-solid fa-check"></i>

                        YES

                    </button>


                    <button
                        class="vote-btn no-btn"
                        data-resolution="${resolution.id}"
                        data-vote="NO"
                        type="button"
                    >

                        <i class="fa-solid fa-xmark"></i>

                        NO

                    </button>

                </div>

            </div>

        `;

    },


    /* ==========================================================
       VOTE CONFIRMATION
       ========================================================== */

    renderVoteConfirmation(results) {

        return `

            <div class="vote-confirmation">

                <div class="vote-confirmation-icon">

                    <i class="fa-solid fa-circle-check"></i>

                </div>


                <div>

                    <span class="vote-confirmation-label">
                        VOTE RECORDED
                    </span>

                    <strong>
                        You voted
                        ${this.escapeHtml(
                            results.currentUserVote ||
                            "—"
                        )}
                    </strong>

                    <p>
                        Your vote has been successfully
                        recorded for this resolution.
                    </p>

                </div>

            </div>

        `;

    },


    /* ==========================================================
       DELEGATE EVENTS
       ========================================================== */

    registerDelegateEvents() {

        document
            .querySelectorAll(".vote-btn")
            .forEach(button => {

                button.onclick = () => {

                    const resolutionId =
                        Number(
                            button.dataset.resolution
                        );


                    const voteType =
                        button.dataset.vote;


                    this.castVote(
                        resolutionId,
                        voteType
                    );

                };

            });

    },


    /* ==========================================================
       CAST VOTE
       ========================================================== */

    async castVote(
        resolutionId,
        voteType
    ) {

        try {

            const buttons =
                document.querySelectorAll(
                    `[data-resolution="${resolutionId}"].vote-btn`
                );


            buttons.forEach(
                button =>
                    button.disabled = true
            );


            await DebateAPI.post(
                "/debate/votes",
                {

                    sessionId:
                        this.room.state.sessionId,

                    resolutionId:
                        resolutionId,

                    delegateId:
                        this.room.state.user.id,

                    voteType:
                        voteType

                }
            );


            DebateUtils.showToast(
                "Vote recorded successfully."
            );


            await this.refresh();

        }

        catch (error) {

            console.error(
                "Failed to cast vote:",
                error
            );


            DebateUtils.showToast(
                error.message ||
                "Failed to record vote."
            );

        }

    },


    /* ==========================================================
       CHAIR VIEW
       ========================================================== */

    renderChairView() {

        const container =
            document.getElementById(
                "votingContainer"
            );


        if (!container) {

            console.error(
                "votingContainer not found."
            );

            return;

        }


        /* -----------------------------------------------
           Empty state
        ------------------------------------------------ */

        if (!this.resolutions.length) {

            container.innerHTML = `

                <section class="voting-center">

                    <div class="voting-section-header">

                        <div>

                            <span class="section-eyebrow">
                                Chair Control
                            </span>

                            <h2>
                                Voting Control
                            </h2>

                            <p>
                                Monitor active voting sessions
                                and close voting when complete.
                            </p>

                        </div>

                    </div>


                    <div class="voting-empty-state">

                        <div class="voting-empty-icon">

                            <i class="fa-solid fa-gavel"></i>

                        </div>

                        <h3>
                            No Resolutions Ready
                        </h3>

                        <p>
                            There are currently no resolutions
                            in voting.
                        </p>

                    </div>

                </section>

            `;

            return;

        }


        /* -----------------------------------------------
           Chair workspace
        ------------------------------------------------ */

        container.innerHTML = `

            <section class="voting-center">

                <div class="voting-section-header">

                    <div>

                        <span class="section-eyebrow">
                            Chair Control
                        </span>

                        <h2>
                            Voting Control
                        </h2>

                        <p>
                            Monitor votes and manage active
                            voting sessions.
                        </p>

                    </div>


                    <div class="voting-count-badge">

                        <strong>
                            ${this.resolutions.length}
                        </strong>

                        <span>
                            Active
                        </span>

                    </div>

                </div>


                <div class="chair-voting-list">

                    ${this.resolutions
                        .map(
                            resolution =>
                                this.renderChairResolution(
                                    resolution
                                )
                        )
                        .join("")}

                </div>

            </section>

        `;


        this.registerChairEvents();

    },


    /* ==========================================================
       CHAIR RESOLUTION
       ========================================================== */

    renderChairResolution(resolution) {

        const results =
            resolution.results || {};


        const yesVotes =
            Number(results.yesVotes || 0);


        const noVotes =
            Number(results.noVotes || 0);


        const totalVotes =
            Number(results.totalVotes || 0);


        const yesPercent =
            totalVotes > 0
                ? Math.round(
                    (yesVotes / totalVotes) * 100
                )
                : 0;


        const noPercent =
            totalVotes > 0
                ? Math.round(
                    (noVotes / totalVotes) * 100
                )
                : 0;


        return `

            <article
                class="chair-voting-card"
                data-resolution="${resolution.id}"
            >

                <div class="voting-card-header">

                    <div>

                        <span class="voting-card-label">
                            Active Resolution
                        </span>

                        <h3>

                            ${this.escapeHtml(
                                resolution.title ||
                                "Untitled Resolution"
                            )}

                        </h3>

                    </div>


                    <span class="status-badge voting">

                        VOTING

                    </span>

                </div>


                <!-- Vote Summary -->

                <div class="vote-summary-grid">


                    <div class="vote-stat yes">

                        <span>
                            YES
                        </span>

                        <strong>
                            ${yesVotes}
                        </strong>

                    </div>


                    <div class="vote-stat no">

                        <span>
                            NO
                        </span>

                        <strong>
                            ${noVotes}
                        </strong>

                    </div>


                    <div class="vote-stat total">

                        <span>
                            TOTAL
                        </span>

                        <strong>
                            ${totalVotes}
                        </strong>

                    </div>

                </div>


                <!-- Vote Distribution -->

                <div class="vote-distribution">

                    <div class="vote-distribution-header">

                        <span>
                            Vote Distribution
                        </span>

                        <strong>
                            ${totalVotes} votes
                        </strong>

                    </div>


                    <div class="vote-bar">

                        <div
                            class="vote-bar-yes"
                            style="width:${yesPercent}%"
                        ></div>

                        <div
                            class="vote-bar-no"
                            style="width:${noPercent}%"
                        ></div>

                    </div>


                    <div class="vote-bar-labels">

                        <span>
                            YES ${yesPercent}%
                        </span>

                        <span>
                            NO ${noPercent}%
                        </span>

                    </div>

                </div>


                <!-- Close Voting -->

                <div class="chair-voting-actions">

                    <button
                        class="close-voting-btn"
                        data-resolution="${resolution.id}"
                        type="button"
                    >

                        <i class="fa-solid fa-lock"></i>

                        Close Voting

                    </button>

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
                ".close-voting-btn"
            )
            .forEach(button => {

                button.onclick = () => {

                    this.closeVoting(
                        Number(
                            button.dataset.resolution
                        )
                    );

                };

            });

    },


    /* ==========================================================
       CLOSE VOTING
       ========================================================== */

    async closeVoting(resolutionId) {

        try {

            const button =
                document.querySelector(
                    `.close-voting-btn[data-resolution="${resolutionId}"]`
                );


            if (button) {

                button.disabled = true;

            }


            await DebateAPI.post(
                `/debate/resolutions/${resolutionId}/close-voting`
            );


            DebateUtils.showToast(
                "Voting closed."
            );


            await this.refresh();

        }

        catch (error) {

            console.error(
                "Failed to close voting:",
                error
            );


            DebateUtils.showToast(
                error.message ||
                "Failed to close voting."
            );

        }

    },


    /* ==========================================================
       HTML SAFETY
       ========================================================== */

    escapeHtml(value) {

        if (
            value === null ||
            value === undefined
        ) {

            return "";

        }


        return String(value)
            .replace(/&/g, "&amp;")
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


window.VotingCenter = VotingCenter;