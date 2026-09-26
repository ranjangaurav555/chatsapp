const jwt = require("jsonwebtoken");


// ==========================================
// SOCKET.IO AUTHENTICATION MIDDLEWARE
// ==========================================

const socketAuthentication = function (socket, next) {

    try {

        const token =
            socket.handshake.auth.token;


        // Check token
        if (!token) {

            return next(
                new Error(
                    "Authentication token missing"
                )
            );

        }


        // Verify JWT
        const decoded =
            jwt.verify(
                token,
                "MY_SECRET_KEY"
            );


        // Store authenticated user ID
        socket.userId =
            String(decoded.id);


        console.log(
            "Socket authenticated user:",
            socket.userId
        );


        next();


    } catch (error) {

        console.error(
            "Socket authentication failed:",
            error.message
        );


        next(
            new Error(
                "Authentication failed"
            )
        );

    }

};


// ==========================================
// EXPORT
// ==========================================

module.exports =
    socketAuthentication;