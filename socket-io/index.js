const {
    Server
} = require("socket.io");

const socketAuthentication =
    require("./middleware");

const chatHandler =
    require("./handlers/chat");

const personalChatHandler =
    require("./handlers/personalChat");

const groupChatHandler =
    require("./handlers/groupChat");


// ==========================================
// SETUP SOCKET.IO
// ==========================================

const setupSocketIO =
    function (server) {

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
        // SOCKET AUTHENTICATION
        // ==========================================

        io.use(
            socketAuthentication
        );


        // ==========================================
        // SOCKET CONNECTION
        // ==========================================

        io.on(
            "connection",
            function (socket) {

                console.log(
                    "Socket.IO client connected:",
                    socket.id
                );


                // Personal chat
                chatHandler(
                    io,
                    socket
                );


                // Personal messages
                personalChatHandler(
                    io,
                    socket
                );


                // Group chat
                groupChatHandler(
                    io,
                    socket
                );

            }
        );


        return io;
    };


// ==========================================
// EXPORT
// ==========================================

module.exports =
    setupSocketIO;