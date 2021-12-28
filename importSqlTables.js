const fs = require('fs');


async function importSqlTables(file) {
    const db = await require("./functions/dataBase/createConnection").open();
    const executeQuery = require("./functions/dataBase/executeQuery").run;
    await new Promise((resolve, reject) => {
        fs.readFile(file, 'utf8', async (err, data) => {
            if (err) {
                console.error(err)
                return
            }
            const lineData = data.split("\n")
            for (const line of lineData) {
                if (line !== "\r" || line !== "") {
                    const res = await executeQuery(db, line, []);
                    if (res[0] && res[0].sql.length > 5) console.log(res[0]);
                }
            }
    
            await require("./functions/dataBase/createConnection").close(db);
            resolve();
        })
    })
}

async function start() {
    await importSqlTables('./myFabUltimateDb.sql');
    await importSqlTables('./globalData.sql');
    console.log("The database is ready");
}

start()