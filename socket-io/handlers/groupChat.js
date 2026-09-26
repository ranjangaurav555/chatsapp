const Group = require("../../models/Group");
const GroupMember = require("../../models/GroupMember");
const GroupMessage = require("../../models/GroupMessage");

// ==========================================
// GROUP CHAT HANDLER
// ==========================================

const groupChatHandler = function (io, socket) {

    // ==========================================
    // JOIN GROUP
    // ==========================================

    socket.on(
        "join_group",
        async function (groupId) {

            try {

                const userId =
                    Number(socket.userId);

                const id =
                    Number(groupId);


                // Check group
                const group =
                    await Group.findByPk(id);


                if (!group) {

                    socket.emit(
                        "group_error",
                        {
                            message:
                                "Group not found"
                        }
                    );

                    return;
                }


                // Check membership
                const member =
                    await GroupMember.findOne({

                        where: {

                            groupId:
                                id,

                            userId:
                                userId

                        }

                    });


                if (!member) {

                    socket.emit(
                        "group_error",
                        {
                            message:
                                "You are not a member of this group"
                        }
                    );

                    return;
                }


                // Join Socket.IO room
                socket.join(
                    group.roomId
                );


                console.log(
                    `User ${userId} joined group:`,
                    group.roomId
                );


                // Tell client successfully joined
                socket.emit(
                    "group_joined",
                    {
                        groupId:
                            group.id,

                        roomId:
                            group.roomId,

                        name:
                            group.name
                    }
                );


            } catch (error) {

                console.error(
                    "Join Group Error:",
                    error
                );

                socket.emit(
                    "group_error",
                    {
                        message:
                            "Unable to join group"
                    }
                );

            }

        }
    );


    // ==========================================
    // GROUP MESSAGE
    // ==========================================

    socket.on(
        "group_message",
        async function (data) {

            try {

                const {
                    groupId,
                    message
                } = data;


                const userId =
                    Number(socket.userId);


                // Validate data
                if (
                    !groupId ||
                    !message ||
                    !message.trim()
                ) {

                    return;
                }


                const id =
                    Number(groupId);


                // Check group
                const group =
                    await Group.findByPk(id);


                if (!group) {

                    socket.emit(
                        "group_error",
                        {
                            message:
                                "Group not found"
                        }
                    );

                    return;
                }


                // Check membership
                const member =
                    await GroupMember.findOne({

                        where: {

                            groupId:
                                id,

                            userId:
                                userId

                        }

                    });


                if (!member) {

                    socket.emit(
                        "group_error",
                        {
                            message:
                                "You are not a member of this group"
                        }
                    );

                    return;
                }


                // Save message
                const newMessage =
                    await GroupMessage.create({

                        groupId:
                            id,

                        senderId:
                            userId,

                        message:
                            message.trim()

                    });


                console.log(
                    "Group message saved:",
                    newMessage.id
                );


                // Send message to group
                io.to(
                    group.roomId
                ).emit(
                    "group_message",
                    newMessage
                );


            } catch (error) {

                console.error(
                    "Group Message Error:",
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
    groupChatHandler;