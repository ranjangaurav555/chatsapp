const { Server } = require("socket.io");

const socketAuthentication =
    require("./middleware");

const chatHandler =
    require("./handlers/chat");

// ==========================================
// SETUP SOCKET.IO
// ==========================================

const setupSocketIO = function (server) {

    // Create Socket.IO server
    const io =
        new Server(
            server,
            {
                cors: {
                    origin: "*"
                }
            }
        );

    // ==========================================
    // SOCKET.IO AUTHENTICATION
    // ==========================================

    io.use(
        socketAuthentication
    );

    // ==========================================
    // SOCKET.IO CONNECTION
    // ==========================================

    io.on(
        "connection",
        function (socket) {

            console.log(
                "Socket.IO client connected:",
                socket.id
            );

            chatHandler(
                io,
                socket
            );

        }
    );

    // Return Socket.IO instance
    return io;

};

// ==========================================
// EXPORT
// ==========================================

module.exports =
    setupSocketIO;