
const { DataTypes } = require("sequelize");

const sequelize =
    require("../db");


// ==========================================
// GROUP MESSAGE MODEL
// ==========================================

const GroupMessage =
    sequelize.define(
        "GroupMessage",
        {

            id: {
                type:
                    DataTypes.INTEGER,

                autoIncrement:
                    true,

                primaryKey:
                    true
            },


            groupId: {
                type:
                    DataTypes.INTEGER,

                allowNull:
                    false
            },


            senderId: {
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
                "groupMessages",

            timestamps:
                true

        }
    );


module.exports =
    GroupMessage;

