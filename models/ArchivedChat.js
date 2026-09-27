const { DataTypes } = require("sequelize");

const sequelize = require("../db");

const ArchivedChat =
    sequelize.define(
        "ArchivedChat",
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


            type: {
                type:
                    DataTypes.STRING,

                allowNull:
                    false,

                defaultValue:
                    "text"
            },


            mediaKey: {
                type:
                    DataTypes.TEXT,

                allowNull:
                    true
            },


            fileName: {
                type:
                    DataTypes.STRING,

                allowNull:
                    true
            },


            mimeType: {
                type:
                    DataTypes.STRING,

                allowNull:
                    true
            },


            createdAt: {
                type:
                    DataTypes.DATE,

                allowNull:
                    false
            },


            updatedAt: {
                type:
                    DataTypes.DATE,

                allowNull:
                    false
            }

        },
        {

            tableName:
                "ArchivedChat",

            timestamps:
                true

        }
    );


module.exports =
    ArchivedChat;