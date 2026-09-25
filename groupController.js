const Group = require("../models/Group");
const GroupMember = require("../models/GroupMember");
const GroupMessage = require("../models/GroupMessage");


// ==========================================
// CREATE GROUP
// ==========================================

const createGroup = async (req, res) => {

    try {

        const {
            name,
            userIds
        } = req.body;


        // ==========================================
        // CHECK GROUP NAME
        // ==========================================

        if (!name || !name.trim()) {

            return res.status(400).json({
                message: "Group name is required"
            });

        }


        // ==========================================
        // CHECK USERS
        // ==========================================

        if (
            !Array.isArray(userIds) ||
            userIds.length === 0
        ) {

            return res.status(400).json({
                message: "Select at least one user"
            });

        }


        // ==========================================
        // GET LOGGED-IN USER
        // ==========================================

        const createdBy =
            req.user.id;


        // ==========================================
        // CREATE UNIQUE ROOM ID
        // ==========================================

        const roomId =
            `group_${Date.now()}_${createdBy}`;


        // ==========================================
        // CREATE GROUP
        // ==========================================

        const group =
            await Group.create({

                name:
                    name.trim(),

                roomId:
                    roomId,

                createdBy:
                    createdBy

            });


        // ==========================================
        // ADD GROUP MEMBERS
        // ==========================================

        const members = [];


        // Add group creator
        members.push({
            groupId: group.id,
            userId: createdBy
        });


        // Add selected users
        userIds.forEach(
            function (userId) {

                const id =
                    Number(userId);


                // Don't add creator twice

                if (
                    id !==
                    Number(createdBy)
                ) {

                    members.push({

                        groupId:
                            group.id,

                        userId:
                            id

                    });

                }

            }
        );


        await GroupMember.bulkCreate(
            members
        );


        // ==========================================
        // RESPONSE
        // ==========================================

        return res.status(201).json({

            message:
                "Group created successfully",

            group: {

                id:
                    group.id,

                name:
                    group.name,

                roomId:
                    group.roomId,

                createdBy:
                    group.createdBy

            }

        });


    } catch (error) {

        console.error(
            "Create Group Error:",
            error
        );


        return res.status(500).json({

            message:
                "Server error"

        });

    }

};


// ==========================================
// GET USER GROUPS
// ==========================================

const getUserGroups = async (req, res) => {

    try {

        const userId =
            req.user.id;


        const memberships =
            await GroupMember.findAll({

                where: {
                    userId: userId
                }

            });


        const groupIds =
            memberships.map(
                function (member) {
                    return member.groupId;
                }
            );


        if (
            groupIds.length === 0
        ) {

            return res.status(200).json({

                groups: []

            });

        }


        const groups =
            await Group.findAll({

                where: {
                    id: groupIds
                },

                order: [
                    ["createdAt", "DESC"]
                ]

            });


        return res.status(200).json({

            groups:
                groups

        });


    } catch (error) {

        console.error(
            "Get User Groups Error:",
            error
        );


        return res.status(500).json({

            message:
                "Server error"

        });

    }

};


// ==========================================
// GET GROUP MESSAGES
// ==========================================

const getGroupMessages = async (req, res) => {

    try {

        const groupId =
            Number(req.params.groupId);

        const userId =
            Number(req.user.id);


        // ==========================================
        // CHECK GROUP
        // ==========================================

        const group =
            await Group.findByPk(groupId);

        if (!group) {

            return res.status(404).json({
                message:
                    "Group not found"
            });

        }


        // ==========================================
        // CHECK MEMBER
        // ==========================================

        const member =
            await GroupMember.findOne({
                where: {
                    groupId:
                        groupId,

                    userId:
                        userId
                }
            });


        if (!member) {

            return res.status(403).json({
                message:
                    "You are not a member of this group"
            });

        }


        // ==========================================
        // GET MESSAGES
        // ==========================================

        const messages =
            await GroupMessage.findAll({
                where: {
                    groupId:
                        groupId
                },

                order: [
                    ["createdAt", "ASC"]
                ]
            });


        return res.status(200).json({
            messages:
                messages
        });


    } catch (error) {

        console.error(
            "Get Group Messages Error:",
            error
        );


        return res.status(500).json({
            message:
                "Server error"
        });

    }

};

module.exports = {

    createGroup,
    getUserGroups,
       getGroupMessages

};