const mysql = require('mysql');
const config = require("../../config.json");


function getDb() {
    const db = mysql.createConnection({
        host: config.db.host,
        user: config.db.user,
        password: config.db.password,
        connectTimeout: 10000
    });
    return db;
}


module.exports.getDb = getDb;

module.exports.open = async (callback) => {
    const db = getDb();

    return await new Promise((resolve, reject) => {
        db.connect(function (err) {
            if (err) {
                console.log("\n\nerror for the sql connection");
                throw err.code;
            }
            db.query("USE ??", [config.db.database], function (error, results, fields) {
                if (callback) callback(db);
                resolve(db);
            })
        });
    })
}

module.exports.close = (db) => {
    db.end();
    return;
}