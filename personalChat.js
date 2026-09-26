const Message = require("../../models/Message");


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
        async function (data) {

            try {

                console.log(
                    "New personal message:",
                    data
                );


                const {
                    roomId,
                    senderId,
                    receiverId,
                    message
                } = data;


                // Check required fields
                if (
                    !roomId ||
                    !senderId ||
                    !receiverId ||
                    !message
                ) {

                    console.log(
                        "Required message data is missing"
                    );

                    return;

                }


                // ==========================================
                // SAVE MESSAGE IN DATABASE
                // ==========================================

                const newMessage =
                    await Message.create({

                        senderId,
                        receiverId,
                        message

                    });


                console.log(
                    "Message saved:",
                    newMessage.id
                );


                // ==========================================
                // SEND MESSAGE TO PERSONAL ROOM
                // ==========================================

                io.to(
                    roomId
                ).emit(
                    "new_message",
                    newMessage
                );


                console.log(
                    "Message sent to personal room:",
                    roomId
                );


            } catch (error) {

                console.error(
                    "Personal Message Error:",
                    error
                );

            }

        }
    );

};


// ==========================================
// EXPORT
// ==========================================

module.exports =
    personalChatHandler;