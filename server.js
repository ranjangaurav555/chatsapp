const sequelize = require("./db");
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());

app.use(express.json());


// Frontend folder
app.use(express.static(path.join(__dirname, "public")));


// Login page
app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "public", "login.html")
    );

});


// API
const userRoutes = require("./routes/userRoutes");

const messageRoutes =  require("./routes/messageRoutes");

require("./models/Message");

app.use("/api/users", userRoutes);

app.use("/api/messages", messageRoutes
);


// Server
sequelize.sync()
    .then(() => {

        console.log(
            "Database Tables Created Successfully"
        );


        app.listen(3000, () => {

            console.log(
                "Server Running on http://localhost:3000"
            );

        });

    })
    .catch((error) => {

        console.error(
            "Database Sync Error:",
            error
        );

    });