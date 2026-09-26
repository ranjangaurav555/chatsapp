const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Group = sequelize.define("Group", {

    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    name: {
        type: DataTypes.STRING,
        allowNull: false
    },

    roomId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },

    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false
    }

}, {

    tableName: "Groups",

    timestamps: true

});

module.exports = Group;
