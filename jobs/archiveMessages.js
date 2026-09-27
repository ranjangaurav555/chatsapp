const cron = require("node-cron");

const {
    Op
} = require("sequelize");

const sequelize =
    require("../db");

const Message =
    require("../models/Message");

const ArchivedChat =
    require("../models/ArchivedChat");


// ==========================================
// ARCHIVE OLD MESSAGES
// ==========================================

async function archiveOldMessages() {

    try {

        console.log(
            "Starting old message archive job..."
        );


        // ==========================================
        // ONE DAY AGO
        // ==========================================

        const oneDayAgo =
            new Date(
                Date.now() -
                24 * 60 * 60 * 1000
            );


        // ==========================================
        // FIND OLD MESSAGES
        // ==========================================

        const oldMessages =
            await Message.findAll({

                where: {

                    createdAt: {
                        [Op.lt]:
                            oneDayAgo
                    }

                }

            });


        if (
            oldMessages.length === 0
        ) {

            console.log(
                "No old messages found."
            );

            return;
        }


        console.log(
            "Old messages found:",
            oldMessages.length
        );


        // ==========================================
        // TRANSACTION
        // ==========================================

        const transaction =
            await sequelize.transaction();


        try {

            // ==========================================
            // COPY MESSAGES TO ARCHIVE TABLE
            // ==========================================

            const archivedMessages =
                oldMessages.map(
                    function (message) {

                        return {

                            id:
                                message.id,

                            senderId:
                                message.senderId,

                            receiverId:
                                message.receiverId,

                            message:
                                message.message,

                            type:
                                message.type,

                            mediaKey:
                                message.mediaKey,

                            fileName:
                                message.fileName,

                            mimeType:
                                message.mimeType,

                            createdAt:
                                message.createdAt,

                            updatedAt:
                                message.updatedAt

                        };

                    }
                );


            await ArchivedChat.bulkCreate(
                archivedMessages,
                {
                    transaction:
                        transaction
                }
            );


            // ==========================================
            // DELETE FROM ACTIVE CHAT TABLE
            // ==========================================

            await Message.destroy({

                where: {

                    createdAt: {
                        [Op.lt]:
                            oneDayAgo
                    }

                },

                transaction:
                    transaction

            });


            // ==========================================
            // COMMIT
            // ==========================================

            await transaction.commit();


            console.log(
                oldMessages.length +
                " messages archived successfully."
            );

        }

        catch (error) {

            await transaction.rollback();

            throw error;

        }

    }

    catch (error) {

        console.error(
            "Message Archive Error:",
            error
        );

    }

}


// ==========================================
// RUN EVERY NIGHT AT 2:00 AM
// ==========================================

cron.schedule(
    "0 2 * * *",
    function () {

        archiveOldMessages();

    }
);


// ==========================================
// EXPORT
// ==========================================

module.exports =
    archiveOldMessages;
    