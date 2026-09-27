const express = require("express");

const {
    getAISuggestions
} = require("../controllers/aiController");

const router = express.Router();


// ==========================================
// AI SUGGESTIONS ROUTE
// ==========================================

router.post(
    "/suggestions",
    getAISuggestions
);


module.exports = router;