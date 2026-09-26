const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
    "signup_login_db",
    "root",
    "gaurav@05",
    {
        host: "localhost",
        dialect: "mysql",
        logging: false
    }
);

module.exports = sequelize;