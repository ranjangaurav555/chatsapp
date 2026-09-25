// ==========================================
// PERSONAL CHAT HANDLER
// ==========================================

const personalChatHandler = function (io, socket) {

    // ==========================================
    // JOIN ROOM
    // ==========================================

    socket.on(
        "join_room",
        function (roomId) {

            socket.join(
                roomId
            );

            console.log(
                "User joined personal chat room:",
                roomId
            );

        }
    );


    // ==========================================
    // NEW MESSAGE
    // ==========================================

    socket.on(
        "new_message",
        function (data) {

            console.log(
                "New personal message:",
                data
            );

            const {
                roomId,
                message
            } = data;

            // Send message to everyone
            // inside the same room
            io.to(
                roomId
            ).emit(
                "new_message",
                data
            );

        }
    );

};


// ==========================================
// EXPORT
// ==========================================

module.exports =
    personalChatHandler;