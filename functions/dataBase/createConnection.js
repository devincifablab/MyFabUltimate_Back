const mysql = require('mysql');
const config = require("../../config.json");


module.exports.run = (app) => {
    app.db = mysql.createConnection({
        host: config.db.host,
        user: config.db.user,
        password: config.db.password,
        database: config.db.database,
        charset: "utf8mb4",
        connectTimeout: 10000
    });
    app.executeQuery = require("./executeQuery");
    return
}