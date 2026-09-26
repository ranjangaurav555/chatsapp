// ==========================================
// SOCKET.IO CHAT HANDLER
// ==========================================

const socketUsers = new Map();

const chatHandler = function (io, socket) {

    // ==========================================
    // AUTHENTICATED USER
    // ==========================================

    const userId =
        socket.userId;

    console.log(
        "Socket.IO authenticated user connected:",
        userId
    );

    // ==========================================
    // JOIN USER-SPECIFIC ROOM
    // ==========================================

    socket.join(
        `user_${userId}`
    );

    socketUsers.set(
        userId,
        socket.id
    );

    console.log(
        "User joined room:",
        `user_${userId}`
    );

    console.log(
        "Connected Socket.IO users:",
        Array.from(
            socketUsers.keys()
        )
    );

    // ==========================================
    // DISCONNECT
    // ==========================================

    socket.on(
        "disconnect",
        function () {

            if (
                socketUsers.get(userId) === socket.id
            ) {

                socketUsers.delete(
                    userId
                );

            }

            console.log(
                "Socket.IO user disconnected:",
                userId
            );

            console.log(
                "Connected Socket.IO users:",
                Array.from(
                    socketUsers.keys()
                )
            );

        }
    );

};

// ==========================================
// EXPORT
// ==========================================

module.exports =
    chatHandler;