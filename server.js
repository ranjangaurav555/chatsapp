const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");

const sequelize = require("./db");

const {
    setupWebSocket
} = require("./websocket");


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


// ==========================================
// SETUP WEBSOCKET
// ==========================================

setupWebSocket(server);


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
                    "WebSocket Server Running"
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