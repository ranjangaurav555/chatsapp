const express = require("express");

const router = express.Router();

const {
    signup,
    login,
     getAllUsers
} = require("../controllers/userController");


// Signup

router.post("/signup", signup);


// Login

router.post("/login", login);

//all

router.get("/all", getAllUsers);


module.exports = router;