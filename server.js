const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");

const sequelize = require("./db");

const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");


const app = express();


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());

app.use(
    express.json()
);


// ==========================================
// STATIC FILES
// ==========================================

app.use(
    express.static(
        path.join(
            __dirname,
            "public"
        )
    )
);


// ==========================================
// HOME ROUTE
// ==========================================

app.get("/", function (req, res) {

    res.sendFile(
        path.join(
            __dirname,
            "public",
            "login.html"
        )
    );

});


// ==========================================
// LOAD MODELS
// ==========================================

require("./models/Message");


// ==========================================
// ROUTES
// ==========================================

const userRoutes =
    require("./routes/userRoutes");

const messageRoutes =
    require("./routes/messageRoutes");


app.use(
    "/api/users",
    userRoutes
);

app.use(
    "/api/messages",
    messageRoutes
);


// ==========================================
// CREATE HTTP SERVER
// ==========================================

const server =
    http.createServer(app);

// socket.io
    const io =
    new Server(server, {
        cors: {
            origin: "*"
        }
    });
    
    app.set( "io", io);

    // ==========================================
// SOCKET.IO AUTHENTICATION
// ==========================================

io.use(function (socket, next) {

    try {

        const token =
            socket.handshake.auth.token;


        if (!token) {

            return next(
                new Error("Authentication token missing")
            );

        }


        const decoded =
            jwt.verify(
                token,
              "MY_SECRET_KEY"
            );


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
            new Error("Authentication failed")
        );

    }

});

// ==========================================
// SOCKET.IO
// ==========================================

const socketUsers = new Map();


io.on(
    "connection",
    function (socket) {

        console.log(
            "Socket.IO client connected:",
            socket.id
        );


        // ==========================================
        // AUTHENTICATED USER
        // ==========================================

        const userId =
            socket.userId;


        // ==========================================
        // JOIN USER-SPECIFIC ROOM
        // ==========================================

        socket.join(
            `user_${userId}`
        );


        // Store authenticated user
        socketUsers.set(
            userId,
            socket.id
        );


        console.log(
            "Socket.IO authenticated user connected:",
            userId
        );


        console.log(
            "User joined room:",
            `user_${userId}`
        );


        console.log(
            "Connected Socket.IO users:",
            Array.from(
                socketUsers.keys()
            )
        );


        // ==========================================
        // DISCONNECT
        // ==========================================

        socket.on(
            "disconnect",
            function () {

                if (
                    socketUsers.get(userId) === socket.id
                ) {

                    socketUsers.delete(
                        userId
                    );

                }


                console.log(
                    "Socket.IO user disconnected:",
                    userId
                );

            }
        );

    }
);

// ==========================================
// DATABASE + SERVER
// ==========================================

sequelize.sync()
    .then(function () {

        console.log(
            "Database Tables Created Successfully"
        );


        server.listen(
            3000,
            function () {

                console.log(
                    "Server Running on http://localhost:3000"
                );

                console.log(
                    "Socket.IO Server Running"
                );

            }
        );

    })
    .catch(function (error) {

        console.error(
            "Database Sync Error:",
            error
        );

    });