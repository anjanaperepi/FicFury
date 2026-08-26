const FURYWebSocket = {

    client: null,

    connected: false,

    sessionId: null,


    connect(sessionId) {

        if (!sessionId) {
            console.warn(
                "⚠️ WebSocket: No session ID provided."
            );
            return;
        }

        this.sessionId = Number(sessionId);

        /*
         * Prevent duplicate connections.
         */
        if (
            this.client &&
            this.connected
        ) {
            console.log(
                "🔌 WebSocket already connected."
            );

            return;
        }


        console.log(
            "🔌 Connecting to FIC FURY WebSocket...",
            this.sessionId
        );


        this.client = new StompJs.Client({

            brokerURL:
                "ws://localhost:8080/ws",

            reconnectDelay: 5000,

            debug: (message) => {

                /*
                 * Keep STOMP debugging quiet unless
                 * something actually needs investigating.
                 */

                if (
                    message.includes("ERROR") ||
                    message.includes("CONNECTED")
                ) {
                    console.log(
                        "[STOMP]",
                        message
                    );
                }
            }

        });


        /*
         * Successful STOMP connection
         */
        this.client.onConnect = () => {

            this.connected = true;

            console.log(
                "✅ FIC FURY WebSocket connected."
            );


            const destination =
                `/topic/session/${this.sessionId}`;


            console.log(
                "📡 Subscribing to:",
                destination
            );


            this.client.subscribe(
                destination,
                (message) => {

                    try {

                        const event =
                            JSON.parse(
                                message.body
                            );


                        console.log(
                            "📨 Committee event:",
                            event
                        );


                        this.handleEvent(event);

                    }
                    catch (error) {

                        console.error(
                            "❌ Failed to process WebSocket event:",
                            error
                        );

                    }

                }
            );


            
        /*
         * =====================================================
         * PRIVATE DIPLOMACY EVENTS
         * =====================================================
         */

        const diplomacyDestination =
            "/user/queue/diplomacy";

        console.log(
            "📡 Subscribing to:",
            diplomacyDestination
        );

        this.client.subscribe(
            diplomacyDestination,
            (message) => {

                try {

                    const event =
                        JSON.parse(
                            message.body
                        );

                    console.log(
                        "💬 Private diplomacy event:",
                        event
                    );

                    this.handleDiplomacyEvent(
                        event
                    );

                }
                catch (error) {

                    console.error(
                        "❌ Failed to process private diplomacy event:",
                        error
                    );

                }

            }
        );
        };

        /*
         * STOMP-level error
         */
        this.client.onStompError =
            (frame) => {

                console.error(
                    "❌ STOMP error:",
                    frame.headers["message"]
                );

                console.error(
                    frame.body
                );

            };


        /*
         * Raw WebSocket error
         */
        this.client.onWebSocketError =
            (error) => {

                console.error(
                    "❌ WebSocket error:",
                    error
                );

            };


        /*
         * Connection closed
         */
        this.client.onWebSocketClose =
            () => {

                this.connected = false;

                console.warn(
                    "🔌 FIC FURY WebSocket disconnected."
                );

            };


        this.client.activate();
    },

    handleDiplomacyEvent(event) {

        if (!event) {
            return;
        }

        switch (event.type) {

            case "MESSAGE_SENT":

                console.log(
                    "💬 Diplomacy message received:",
                    event
                );

                if (
                    window.Diplomacy &&
                    typeof window.Diplomacy
                        .handleWebSocketEvent ===
                        "function"
                ) {

                    window.Diplomacy
                        .handleWebSocketEvent(
                            event
                        );
                }

                break;


            case "CONVERSATION_CREATED":

                console.log(
                    "💬 Diplomacy conversation created:",
                    event
                );

                if (
                    window.Diplomacy &&
                    typeof window.Diplomacy
                        .handleWebSocketEvent ===
                        "function"
                ) {

                    window.Diplomacy
                        .handleWebSocketEvent(
                            event
                        );
                }

                break;


            default:

                console.log(
                    "ℹ️ Unhandled diplomacy event:",
                    event.type
                );

                break;
        }
    },


handleEvent(event) {

    if (!event) {
        return;
    }


    switch (event.type) {


        /* =========================================
           SPEAKER QUEUE
           ========================================= */

        case "SPEAKER_ADDED":
        case "SPEAKER_STARTED":
        case "SPEAKER_COMPLETED":
        case "SPEAKER_SKIPPED":
        case "SPEAKER_PAUSED":
        case "SPEAKER_RESUMED":
        case "SPEAKER_TIME_EXTENDED":

            console.log(
                "🎤 Speaker queue updated:",
                event.type
            );


            if (
                window.SpeakerQueue &&
                typeof window.SpeakerQueue.refresh ===
                    "function"
            ) {

                window.SpeakerQueue
                    .refresh()
                    .catch(error => {

                        console.error(
                            `Failed to refresh speaker queue after ${event.type}:`,
                            error
                        );

                    });

            }

            break;


        /* =========================================
           VOTING
           ========================================= */

        case "VOTING_OPENED":

            console.log(
                "🗳️ Voting opened."
            );


            if (
                window.VotingCenter &&
                typeof window.VotingCenter.refresh ===
                    "function"
            ) {

                window.VotingCenter
                    .refresh()
                    .catch(error => {

                        console.error(
                            "Failed to refresh voting after VOTING_OPENED:",
                            error
                        );

                    });

            }

            break;


        case "VOTE_CAST":

            console.log(
                "🗳️ Vote cast."
            );


            if (
                window.VotingCenter &&
                typeof window.VotingCenter.refresh ===
                    "function"
            ) {

                window.VotingCenter
                    .refresh()
                    .catch(error => {

                        console.error(
                            "Failed to refresh voting after VOTE_CAST:",
                            error
                        );

                    });

            }


            /*
             * Also refresh results if the Results Center
             * is currently available.
             */

            if (
                window.ResultsCenter &&
                typeof window.ResultsCenter.refresh ===
                    "function"
            ) {

                window.ResultsCenter
                    .refresh()
                    .catch(error => {

                        console.error(
                            "Failed to refresh results after VOTE_CAST:",
                            error
                        );

                    });

            }

            break;


        case "VOTING_CLOSED":

            console.log(
                "🔒 Voting closed."
            );


            if (
                window.VotingCenter &&
                typeof window.VotingCenter.refresh ===
                    "function"
            ) {

                window.VotingCenter
                    .refresh()
                    .catch(error => {

                        console.error(
                            "Failed to refresh voting after VOTING_CLOSED:",
                            error
                        );

                    });

            }


            if (
                window.ResultsCenter &&
                typeof window.ResultsCenter.refresh ===
                    "function"
            ) {

                window.ResultsCenter
                    .refresh()
                    .catch(error => {

                        console.error(
                            "Failed to refresh results after VOTING_CLOSED:",
                            error
                        );

                    });

            }

            break;


        /* =========================================
           MOTIONS
           ========================================= */

        case "MOTION_SUBMITTED":
        case "MOTION_APPROVED":
        case "MOTION_DISMISSED":
        case "MOTION_EXECUTED":

            console.log(
                "📋 Motion updated:",
                event.type
            );


            if (
                window.MotionPanel &&
                typeof window.MotionPanel.refresh ===
                    "function"
            ) {

                window.MotionPanel
                    .refresh()
                    .catch(error => {

                        console.error(
                            `Failed to refresh motions after ${event.type}:`,
                            error
                        );

                    });

            }

            break;


        /* =========================================
           RESOLUTIONS
           ========================================= */
case "RESOLUTION_SUBMITTED":
case "RESOLUTION_APPROVED":
case "RESOLUTION_REJECTED":
case "AMENDMENTS_OPENED":
case "AMENDMENTS_CLOSED":
case "VOTING_OPENED":
case "VOTING_CLOSED":
case "RESOLUTION_PASSED":
case "RESOLUTION_FAILED":

    console.log(
        "📜 Resolution updated:",
        event.type
    );

    if (
        window.ResolutionCenter &&
        typeof window.ResolutionCenter.refresh ===
            "function"
    ) {

        window.ResolutionCenter
            .refresh()
            .catch(error => {

                console.error(
                    `Failed to refresh resolutions after ${event.type}:`,
                    error
                );

            });
    }

    break;

        /* =========================================
           AMENDMENTS
           ========================================= */

case "AMENDMENT_SUBMITTED":
case "AMENDMENT_APPROVED":
case "AMENDMENT_REJECTED":

    console.log(
        "✏️ Amendment updated:",
        event.type
    );

    if (
        window.AmendmentCenter &&
        typeof window.AmendmentCenter.refresh ===
            "function"
    ) {

        window.AmendmentCenter
            .refresh()
            .then(() => {

                /*
                 * If the Chair currently has a resolution
                 * selected, refresh its pending amendments too.
                 */

                if (
                    window.AmendmentCenter.selectedResolution &&
                    typeof window.AmendmentCenter.openReviewPanel ===
                        "function"
                ) {

                    return window.AmendmentCenter
                        .openReviewPanel(
                            window.AmendmentCenter
                                .selectedResolution.id
                        );
                }

            })
            .catch(error => {

                console.error(
                    `Failed to refresh amendments after ${event.type}:`,
                    error
                );

            });
    }

    break;
        /* =========================================
           ANNOUNCEMENTS
           ========================================= */
case "ANNOUNCEMENT_PUBLISHED":

    console.log(
        "📢 Announcement published."
    );

    if (
        window.AnnouncementManager &&
        typeof window.AnnouncementManager.refresh ===
            "function"
    ) {

        window.AnnouncementManager
            .refresh()
            .catch(error => {

                console.error(
                    "Failed to refresh announcements after ANNOUNCEMENT_PUBLISHED:",
                    error
                );

            });
    }

    break;
        /* =========================================
           SESSION
           ========================================= */

case "SESSION_INITIATED":
case "SESSION_ACTIVATED":
case "SESSION_STOPPED":


    console.log(
        "🏛️ Session state updated:",
        event.type
    );

    if (
        window.DebateRoom &&
        typeof window.DebateRoom.loadActiveSession ===
            "function"
    ) {

        window.DebateRoom
            .loadActiveSession()
            .then(() => {

                /*
                 * Session status/timer are rendered by
                 * loadActiveSession() itself.
                 */

                if (
                    typeof window.DebateRoom
                        .renderSessionStatus ===
                    "function"
                ) {

                    window.DebateRoom
                        .renderSessionStatus();
                }

            })
            .catch(error => {

                console.error(
                    `Failed to refresh session after ${event.type}:`,
                    error
                );

            });
    }

    break;


case "SESSION_ARCHIVED":

    console.log(
        "🏛️ Session archived:",
        event
    );

    if (
        window.DebateRoom &&
        event.data
    ) {

        window.DebateRoom.state.session =
            event.data;

        window.DebateRoom.state.sessionId =
            event.data.id;

        window.DebateRoom.renderSessionStatus();

        window.DebateRoom.startSessionTimer();
    }

    break;




        /* =========================================
           UNKNOWN EVENT
           ========================================= */

        default:

            console.log(
                "ℹ️ Unhandled committee event:",
                event.type
            );

            break;
    }
},

    /*
     * Disconnect cleanly when leaving the Debate Room.
     */
    disconnect() {

        if (!this.client) {
            return;
        }


        this.client
            .deactivate()
            .then(() => {

                this.connected = false;

                console.log(
                    "🔌 FIC FURY WebSocket disconnected."
                );

            });

    }

};


window.FURYWebSocket = FURYWebSocket;