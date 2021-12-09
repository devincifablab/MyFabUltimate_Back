const express = require('express');
const app = express();
const config = require(__dirname + "/config.json");

app.use(express.static('public'));

require("./functions/startApi").run(app);

async function start() {
    //await require("./functionsStore/setupDb").run();

    //app.bot = require("./discordBot/index").run();
    const port = config.port;
    app.listen(port);
    console.log();
    console.log("Server is now listening port " + port);
}

start()