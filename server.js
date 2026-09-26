require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");

const sequelize = require("./db");

const setupSocketIO =
    require("./socket-io");

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
require("./models/Group");
require("./models/GroupMember");
require("./models/GroupMessage");


// ==========================================
// ROUTES
// ==========================================

const userRoutes =
    require("./routes/userRoutes");

const messageRoutes =
    require("./routes/messageRoutes");

    const groupRoutes = require("./routes/groupRoutes");

    const mediaRoutes =
    require("./routes/mediaRoutes");


app.use(
    "/api/users",
    userRoutes
);

app.use(
    "/api/messages",
    messageRoutes
);

app.use("/api/groups", groupRoutes);

app.use(
    "/api/media",
    mediaRoutes
);


// ==========================================
// CREATE HTTP SERVER
// ==========================================

const server =
    http.createServer(app);


// ==========================================
// SETUP SOCKET.IO
// ==========================================

const io =
    setupSocketIO(server);

app.set(
    "io",
    io
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