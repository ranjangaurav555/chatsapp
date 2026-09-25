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
                    false
            }

        },
        {

            tableName:
                "GroupMessages",

            timestamps:
                true

        }
    );


module.exports =
    GroupMessage;