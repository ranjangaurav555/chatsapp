const jwt = require("jsonwebtoken");

// ==========================================
// HTTP AUTHENTICATION MIDDLEWARE
// ==========================================

const httpAuthentication = function (req, res, next) {

    try {

        const authHeader =
            req.headers.authorization;

        // Check Authorization header
        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {

            return res.status(401).json({
                message:
                    "Authentication token missing"
            });
        }

        // Get token
        const token =
            authHeader.split(" ")[1];

        // Verify token
        const decoded =
            jwt.verify(
                token,
                "MY_SECRET_KEY"
            );

        // Store logged-in user
        req.user =
            decoded;

        console.log(
            "HTTP authenticated user:",
            req.user.id
        );

        next();

    } catch (error) {

        console.error(
            "HTTP authentication failed:",
            error.message
        );

        return res.status(401).json({
            message:
                "Authentication failed"
        });
    }
};

// ==========================================
// EXPORT
// ==========================================

module.exports =
    httpAuthentication;