const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const GroupMember = sequelize.define("GroupMember", {

    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    groupId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }

}, {

    tableName: "GroupMembers",

    timestamps: true

});

module.exports = GroupMember;