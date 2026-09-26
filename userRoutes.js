const express = require("express");

const router = express.Router();

const {
    signup,
    login,
     getAllUsers,
    checkUserByEmail
} = require("../controllers/userController");


// Signup

router.post("/signup", signup);


// Login

router.post("/login", login);

//all

router.get("/all", getAllUsers);

// Check user by email

router.get("/check-email",checkUserByEmail);


module.exports = router;