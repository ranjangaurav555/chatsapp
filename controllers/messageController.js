const Message = require("../models/Message");
const { Op } = require("sequelize");

const {
GetObjectCommand
} = require("@aws-sdk/client-s3");

const {
getSignedUrl
} = require("@aws-sdk/s3-request-presigner");

const s3 =
require("../config/s3");

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


    // ==========================================
    // CHECK USER IDS
    // ==========================================

    if (
        !user1 ||
        !user2
    ) {

        return res.status(400).json({

            message:
                "Both user IDs are required"

        });

    }


    // ==========================================
    // GET MESSAGES FROM DATABASE
    // ==========================================

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


    // ==========================================
    // GENERATE FRESH S3 URL FOR MEDIA
    // ==========================================

    const messagesWithMediaUrl =
        await Promise.all(

            messages.map(
                async function (message) {

                    const data =
                        message.toJSON();


                    // ==========================================
                    // CHECK MEDIA MESSAGE
                    // ==========================================

                    if (
                        data.type === "media" &&
                        data.mediaKey
                    ) {

                        const command =
                            new GetObjectCommand({

                                Bucket:
                                    process.env.AWS_BUCKET_NAME,

                                Key:
                                    data.mediaKey

                            });


                        // ==========================================
                        // CREATE NEW SIGNED URL
                        // ==========================================

                        data.url =
                            await getSignedUrl(

                                s3,

                                command,

                                {
                                    expiresIn:
                                        3600
                                }

                            );

                    }


                    return data;

                }
            )

        );


    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(200).json({

        messages:
            messagesWithMediaUrl

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
