const fs = require('fs');
const dbName = require("./databaseName");
const executeQuery = require("../functions/dataBase/executeQuery").run;


module.exports = async () => {
    const connection = await require("../functions/dataBase/createConnection").getDb();
    await executeQuery(connection, "DROP DATABASE ??", [dbName]);

    connection.end();
    fs.writeFileSync(__dirname + "/../config.json", await require(__dirname + "/jestGlobalSetup.js").getRealConfig());
};