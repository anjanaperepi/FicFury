const socketTest = {

    client: null,

    connect(sessionId) {

        console.log(
            "🔌 Connecting to WebSocket...",
            sessionId
        );

        this.client = new StompJs.Client({

            brokerURL:
                "ws://localhost:8080/ws",

            reconnectDelay: 5000,

            debug: (message) => {
                console.log(
                    "[STOMP]",
                    message
                );
            }

        });


        this.client.onConnect = () => {

            console.log(
                "✅ WebSocket connected"
            );


            const destination =
                `/topic/session/${sessionId}`;


            console.log(
                "📡 Subscribing to:",
                destination
            );


            this.client.subscribe(
                destination,
                (message) => {

                    console.log(
                        "📨 EVENT RECEIVED:",
                        JSON.parse(message.body)
                    );

                }
            );
        };


        this.client.onStompError = (frame) => {

            console.error(
                "❌ STOMP error:",
                frame.headers["message"]
            );

            console.error(
                frame.body
            );
        };


        this.client.onWebSocketError = (error) => {

            console.error(
                "❌ WebSocket error:",
                error
            );
        };


        this.client.activate();
    },


    disconnect() {

        if (!this.client) {
            return;
        }

        this.client.deactivate();

        console.log(
            "🔌 WebSocket disconnected"
        );
    }
};