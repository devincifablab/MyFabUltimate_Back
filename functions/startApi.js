const fs = require("fs");


async function runFolder(path, app) {
    fs.readdirSync(__dirname + "/.." + path).forEach(file => {
        const filePath = path + "/" + file;
        if (fs.lstatSync(__dirname + "/.." + filePath).isDirectory()) runFolder(filePath, app);
        else {
            const fileSplited = file.split(".");
            if (fileSplited[fileSplited.length - 1] !== "js") console.log("Unexpected file type : " + file);
            else {
                const route = require(__dirname + "/.." + filePath);
                if (route.get != null) {
                    app.get(path + "/" + fileSplited[0], async function (req, res) {
                        try {
                            route.get(req, res, app);
                        } catch (error) {
                            console.log(error);
                        }
                    })
                }
                if (route.post != null) {
                    app.post(path + "/" + fileSplited[0], async function (req, res) {
                        try {
                            route.post(req, res, app);
                        } catch (error) {
                            console.log(error);
                        }
                    })
                }
                if (route.put != null) {
                    app.put(path + "/" + fileSplited[0], async function (req, res) {
                        try {
                            route.put(req, res, app);
                        } catch (error) {
                            console.log(error);
                        }
                    })
                }
                if (route.delete != null) {
                    app.delete(path + "/" + fileSplited[0], async function (req, res) {
                        try {
                            route.delete(req, res, app);
                        } catch (error) {
                            console.log(error);
                        }
                    })
                }
            }
        }
    });
}

module.exports.run = (app) => {
    runFolder("/api", app);
}