const fs = require('fs');
const dbName = "myFabUltimateTest";
const executeQuery = require("../functions/dataBase/executeQuery").run;
const badFile = [];
let fileNumber = 0;


async function runFolder(path, db) {
    const files = fs.readdirSync(__dirname + path);
    for (let indexFile = 0; indexFile < files.length; indexFile++) {
        const file = files[indexFile];
        const filePath = path + "/" + file;
        if (fs.lstatSync(__dirname + filePath).isDirectory()) await runFolder(filePath, db);
        else {
            fileNumber++;
            const fileSplited = file.split(".");
            if (fileSplited[fileSplited.length - 1] === "js") {
                const route = require(__dirname + filePath);
                const keys = Object.keys(route);
                let log = ""
                let goodEndpoint = 0;
                for (let index = 0; index < keys.length; index++) {
                    const routeToTest = route[keys[index]];
                    const keysOfRouteToTest = Object.keys(routeToTest);
                    let addToLog = "";
                    let goodUnitTest = 0;
                    for (let index = 0; index < keysOfRouteToTest.length; index++) {
                        const unitTest = routeToTest[keysOfRouteToTest[index]];
                        const res = await unitTest(db, executeQuery);
                        addToLog = addToLog + (fileNumber) + "#--- " + keysOfRouteToTest[index] + " / " + res + "\n"
                        if (res) goodUnitTest++;
                    }
                    log = log + (fileNumber) + "#- " + keys[index] + "   [" + goodUnitTest + "/" + keysOfRouteToTest.length + "]\n" + addToLog;
                    if (keysOfRouteToTest.length - goodUnitTest === 0) goodEndpoint++;
                }
                console.log((fileNumber) + "# " + filePath + "   [" + goodEndpoint + "/" + keys.length + "]\n" + log);
                if (keys.length - goodEndpoint !== 0) badFile.push(filePath)
            }
        }
    }
}

async function wait(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time);
    })
}

async function startTest() {
    const realConfig = fs.readFileSync(__dirname + "/../config.json");
    if (!fs.existsSync(__dirname + "/../config_copy.json")) fs.writeFileSync(__dirname + "/../config_copy.json", realConfig);
    const config = JSON.parse(realConfig);
    config.db.database = dbName;
    fs.writeFileSync(__dirname + "/../config.json", JSON.stringify(config));

    const connection = await require("../functions/dataBase/createConnection").getDb();
    await executeQuery(connection, "DROP DATABASE ??", [dbName]);
    await executeQuery(connection, "CREATE DATABASE IF NOT EXISTS ??", [dbName]);
    await executeQuery(connection, "USE ??", [dbName]);
    await require("./importSqlTables.js").importSqlTables(connection, __dirname + '/../myFabUltimateDb.sql');
    await require("./importSqlTables.js").importSqlTables(connection, __dirname + '/../globalData.sql');
    await require("./addTestRoles.js").addTestRoles(connection, executeQuery);
    require("../index.js");
    await wait(1500);
    console.log();

    console.log("+-----------+");
    console.log("|start tests|");
    console.log("+-----------+");
    console.log();

    await runFolder("/api", connection);

    if (badFile.length === 0) {
        console.log("All tests passed");
    } else {
        console.log("Some tests are not valid:");
        for (let index = 0; index < badFile.length; index++) {
            const element = badFile[index];
            console.log("- " + element);
        }
    }

    console.log();
    console.log("+-----------+");
    console.log("|end   tests|");
    console.log("+-----------+");


    await executeQuery(connection, "DROP DATABASE ??", [dbName]);
    fs.writeFileSync(__dirname + "/../config.json", realConfig);
    process.exit(0)
}

startTest()