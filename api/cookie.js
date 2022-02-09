module.exports.testSpecialTest = async (app) => {
    app.get("/api/cookie/", async function (req, res) {
        try {
            const specialCodeUser = req.headers.specialcode;
            const specialCode = await require("../functions/userAuthorization").getSpecialCode();
            if (!specialCode || !specialCodeUser || (specialCodeUser !== specialCode)) {
                res.sendStatus(404);
                return;
            }

            res.sendStatus(200);
        } catch (error) {
            console.log("ERROR: GET /api/cookie/");
            console.log(error);
            res.sendStatus(500);
        }
    })
}

module.exports.deleteAll = async (app) => {
    app.delete("/api/cookie/", async function (req, res) {
        try {
            const specialCodeUser = req.headers.specialcode;
            const specialCode = await require("../functions/userAuthorization").getSpecialCode();
            if (!specialCode || !specialCodeUser || (specialCodeUser !== specialCode)) {
                res.sendStatus(404);
                return;
            }

            app.cookiesList = {};
            res.sendStatus(200);
        } catch (error) {
            console.log("ERROR: DELETE /api/cookie/");
            console.log(error);
            res.sendStatus(500);
        }
    })
}

module.exports.getMe = async (app) => {
    /*
    app.get("/api/user/me", async function (req, res) {
        try {
            const dvflcookie = req.headers.dvflcookie;
            const userId = app.cookiesList[dvflcookie];
            // unauthenticated user
            if (!dvflcookie || !userId) {
                res.sendStatus(401);
                return;
            }
            const dbRes = await app.executeQuery(app.db, "SELECT `i_id` AS `id`, `v_firstName` AS firstName, `v_lastName` AS lastName , CONCAT(v_firstName, ' ', LEFT(v_lastName, 1), '.') AS userName , `v_email` AS email, `dt_creationdate` AS creationDate, `v_discordid` AS discordid,`v_language` AS language, `b_isMicrosoft` AS isMicrosoft, `v_title` AS title, (SELECT CASE WHEN dt_ruleSignature IS NULL THEN FALSE ELSE TRUE END FROM users WHERE `i_id` = ?) AS acceptedRule, `b_mailValidated` AS mailValidated FROM `users` WHERE `i_id` = ? AND `b_deleted` = 0 AND `b_visible` = 1", [userId, userId]);
            // The sql request has an error
            if (dbRes[0]) {
                console.log(dbRes[0]);
                res.sendStatus(500);
                return;
            }
            // The response has no value
            if (dbRes[1].length !== 1) {
                res.sendStatus(204);
                return;
            }
            res.json(dbRes[1][0]);
        } catch (error) {
            console.log("ERROR: GET /api/user/me");
            console.log(error);
            res.sendStatus(500);
        }
    })
    */
}