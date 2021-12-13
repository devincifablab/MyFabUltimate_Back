const express = require('express');
const app = express();
const config = require(__dirname + "/config.json");

app.use(express.static('public'));

require("./functions/startApi").run(app);

async function start() {
    app.db = await require("./functions/dataBase/createConnection").open();
    app.executeQuery = require("./functions/dataBase/executeQuery").run;

    //app.bot = require("./discordBot/index").run();
    const port = config.port;
    app.listen(port);
    console.log();
    console.log("Server is now listening port " + port);
}

start()