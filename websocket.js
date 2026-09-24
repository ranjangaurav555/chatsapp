const { WebSocketServer, WebSocket } = require("ws");


// Store connected users
const clients = new Map();


// ==========================================
// SETUP WEBSOCKET
// ==========================================

function setupWebSocket(server) {

    const wss =
        new WebSocketServer({
            server: server
        });


    // When a user connects
    wss.on("connection", function (ws) {

        console.log(
            "WebSocket client connected"
        );


        // Receive message from browser
        ws.on("message", function (data) {

            try {

                const message =
                    JSON.parse(
                        data.toString()
                    );


                // Register user
                if (
                    message.type === "register"
                ) {

                    const userId =
                        String(
                            message.userId
                        );


                    clients.set(
                        userId,
                        ws
                    );


                    ws.userId =
                        userId;


                    console.log(
                        "User connected:",
                        userId
                    );

                }

            } catch (error) {

                console.error(
                    "WebSocket Message Error:",
                    error
                );

            }

        });


        // ==========================================
        // WHEN USER DISCONNECTS
        // ==========================================

        ws.on("close", function () {

            if (ws.userId) {

                // Only delete this user if
                // this WebSocket is still the
                // active connection

                if (
                    clients.get(ws.userId) === ws
                ) {

                    clients.delete(
                        ws.userId
                    );


                    console.log(
                        "User disconnected:",
                        ws.userId
                    );

                } else {

                    console.log(
                        "Old WebSocket connection closed:",
                        ws.userId
                    );

                }

            }

        });

    });


    return wss;

}


// ==========================================
// SEND MESSAGE TO SPECIFIC USER
// ==========================================

function sendMessageToUser(
    userId,
    data
) {

    const userIdString =
        String(userId);


    const ws =
        clients.get(
            userIdString
        );


    console.log(
        "Looking for WebSocket user:",
        userIdString
    );


    console.log(
        "Connected users:",
        Array.from(
            clients.keys()
        )
    );


    if (
        ws &&
        ws.readyState === WebSocket.OPEN
    ) {

        ws.send(
            JSON.stringify(data)
        );


        console.log(
            "Live message sent to user:",
            userIdString
        );

    } else {

        console.log(
            "Receiver WebSocket not connected:",
            userIdString
        );

    }

}


module.exports = {
    setupWebSocket,
    sendMessageToUser
};