const express = require('express');
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const app = express();
const config = require(__dirname + "/config.json");

app.use(express.static('public'));

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "DeVinci FabLab API",
            version: "1.0.0",
            description: "Hello and welcome to the API documentation of the DeVinci FabLab Association website.\n" +
                "If you are not a developer of the site or a member of the association, you have nothing to do on this page (I know you will stay anyway). Congratulations for finding this page by the way.\n",
        },
        servers: [{
            url: config.url + config.port + "/api/",
        }, ],
    },
    apis: ["./api/*.js"],
};

const specs = swaggerJsDoc(options);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));

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