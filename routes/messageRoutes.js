const express = require("express");

const router = express.Router();

const {
    sendMessage,
    getMessages
} = require("../controllers/messageController");


// ==========================================
// SEND MESSAGE
// ==========================================

router.post(
    "/",
    sendMessage
);


// ==========================================
// GET CHAT MESSAGES
// ==========================================

router.get(
    "/",
    getMessages
);


module.exports = router;