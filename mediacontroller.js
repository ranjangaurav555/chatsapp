
const {
    PutObjectCommand,
    GetObjectCommand
} = require("@aws-sdk/client-s3");

const {
    getSignedUrl
} = require("@aws-sdk/s3-request-presigner");

const s3 =
    require("../config/s3");

const crypto =
    require("crypto");

const Message =
    require("../models/Message");

const Group =
    require("../models/Group");

const GroupMember =
    require("../models/GroupMember");

const GroupMessage =
    require("../models/GroupMessage");


// ==========================================
// UPLOAD MEDIA
// ==========================================

const uploadMedia =
    async function (req, res) {

        try {

            // ==========================================
            // CHECK FILE
            // ==========================================

            if (!req.file) {

                return res
                    .status(400)
                    .json({
                        message:
                            "No file uploaded"
                    });

            }


            const file =
                req.file;


            // ==========================================
            // GET CHAT TYPE
            // ==========================================

            const chatType =
                req.body.chatType;


            // ==========================================
            // CREATE UNIQUE FILE NAME
            // ==========================================

            const randomName =
                crypto
                    .randomBytes(16)
                    .toString("hex");


            const fileName =
                `${Date.now()}-${randomName}-${file.originalname}`;


            const s3Key =
                `media/${fileName}`;


            // ==========================================
            // UPLOAD TO S3
            // ==========================================

            const command =
                new PutObjectCommand({

                    Bucket:
                        process.env
                            .AWS_BUCKET_NAME,

                    Key:
                        s3Key,

                    Body:
                        file.buffer,

                    ContentType:
                        file.mimetype

                });


            await s3.send(
                command
            );


            console.log(
                "Media uploaded to S3:",
                s3Key
            );


            // ==========================================
            // CREATE SIGNED URL
            // ==========================================

            const getObjectCommand =
                new GetObjectCommand({

                    Bucket:
                        process.env
                            .AWS_BUCKET_NAME,

                    Key:
                        s3Key

                });


            const signedUrl =
                await getSignedUrl(
                    s3,
                    getObjectCommand,
                    {
                        expiresIn:
                            3600
                    }
                );


            console.log(
                "Signed URL created"
            );


            // ==========================================
            // SOCKET.IO
            // ==========================================

            const io =
                req.app.get("io");


            // ==========================================
            // PERSONAL CHAT
            // ==========================================

            if (
                chatType ===
                "personal"
            ) {

                const receiverId =
                    Number(
                        req.body.receiverId
                    );


                // ==========================================
                // CHECK RECEIVER
                // ==========================================

                if (!receiverId) {

                    return res
                        .status(400)
                        .json({
                            message:
                                "Receiver ID is required"
                        });

                }


                // ==========================================
                // SAVE MEDIA IN MESSAGES TABLE
                // ==========================================

                const newMessage =
                    await Message.create({

                        senderId:
                            req.user.id,

                        receiverId:
                            receiverId,

                        message:
                            null,

                        type:
                            "media",

                        mediaKey:
                            s3Key,

                        fileName:
                            file.originalname,

                        mimeType:
                            file.mimetype

                    });


                console.log(
                    "Personal media saved:",
                    newMessage.id
                );


                // ==========================================
                // MEDIA MESSAGE
                // ==========================================

                const mediaMessage = {

                    id:
                        newMessage.id,

                    type:
                        "media",

                    url:
                        signedUrl,

                    fileName:
                        file.originalname,

                    mimeType:
                        file.mimetype,

                    senderId:
                        req.user.id,

                    receiverId:
                        receiverId,

                    createdAt:
                        newMessage.createdAt

                };


                // ==========================================
                // SEND THROUGH SOCKET.IO
                // ==========================================

                if (io) {

                    const roomId =
                        req.body.roomId;


                    io.to(
                        roomId
                    ).emit(
                        "new_media",
                        mediaMessage
                    );

                }


                // ==========================================
                // RESPONSE
                // ==========================================

                return res
                    .status(200)
                    .json({

                        message:
                            "File uploaded successfully",

                        url:
                            signedUrl,

                        fileName:
                            file.originalname,

                        mimeType:
                            file.mimetype

                    });

            }


            // ==========================================
            // GROUP CHAT
            // ==========================================

            if (
                chatType ===
                "group"
            ) {

                const groupId =
                    Number(
                        req.body.groupId
                    );


                // ==========================================
                // CHECK GROUP ID
                // ==========================================

                if (!groupId) {

                    return res
                        .status(400)
                        .json({
                            message:
                                "Group ID is required"
                        });

                }


                // ==========================================
                // FIND GROUP
                // ==========================================

                const group =
                    await Group.findByPk(
                        groupId
                    );


                if (!group) {

                    return res
                        .status(404)
                        .json({
                            message:
                                "Group not found"
                        });

                }


                // ==========================================
                // CHECK GROUP MEMBER
                // ==========================================

                const member =
                    await GroupMember.findOne({

                        where: {

                            groupId:
                                groupId,

                            userId:
                                req.user.id

                        }

                    });


                if (!member) {

                    return res
                        .status(403)
                        .json({
                            message:
                                "You are not a member of this group"
                        });

                }


                // ==========================================
                // SAVE MEDIA IN GROUPMESSAGES TABLE
                // ==========================================

                const newMessage =
                    await GroupMessage.create({

                        groupId:
                            groupId,

                        senderId:
                            req.user.id,

                        message:
                            null,

                        type:
                            "media",

                        mediaKey:
                            s3Key,

                        fileName:
                            file.originalname,

                        mimeType:
                            file.mimetype

                    });


                console.log(
                    "Group media saved:",
                    newMessage.id
                );


                // ==========================================
                // MEDIA MESSAGE
                // ==========================================

                const mediaMessage = {

                    id:
                        newMessage.id,

                    type:
                        "media",

                    url:
                        signedUrl,

                    fileName:
                        file.originalname,

                    mimeType:
                        file.mimetype,

                    senderId:
                        req.user.id,

                    groupId:
                        groupId,

                    createdAt:
                        newMessage.createdAt

                };


                // ==========================================
                // SEND THROUGH SOCKET.IO
                // ==========================================

                if (io) {

                    io.to(
                        group.roomId
                    ).emit(
                        "group_media",
                        mediaMessage
                    );

                }


                // ==========================================
                // RESPONSE
                // ==========================================

                return res
                    .status(200)
                    .json({

                        message:
                            "File uploaded successfully",

                        url:
                            signedUrl,

                        fileName:
                            file.originalname,

                        mimeType:
                            file.mimetype

                    });

            }


            // ==========================================
            // INVALID CHAT TYPE
            // ==========================================

            return res
                .status(400)
                .json({

                    message:
                        "Invalid chat type"

                });


        } catch (error) {

            console.error(
                "Media Upload Error:",
                error
            );


            return res
                .status(500)
                .json({

                    message:
                        "Media upload failed"

                });

        }

    };


module.exports =
    {
        uploadMedia
    };

