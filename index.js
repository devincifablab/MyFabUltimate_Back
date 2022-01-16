const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const expressHeader = require('express-header')
const fs = require("fs");
const app = express();
const config = require(__dirname + "/config.json");

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(fileUpload({
    createParentPath: true,
    useTempFiles: true,
    tempFileDir: __dirname + '\\tmp\\'
}));
app.cookiesList = {};
app.use(expressHeader([
	{key: 'Access-Control-Allow-Origin', value: '*'},
	{key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE'},
	{key: 'Access-Control-Allow-Headers', value: 'Origin, Content-Type, X-Auth-Token, dvflCookie, Authorization'}
]))

if (config.showSwagger) {
    const swaggerUI = require("swagger-ui-express");
    const swaggerJsDoc = require("swagger-jsdoc");
    const options = {
        definition: {
            openapi: "3.0.0",
            info: {
                title: "DeVinci FabLab API",
                version: require("./package.json").version,
                description: "Hello and welcome to the API documentation of the DeVinci FabLab Association website.\n" +
                    "If you are not a developer of the site or a member of the association, you have nothing to do on this page (I know you will stay anyway). Congratulations for finding this page by the way.\n",
            },
            servers: [{
                url: config.url + config.port + "/api/",
            }, ],
        },
        apis: ["./api/*.js", "./api/*/*.js", "./api/*/*/*.js"],
    };

    const specs = swaggerJsDoc(options);

    app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));
}

require("./functions/startApi").run(app);

//prepare folders
if (!fs.existsSync(__dirname + '/tmp')) fs.mkdirSync(__dirname + '/tmp');
fs.readdir(__dirname + '/tmp', (err, files) => {
    if (err) throw err;
    for (const file of files) {
        fs.unlinkSync(__dirname + '/tmp/' + file);
    }
});
if (!fs.existsSync(__dirname + '/data')) fs.mkdirSync(__dirname + '/data');
if (!fs.existsSync(__dirname + '/data/files')) fs.mkdirSync(__dirname + '/data/files');
if (!fs.existsSync(__dirname + '/data/files/stl')) fs.mkdirSync(__dirname + '/data/files/stl');

async function start() {
    app.db = await require("./functions/dataBase/createConnection").open();
    app.executeQuery = require("./functions/dataBase/executeQuery").run;

    //app.bot = require("./discordBot/index").run();
    const port = config.port;
    app.listen(port);
    console.log();
    console.log("Server is now listening port " + port);
    if (config.showSwagger) console.log("Swagger documentation available here : " + config.url + config.port + "/api-docs");
}

start()