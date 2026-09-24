const { DataTypes } = require("sequelize");

const sequelize = require("../db");

const Message = sequelize.define(
    "Message",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },

        senderId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        receiverId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        message: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    },
    {
        tableName: "Messages",
        timestamps: true
    }
);

module.exports = Message;