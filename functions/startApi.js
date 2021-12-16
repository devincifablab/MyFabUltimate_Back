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
                if (route.getAll != null) {
                    app.get(path + "/" + fileSplited[0], async function (req, res) {
                        try {
                            route.getAll(req, res, app);
                        } catch (error) {
                            console.log(error);
                        }
                    })
                }
                if (route.get != null) {
                    const routeOptions = route.option ? route.option.get ? route.option.get : "" : "";
                    app.get(path + "/" + fileSplited[0] + routeOptions, async function (req, res) {
                        try {
                            route.get(req, res, app);
                        } catch (error) {
                            console.log(error);
                        }
                    })
                }
                if (route.post != null) {
                    const routeOptions = route.option ? route.option.post ? route.option.post : "" : "";
                    app.post(path + "/" + fileSplited[0] + routeOptions, async function (req, res) {
                        try {
                            route.post(req, res, app);
                        } catch (error) {
                            console.log(error);
                        }
                    })
                }
                if (route.putMe != null) {
                    app.put(path + "/" + fileSplited[0], async function (req, res) {
                        try {
                            route.putMe(req, res, app);
                        } catch (error) {
                            console.log(error);
                        }
                    })
                }
                if (route.put != null) {
                    const routeOptions = route.option ? route.option.put ? route.option.put : "" : "";
                    app.put(path + "/" + fileSplited[0] + routeOptions, async function (req, res) {
                        try {
                            route.put(req, res, app);
                        } catch (error) {
                            console.log(error);
                        }
                    })
                }
                if (route.delete != null) {
                    const routeOptions = route.option ? route.option.delete ? route.option.delete : "" : "";
                    app.delete(path + "/" + fileSplited[0] + routeOptions, async function (req, res) {
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