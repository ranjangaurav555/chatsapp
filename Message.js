
const { DataTypes } = require("sequelize");

const sequelize =
    require("../db");

const Message =
    sequelize.define(
        "Message",
        {

            id: {
                type:
                    DataTypes.INTEGER,

                autoIncrement:
                    true,

                primaryKey:
                    true
            },


            senderId: {
                type:
                    DataTypes.INTEGER,

                allowNull:
                    false
            },


            receiverId: {
                type:
                    DataTypes.INTEGER,

                allowNull:
                    false
            },


            message: {
                type:
                    DataTypes.TEXT,

                allowNull:
                    true
            },


            // ==========================================
            // MESSAGE TYPE
            // ==========================================

            type: {
                type:
                    DataTypes.STRING,

                allowNull:
                    false,

                defaultValue:
                    "text"
            },


            // ==========================================
            // S3 OBJECT KEY
            // ==========================================

            mediaKey: {
                type:
                    DataTypes.TEXT,

                allowNull:
                    true
            },


            // ==========================================
            // ORIGINAL FILE NAME
            // ==========================================

            fileName: {
                type:
                    DataTypes.STRING,

                allowNull:
                    true
            },


            // ==========================================
            // MIME TYPE
            // ==========================================

            mimeType: {
                type:
                    DataTypes.STRING,

                allowNull:
                    true
            }

        },
        {

            tableName:
                "Messages",

            timestamps:
                true

        }
    );


module.exports =
    Message;

