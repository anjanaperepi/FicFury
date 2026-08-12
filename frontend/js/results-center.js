const ResultsCenter = {

    room: null,
    results: [],


    /* ==========================================================
       INITIALIZATION
       ========================================================== */

    async init(room) {

        this.room = room;

        await this.refresh();

    },


    /* ==========================================================
       LOAD COMPLETED RESULTS
       ========================================================== */

    async refresh() {

        try {

            const sessionId =
                this.room.state.sessionId;


            const resolutions =
                await DebateAPI.get(
                    `/debate/resolutions/session/${sessionId}`
                );


            const completed =
                (resolutions || []).filter(
                    resolution =>
                        resolution.status === "PASSED" ||
                        resolution.status === "FAILED"
                );


            this.results = [];


            for (const resolution of completed) {

                const result =
                    await DebateAPI.get(
                        `/debate/resolutions/${resolution.id}/results`
                    );


                this.results.push(result);

            }


            this.render();

        }

        catch (error) {

            console.error(
                "Results Center failed to load:",
                error
            );


            DebateUtils.showToast(
                error.message ||
                "Failed to load results."
            );

        }

    },


    /* ==========================================================
       MAIN RENDER
       ========================================================== */

    render() {

        const container =
            document.getElementById(
                "resultsContainer"
            );


        if (!container) {

            console.error(
                "resultsContainer not found."
            );

            return;

        }


        if (!this.results.length) {

            container.innerHTML = `

                <section class="results-center">

                    <div class="results-section-header">

                        <div>

                            <span class="section-eyebrow">
                                Committee Record
                            </span>

                            <h2>
                                Debate Results
                            </h2>

                            <p>
                                Final outcomes from completed
                                committee voting.
                            </p>

                        </div>

                    </div>


                    <div class="results-empty-state">

                        <div class="results-empty-icon">

                            <i class="fa-solid fa-square-poll-vertical"></i>

                        </div>

                        <h3>
                            No Results Yet
                        </h3>

                        <p>
                            Voting has not concluded for any
                            resolutions.
                        </p>

                    </div>

                </section>

            `;

            return;

        }


        container.innerHTML = `

            <section class="results-center">

                <div class="results-section-header">

                    <div>

                        <span class="section-eyebrow">
                            Committee Record
                        </span>

                        <h2>
                            Debate Results
                        </h2>

                        <p>
                            Final outcomes from completed
                            committee voting.
                        </p>

                    </div>


                    <div class="results-count-badge">

                        <strong>
                            ${this.results.length}
                        </strong>

                        <span>
                            Completed
                        </span>

                    </div>

                </div>


                <div class="results-list">

                    ${this.results
                        .map(
                            result =>
                                this.renderResultCard(
                                    result
                                )
                        )
                        .join("")}

                </div>

            </section>

        `;


        this.registerEvents();

    },


    /* ==========================================================
       RESULT CARD
       ========================================================== */

    renderResultCard(result) {

        const yes =
            Number(result.yesVotes || 0);

        const no =
            Number(result.noVotes || 0);



        const total =
            yes + no ;


        const yesPercent =
            total > 0
                ? Math.round((yes / total) * 100)
                : 0;


        const noPercent =
            total > 0
                ? Math.round((no / total) * 100)
                : 0;




        const passed =
            result.status === "PASSED";


        return `

            <article class="result-card">


                <!-- =========================================
                     HEADER
                ========================================== -->

                <div class="result-card-header">

                    <div>

                        <span class="result-card-label">
                            Final Resolution
                        </span>

                        <h3>

                            ${this.escapeHtml(
                                result.title ||
                                "Untitled Resolution"
                            )}

                        </h3>

                    </div>


                    <span
                        class="
                            result-status-badge
                            ${passed ? "passed" : "failed"}
                        "
                    >

                        <i
                            class="
                                fa-solid
                                ${passed
                                    ? "fa-check"
                                    : "fa-xmark"}
                            "
                        ></i>

                        ${passed ? "PASSED" : "FAILED"}

                    </span>

                </div>


                <!-- =========================================
                     VOTE STATISTICS
                ========================================== -->

                <div class="result-stat-grid">


                    <div class="result-stat yes">

                        <span>
                            YES
                        </span>

                        <strong>
                            ${yes}
                        </strong>

                    </div>


                    <div class="result-stat no">

                        <span>
                            NO
                        </span>

                        <strong>
                            ${no}
                        </strong>

                    </div>



                    <div class="result-stat participation">

                        <span>
                            PARTICIPATION
                        </span>

                        <strong>
                            ${Number(
                                result.participationPercentage || 0
                            ).toFixed(1)}%
                        </strong>

                    </div>

                </div>


                <!-- =========================================
                     VOTE DISTRIBUTION
                ========================================== -->

                <div class="result-distribution">

                    <div class="result-distribution-header">

                        <span>
                            Final Vote Distribution
                        </span>

                        <strong>
                            ${total} Votes
                        </strong>

                    </div>


                    <div class="result-vote-bar">

                        <div
                            class="result-vote-yes"
                            style="width:${yesPercent}%"
                        ></div>

                        <div
                            class="result-vote-no"
                            style="width:${noPercent}%"
                        ></div>


                    </div>


                    <div class="result-vote-labels">

                        <span>
                            YES ${yesPercent}%
                        </span>

                        <span>
                            NO ${noPercent}%
                        </span>



                    </div>

                </div>


                <!-- =========================================
                     AMENDMENT SUMMARY
                ========================================== -->

                <div class="amendment-result-summary">

                    <div>

                        <span>
                            Approved Amendments
                        </span>

                        <strong>
                            ${Number(
                                result.approvedAmendments || 0
                            )}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Rejected Amendments
                        </span>

                        <strong>
                            ${Number(
                                result.rejectedAmendments || 0
                            )}
                        </strong>

                    </div>

                </div>


                <!-- =========================================
                     ACTION
                ========================================== -->

                <div class="result-card-actions">

                    <button
                        class="secondary-btn view-final-resolution-btn"
                        data-id="${result.resolutionId}"
                        type="button"
                    >

                        <i class="fa-solid fa-file-lines"></i>

                        View Final Resolution

                    </button>

                </div>


            </article>

        `;

    },


    /* ==========================================================
       EVENTS
       ========================================================== */

    registerEvents() {

        document
            .querySelectorAll(
                ".view-final-resolution-btn"
            )
            .forEach(button => {

                button.onclick = () => {

                    this.openFinalResolution(
                        Number(
                            button.dataset.id
                        )
                    );

                };

            });

    },


    /* ==========================================================
       FINAL RESOLUTION
       ========================================================== */

async openFinalResolution(resolutionId) {

    try {

        console.log(
            "Loading final resolution:",
            resolutionId
        );

        const clauses =
            await DebateAPI.get(
                `/debate/clauses/resolution/${resolutionId}`
            );

        console.log(
            "Final resolution clauses:",
            clauses
        );

        this.renderFinalResolutionModal(
            clauses || []
        );

    }

    catch (error) {

        console.error(
            "Failed to load final resolution:",
            error
        );

        DebateUtils.showToast(
            error.message ||
            "Failed to load the final resolution."
        );

    }

},


    /* ==========================================================
       FINAL RESOLUTION MODAL
       ========================================================== */

    renderFinalResolutionModal(
        clauses
    ) {

        const html = `

            <div class="final-resolution-modal">

                <div class="final-resolution-modal-header">

                    <div>

                        <span class="section-eyebrow">
                            Official Committee Record
                        </span>

                        <h2>
                            Final Resolution
                        </h2>

                    </div>


                    <button
                        id="closeFinalResolution"
                        class="modal-close-btn"
                        type="button"
                    >

                        ×

                    </button>

                </div>


                <div class="final-resolution-modal-body">

                    ${
                        clauses.length

                            ? clauses
                                .map(
                                    clause => `

                                        <article
                                            class="final-clause-card"
                                        >

                                            <div
                                                class="final-clause-header"
                                            >

                                                <span>
                                                    Clause
                                                    ${this.escapeHtml(
                                                        clause.clauseNumber
                                                    )}
                                                </span>

                                            </div>


                                            <p>

                                                ${this.escapeHtml(
                                                    clause.content ||
                                                    ""
                                                )}

                                            </p>

                                        </article>

                                    `
                                )
                                .join("")

                            : `

                                <div class="results-empty-state compact">

                                    <div class="results-empty-icon">

                                        <i class="fa-solid fa-file-circle-xmark"></i>

                                    </div>

                                    <h3>
                                        No Clauses Found
                                    </h3>

                                    <p>
                                        The final resolution contains
                                        no available clauses.
                                    </p>

                                </div>

                            `
                    }

                </div>

            </div>

        `;


        DebateUtils.showModal(html);


        const closeButton =
            document.getElementById(
                "closeFinalResolution"
            );


        if (closeButton) {

            closeButton.onclick =
                DebateUtils.closeModal;

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


window.ResultsCenter = ResultsCenter;