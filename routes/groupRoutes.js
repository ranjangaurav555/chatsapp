const express = require("express");

const router =
    express.Router();

const groupController =
    require("../controllers/groupController");

const httpAuthentication =
    require("../httpAuth");


// ==========================================
// CREATE GROUP
// ==========================================

router.post(
    "/",
    httpAuthentication,
    groupController.createGroup
);


// ==========================================
// GET USER GROUPS
// ==========================================

router.get(
    "/",
    httpAuthentication,
    groupController.getUserGroups
);

// GET GROUP MASSAGE
router.get(
    "/:groupId/messages",
    httpAuthentication,
    groupController.getGroupMessages
);


// ==========================================
// EXPORT
// ==========================================

module.exports =
    router;