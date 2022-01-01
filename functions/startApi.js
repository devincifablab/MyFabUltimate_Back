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
    });
}

module.exports.run = (app) => {
    runFolder("/api", app);
}