const fs = require("fs");


async function runFolder(path, app) {
    return await new Promise(async (resolve) => {
        fs.readdirSync(__dirname + "/.." + path).forEach(async (file) => {
            const filePath = path + "/" + file;
            if (fs.lstatSync(__dirname + "/.." + filePath).isDirectory()) await runFolder(filePath, app);
            else {
                const fileSplited = file.split(".");
                if (fileSplited[fileSplited.length - 1] !== "js") console.log("Unexpected file type : " + file);
                else {
                    const route = require(__dirname + "/.." + filePath);
                    if (route["startApi"]) {
                        try {
                            route["startApi"](app);
                        } catch (error) {
                            //Error for api start
                            console.log("Error for api start");
                            console.log(error);
                        }
                    } else {
                        console.log(__dirname + "/.." + filePath);
                        const keys = Object.keys(route);
                        for (let i = 0; i < keys.length; i++) {
                            const key = keys[i];
                            try {
                                route[key](app);
                            } catch (error) {
                                //Error for api start
                                console.log("Error for api start");
                                console.log(error);
                            }
                        }
                    }
                }
            }
            resolve();
        });
    })
}

module.exports.startApi = async (app) => {
    await runFolder("/api", app);
    app.get("*", async function (req, res) {
        res.sendStatus(404);
    })
}

module.exports.prepareData = async (app, req, res) => {
    const data = {
        app: app,
        params: req.params,
        userId: req.headers.dvflcookie ? app.cookiesList[req.headers.dvflcookie] : null,
        userAuthorization: require("../functions/userAuthorization")
    };
    return data;
}

module.exports.sendResponse = async (req, res, data) => {
    switch (data.type) {
        case "json":
            res.json(data.json)
            break;
        case "code":
            res.sendStatus(data.code);
            break;

        default:
            console.log("ERROR : Send result of api\nUnknown type: " + data.type)
            res.sendStatus(500);
            break;
    }
}