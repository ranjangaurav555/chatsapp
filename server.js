const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");

const sequelize = require("./db");

const { Server } = require("socket.io");


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
    
    app.set(
    "io",
    io
);
    // ==========================================
// SOCKET.IO
// ==========================================

const socketUsers = new Map();


io.on("connection", function (socket) {

    console.log(
        "Socket.IO client connected:",
        socket.id
    );


    // ==========================================
    // REGISTER USER
    // ==========================================

    socket.on(
        "register",
        function (userId) {

                   console.log(
            "REGISTER EVENT RECEIVED:",
            userId
        );

            const userIdString =
                String(userId);

                  // Join user-specific Socket.IO room
        socket.join(`user_${userIdString}`);


            socketUsers.set(
                userIdString,
                socket.id
            );


            socket.userId =
                userIdString;


            console.log(
                "Socket.IO user registered:",
                userIdString
            );


            console.log(
                "Connected Socket.IO users:",
                Array.from(
                    socketUsers.keys()
                )
            );

        }
    );


    // ==========================================
    // DISCONNECT
    // ==========================================

    socket.on(
        "disconnect",
        function () {

            if (
                socket.userId &&
                socketUsers.get(socket.userId) === socket.id
            ) {

                socketUsers.delete(
                    socket.userId
                );


                console.log(
                    "Socket.IO user disconnected:",
                    socket.userId
                );

            }

        }
    );

});
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