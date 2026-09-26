const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");


// ==========================================
// SIGNUP
// ==========================================

const signup = async (req, res) => {

    try {

        const {
            name,
            email,
            phone,
            password
        } = req.body;


        // Check required fields

        if (!name || !email || !phone || !password) {

            return res.status(400).json({
                message: "All fields are required"
            });

        }


        // Check existing email

        const existingEmail = await User.findOne({
            where: {
                email: email
            }
        });


        if (existingEmail) {

            return res.status(400).json({
                message: "Email already registered"
            });

        }


        // Check existing phone

        const existingPhone = await User.findOne({
            where: {
                phone: phone
            }
        });


        if (existingPhone) {

            return res.status(400).json({
                message: "Phone number already registered"
            });

        }


        // Hash password

        const hashedPassword =
            await bcrypt.hash(password, 10);


        // Create user

        const user = await User.create({

            name: name,

            email: email,

            phone: phone,

            password: hashedPassword

        });


        return res.status(201).json({

            message: "Account created successfully",

            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone
            }

        });

    } catch (error) {

        console.error("Signup Error:", error);

        return res.status(500).json({
            message: "Server error"
        });

    }

};


// ==========================================
// LOGIN
// ==========================================

const login = async (req, res) => {

    try {

        const {
            emailOrPhone,
            password
        } = req.body;


        // Check fields

        if (!emailOrPhone || !password) {

            return res.status(400).json({
                message: "Email/phone and password are required"
            });

        }


        // Find user by email OR phone

        const user = await User.findOne({

            where: {

                [require("sequelize").Op.or]: [

                    {
                        email: emailOrPhone
                    },

                    {
                        phone: emailOrPhone
                    }

                ]

            }

        });


        if (!user) {

            return res.status(401).json({
                message: "Invalid email/phone or password"
            });

        }


        // Compare password

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordMatch) {

            return res.status(401).json({
                message: "Invalid email/phone or password"
            });

        }


        // Create JWT token

        const token = jwt.sign(

            {
                id: user.id,
                email: user.email
            },

            "MY_SECRET_KEY",

            {
                expiresIn: "1d"
            }

        );


        return res.status(200).json({

            message: "Login successful",

            token: token,

            user: {

                id: user.id,

                name: user.name,

                email: user.email,

                phone: user.phone

            }

        });

    } catch (error) {

        console.error("Login Error:", error);

        return res.status(500).json({
            message: "Server error"
        });

    }

};

// ==========================================
// GET ALL USERS
// ==========================================

const getAllUsers = async (req, res) => {

    try {

        const users = await User.findAll({

            attributes: [
                "id",
                "name",
                "email",
                "phone"
            ],

            order: [
                ["name", "ASC"]
            ]

        });


        return res.status(200).json({

            users: users

        });

    } catch (error) {

        console.error(
            "Get Users Error:",
            error
        );

        return res.status(500).json({

            message: "Server error"

        });

    }

};

// ==========================================
// CHECK USER BY EMAIL
// ==========================================

const checkUserByEmail = async (req, res) => {

    try {

        const {
            email
        } = req.query;


        // Check email

        if (!email) {

            return res.status(400).json({

                message: "Email is required"

            });

        }


        // Find user

        const user =
            await User.findOne({

                where: {
                    email: email
                },

                attributes: [
                    "id",
                    "name",
                    "email",
                    "phone"
                ]

            });


        // User not found

        if (!user) {

            return res.status(404).json({

                message: "User not found"

            });

        }


        // User found

        return res.status(200).json({

            exists: true,

            user: user

        });


    } catch (error) {

        console.error(
            "Check User Email Error:",
            error
        );


        return res.status(500).json({

            message: "Server error"

        });

    }

};


module.exports = {
    signup,
    login,
    getAllUsers,
    checkUserByEmail
};