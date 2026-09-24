const Message = require("../models/Message");


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


        // Save message

        const newMessage =
            await Message.create({

                senderId:
                    senderId,

                receiverId:
                    receiverId,

                message:
                    message

            });


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
// GET CHAT MESSAGES
// ==========================================

const getMessages = async (req, res) => {

    try {

        const {
            user1,
            user2
        } = req.query;


        // Check users

        if (
            !user1 ||
            !user2
        ) {

            return res.status(400).json({

                message:
                    "Both user IDs are required"

            });

        }


        // Get messages between two users

        const messages =
            await Message.findAll({

                where: {

                    [require("sequelize").Op.or]: [

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

            messages:
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


module.exports = {

    sendMessage,

    getMessages

};