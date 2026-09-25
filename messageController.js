const Message = require("../models/Message");
const { Op } = require("sequelize");


// ==========================================
// SEND MESSAGE
// ==========================================

const sendMessage = async (req, res) => {

    try {

        const {
            senderId,
            receiverId,
            message
        } = req.body;


        // Check required fields
        if (
            !senderId ||
            !receiverId ||
            !message
        ) {

            return res.status(400).json({

                message:
                    "Sender, receiver and message are required"

            });

        }


        // Save message in database
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
        // SOCKET.IO LIVE MESSAGE
        // ==========================================

        const io =
            req.app.get("io");


        if (io) {

            io.to(
                `user_${receiverId}`
            ).emit(
                "new_message",
                newMessage
            );


            console.log(
                "Socket.IO message sent to user:",
                receiverId
            );

        }


        // ==========================================
        // RESPONSE
        // ==========================================

        return res.status(201).json({

            message:
                "Message sent successfully",

            data:
                newMessage

        });


    } catch (error) {

        console.error(
            "Send Message Error:",
            error
        );


        return res.status(500).json({

            message:
                "Server error"

        });

    }

};


// ==========================================
// GET MESSAGES
// ==========================================

const getMessages = async (req, res) => {

    try {

        const {
            user1,
            user2
        } = req.query;


        if (
            !user1 ||
            !user2
        ) {

            return res.status(400).json({

                message:
                    "Both user IDs are required"

            });

        }


        const messages =
            await Message.findAll({

                where: {

                    [Op.or]: [

                        {
                            senderId: user1,
                            receiverId: user2
                        },

                        {
                            senderId: user2,
                            receiverId: user1
                        }

                    ]

                },

                order: [
                    ["createdAt", "ASC"]
                ]

            });


        return res.status(200).json({

            messages

        });


    } catch (error) {

        console.error(
            "Get Messages Error:",
            error
        );


        return res.status(500).json({

            message:
                "Server error"

        });

    }

};


// ==========================================
// EXPORT
// ==========================================

module.exports = {

    sendMessage,
    getMessages

};