const TimelineCenter = {

    room: null,
    activities: [],


    /* ==========================================================
       INITIALIZATION
       ========================================================== */

    async init(room) {

        this.room = room;

        await this.refresh();

    },


    /* ==========================================================
       LOAD TIMELINE
       ========================================================== */

    async refresh() {

        try {

            const sessionId =
                this.room.state.sessionId;


            this.activities =
                await DebateAPI.get(
                    `/debate/activity/timeline/${sessionId}`
                );


            /*
             * Make sure newest activities appear first.
             * If the backend already returns them in the correct
             * order, this simply preserves chronological data.
             */

            this.activities =
                (this.activities || [])
                    .slice()
                    .sort(
                        (a, b) =>
                            new Date(b.createdAt) -
                            new Date(a.createdAt)
                    );


            this.render();

        }

        catch (error) {

            console.error(
                "Timeline Center failed to load:",
                error
            );


            DebateUtils.showToast(
                error.message ||
                "Failed to load debate timeline."
            );

        }

    },


    /* ==========================================================
       MAIN RENDER
       ========================================================== */

    render() {

        const container =
            document.getElementById(
                "timelineContainer"
            );


        if (!container) {

            console.error(
                "timelineContainer not found."
            );

            return;

        }


        /* -----------------------------------------------
           Empty state
        ------------------------------------------------ */

        if (!this.activities.length) {

            container.innerHTML = `

                <section class="timeline-center">

                    <div class="timeline-section-header">

                        <div>

                            <span class="section-eyebrow">
                                Session Record
                            </span>

                            <h2>
                                Debate Timeline
                            </h2>

                            <p>
                                A chronological record of
                                activities during this session.
                            </p>

                        </div>

                    </div>


                    <div class="timeline-empty-state">

                        <div class="timeline-empty-icon">

                            <i class="fa-solid fa-clock-rotate-left"></i>

                        </div>

                        <h3>
                            No Activity Yet
                        </h3>

                        <p>
                            Debate activities will appear here
                            as the session progresses.
                        </p>

                    </div>

                </section>

            `;

            return;

        }


        /* -----------------------------------------------
           Timeline
        ------------------------------------------------ */

        container.innerHTML = `

            <section class="timeline-center">

                <div class="timeline-section-header">

                    <div>

                        <span class="section-eyebrow">
                            Session Record
                        </span>

                        <h2>
                            Debate Timeline
                        </h2>

                        <p>
                            A chronological record of activities
                            during this session.
                        </p>

                    </div>


                    <div class="timeline-count-badge">

                        <strong>
                            ${this.activities.length}
                        </strong>

                        <span>
                            Activities
                        </span>

                    </div>

                </div>


                <div class="timeline-feed">

                   

                    ${this.activities
                        .map(
                            (activity, index) =>
                                this.renderActivity(
                                    activity,
                                    index
                                )
                        )
                        .join("")}

                </div>

            </section>

        `;

    },


    /* ==========================================================
       ACTIVITY
       ========================================================== */

    renderActivity(
        activity,
        index
    ) {

        const type =
            activity.activityType || "";


        const title =
            activity.title ||
            this.getFallbackTitle(type);


        const description =
            activity.description ||
            "";


        const userName =
            activity.userName ||
            "System";


        const userRole =
            activity.userRole ||
            "SYSTEM";


        const icon =
            this.getIcon(type);


        const tone =
            this.getTone(type);


        return `

            <article
                class="
                    timeline-entry
                    ${tone}
                "
            >


                <!-- Timeline marker -->

                <div class="timeline-marker">

                    <div class="timeline-icon">

                        <i
                            class="fa-solid ${icon}"
                        ></i>

                    </div>

                </div>


                <!-- Timeline content -->

                <div class="timeline-content">

                    <div class="timeline-header">

                        <div>

                            <span class="timeline-type">

                                ${this.formatActivityType(
                                    type
                                )}

                            </span>

                            <h3>

                                ${this.escapeHtml(
                                    title
                                )}

                            </h3>

                        </div>


                        <time
                            class="timeline-time"
                            datetime="${this.escapeHtml(
                                activity.createdAt || ""
                            )}"
                        >

                            ${this.formatDate(
                                activity.createdAt
                            )}

                        </time>

                    </div>


                    ${
                        description
                            ? `

                                <p class="timeline-description">

                                    ${this.escapeHtml(
                                        description
                                    )}

                                </p>

                            `
                            : ""
                    }


                    <div class="timeline-footer">

                        <span class="timeline-user">

                            <i class="fa-solid fa-user"></i>

                            ${this.escapeHtml(
                                userName
                            )}

                        </span>


                        <span class="role-badge">

                            ${this.escapeHtml(
                                userRole
                            )}

                        </span>

                    </div>

                </div>

            </article>

        `;

    },


    /* ==========================================================
       ICONS
       ========================================================== */

    getIcon(type) {

        const icons = {

            RESOLUTION_SUBMITTED:
                "fa-file-circle-plus",

            RESOLUTION_APPROVED:
                "fa-circle-check",

            RESOLUTION_REJECTED:
                "fa-circle-xmark",

            AMENDMENTS_OPENED:
                "fa-folder-open",

            AMENDMENTS_CLOSED:
                "fa-folder-closed",

            AMENDMENT_SUBMITTED:
                "fa-pen",

            AMENDMENT_APPROVED:
                "fa-check",

            AMENDMENT_REJECTED:
                "fa-xmark",

            VOTING_OPENED:
                "fa-check-to-slot",

            VOTING_CLOSED:
                "fa-lock",

            RESOLUTION_PASSED:
                "fa-trophy",

            RESOLUTION_FAILED:
                "fa-ban"

        };


        return (
            icons[type] ||
            "fa-clock"
        );

    },


    /* ==========================================================
       ACTIVITY TONES
       ========================================================== */

    getTone(type) {

        if (
            type === "RESOLUTION_PASSED" ||
            type === "AMENDMENT_APPROVED" ||
            type === "RESOLUTION_APPROVED"
        ) {

            return "timeline-success";

        }


        if (
            type === "RESOLUTION_FAILED" ||
            type === "AMENDMENT_REJECTED" ||
            type === "RESOLUTION_REJECTED"
        ) {

            return "timeline-danger";

        }


        if (
            type === "VOTING_OPENED" ||
            type === "VOTING_CLOSED"
        ) {

            return "timeline-voting";

        }


        if (
            type === "AMENDMENTS_OPENED" ||
            type === "AMENDMENTS_CLOSED" ||
            type === "AMENDMENT_SUBMITTED"
        ) {

            return "timeline-amendment";

        }


        return "timeline-default";

    },


    /* ==========================================================
       FALLBACK TITLES
       ========================================================== */

    getFallbackTitle(type) {

        const titles = {

            RESOLUTION_SUBMITTED:
                "Resolution Submitted",

            RESOLUTION_APPROVED:
                "Resolution Approved",

            RESOLUTION_REJECTED:
                "Resolution Rejected",

            AMENDMENTS_OPENED:
                "Amendments Opened",

            AMENDMENTS_CLOSED:
                "Amendments Closed",

            AMENDMENT_SUBMITTED:
                "Amendment Submitted",

            AMENDMENT_APPROVED:
                "Amendment Approved",

            AMENDMENT_REJECTED:
                "Amendment Rejected",

            VOTING_OPENED:
                "Voting Opened",

            VOTING_CLOSED:
                "Voting Closed",

            RESOLUTION_PASSED:
                "Resolution Passed",

            RESOLUTION_FAILED:
                "Resolution Failed"

        };


        return (
            titles[type] ||
            "Debate Activity"
        );

    },


    /* ==========================================================
       ACTIVITY TYPE LABEL
       ========================================================== */

    formatActivityType(type) {

        if (!type) {
            return "ACTIVITY";
        }


        return type
            .replace(/_/g, " ")
            .toLowerCase()
            .replace(
                /\b\w/g,
                character =>
                    character.toUpperCase()
            );

    },


    /* ==========================================================
       DATE FORMAT
       ========================================================== */

    formatDate(date) {

        if (!date) {
            return "Unknown time";
        }


        const parsed =
            new Date(date);


        if (Number.isNaN(
            parsed.getTime()
        )) {

            return "Unknown time";

        }


        return parsed.toLocaleString(
            undefined,
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        );

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
            .replace(
                /&/g,
                "&amp;"
            )
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


window.TimelineCenter = TimelineCenter;