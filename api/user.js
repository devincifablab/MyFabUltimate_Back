/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: "integer"
 *           format: "int64"
 *           description: Id of the user
 *         firstName:
 *           type: "string"
 *           description: First name of the user
 *         lastName:
 *           type: "string"
 *           description: Last name of the user
 *         email:
 *           type: "string"
 *           description: Email of the user
 *         creationDate:
 *           type: "string"
 *           format: "date-time"
 *           description: "Date when the user was created"
 *         discordid:
 *           type: "string"
 *           description: "Discord id when the user was created, if seted"
 *         language:
 *           type: "string"
 *           description: "The language selected by the user. By default the language is 'fr'"
 *         acceptedRule:
 *           type: "boolean"
 *           description: "If the user has accepted the general conditions of use"
 *         mailValidated:
 *           type: "boolean"
 *           description: "If the user has validated his email address"
 *       example:
 *         id: 212
 *         firstName: John
 *         lastName: Doe
 *         email: john.doe@mailcom
 *         creationDate: 2021-12-16T09:31:38.000Z
 *         discordid: 012345678901
 *         language: fr
 *         acceptedRule: 1
 *         mailValidated: 1
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ShortUser:
 *       type: object
 *       properties:
 *         id:
 *           type: "integer"
 *           format: "int64"
 *           description: Id of the user
 *         firstName:
 *           type: "string"
 *           description: First name of the user
 *         lastName:
 *           type: "string"
 *           description: Last name of the user
 *         email:
 *           type: "string"
 *           description: Email of the user
 *       example:
 *         id: 212
 *         firstName: John
 *         lastName: Doe
 *         email: john.doe@mailcom
 */

/**
 * @swagger
 * tags:
 *   name: User
 *   description: Everything about users
 */

/**
 * @swagger
 * /user:
 *   get:
 *     summary: Get all users data
 *     tags: [User]
 *     parameters:
 *     - name: dvflCookie
 *       in: header
 *       description: Cookie of the user making the request
 *       required: true
 *       type: string
 *     responses:
 *       "200":
 *         description: "Get all users data. Warning the returned users do not contain all the data"
 *         content:
 *           application/json:
 *             schema:
 *               type: "array"
 *               items:
 *                 $ref: '#/components/schemas/ShortUser'
 *       401:
 *        description: "The user is unauthenticated"
 *       403:
 *        description: "The user is not allowed"
 *       500:
 *        description: "Internal error with the request"
 */

module.exports.getAll = async (app) => {
    app.get("/api/user/", async function (req, res) {
        try {
            const dvflcookie = req.headers.dvflcookie;
            const userIdAgent = app.cookiesList[req.headers.dvflcookie];
            // unauthenticated user
            if (!dvflcookie || !userIdAgent) {
                res.sendStatus(401);
                return;
            }
            const authViewResult = await require("../functions/userAuthorization").validateUserAuth(app, userIdAgent, "viewUsers");
            if (!authViewResult) {
                res.sendStatus(403);
                return;
            }
            const dbRes = await app.executeQuery(app.db, 'SELECT `i_id` AS `id`, `v_firstName` AS `firstName`, `v_lastName` AS `lastName`, `v_email` AS `email` FROM `users` WHERE `b_deleted` = 0 AND `b_visible` = 1', []);
            if (dbRes[0]) {
                console.log(dbRes[0]);
                res.sendStatus(500);
                return;
            }
            res.json(dbRes[1])
        } catch (error) {
            console.log("ERROR: GET /api/user/");
            console.log(error);
            res.sendStatus(500);
        }
    })
}

/**
 * @swagger
 * /user/me:
 *   get:
 *     summary: Get data of the current user
 *     tags: [User]
 *     parameters:
 *     - name: dvflCookie
 *       in: header
 *       description: Cookie of the user making the request
 *       required: true
 *       type: string
 *     responses:
 *       200:
 *         description: Get one user data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       204:
 *        description: "The request has no content"
 *       401:
 *        description: "The user is unauthenticated"
 *       500:
 *        description: "Internal error with the request"
 */

module.exports.getMe = async (app) => {
    app.get("/api/user/me", async function (req, res) {
        try {
            const dvflcookie = req.headers.dvflcookie;
            const userId = app.cookiesList[dvflcookie];
            // unauthenticated user
            if (!dvflcookie || !userId) {
                res.sendStatus(401);
                return;
            }
            const dbRes = await app.executeQuery(app.db, 'SELECT `i_id` AS `id`, `v_firstName` AS "firstName", `v_lastName` AS "lastName", `v_email` AS "email", `dt_creationdate` AS "creationDate", `v_discordid` AS "discordid",`v_language` AS "language", `b_isMicrosoft` AS "isMicrosoft", `v_title` AS "title", (SELECT CASE WHEN dt_ruleSignature IS NULL THEN FALSE ELSE TRUE END FROM users WHERE `i_id` = ?) AS "acceptedRule", `b_mailValidated` AS "mailValidated" FROM `users` WHERE `i_id` = ? AND `b_deleted` = 0 AND `b_visible` = 1', [userId, userId]);
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
}


/**
 * @swagger
 * /user/{id}:
 *   get:
 *     summary: Get one user data
 *     tags: [User]
 *     consumes:
 *     - "application/x-www-form-urlencoded"
 *     parameters:
 *     - name: "id"
 *       in: "path"
 *       description: "Id of user"
 *       required: true
 *       type: "integer"
 *       format: "int64"
 *     - name: dvflCookie
 *       in: header
 *       description: Cookie of the user making the request
 *       required: true
 *       type: string
 *     responses:
 *       200:
 *         description: Get one user data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       204:
 *        description: "The request has no content"
 *       400:
 *        description: "id is not valid"
 *       401:
 *        description: "The user is unauthenticated"
 *       403:
 *        description: "The user is not allowed"
 *       500:
 *        description: "Internal error with the request"
 */

module.exports.get = async (app) => {
    app.get("/api/user/:id", async function (req, res) {
        try {
            const dvflcookie = req.headers.dvflcookie;
            const userIdAgent = app.cookiesList[req.headers.dvflcookie];
            const idUserTarget = req.params.id;
            // Id is not a number
            if (isNaN(idUserTarget)) {
                res.sendStatus(400);
                return;
            }
            // unauthenticated user
            if (!dvflcookie || !userIdAgent) {
                res.sendStatus(401);
                return;
            }
            const authViewResult = await require("../functions/userAuthorization").validateUserAuth(app, userIdAgent, "viewUsers");
            if (!authViewResult) {
                res.sendStatus(403);
                return;
            }
            const dbRes = await app.executeQuery(app.db, 'SELECT `i_id` AS `id`, `v_firstName` AS "firstName", `v_lastName` AS "lastName", `v_email` AS "email", `dt_creationdate` AS "creationDate", `v_discordid` AS "discordid",`v_language` AS "language", (SELECT CASE WHEN dt_ruleSignature IS NULL THEN FALSE ELSE TRUE END FROM users WHERE `i_id` = ?) AS "acceptedRule", `b_mailValidated` AS "mailValidated" FROM `users` WHERE `i_id` = ? AND `b_deleted` = 0 AND `b_visible` = 1', [idUserTarget, idUserTarget]);
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
            console.log("ERROR: GET /api/user/:id");
            console.log(error);
            res.sendStatus(500);
        }
    })
}

/**
 * @swagger
 * /user/{id}:
 *   delete:
 *     summary: Delete one user
 *     tags: [User]
 *     consumes:
 *     - "application/x-www-form-urlencoded"
 *     parameters:
 *     - name: "id"
 *       in: "path"
 *       description: "Id of user"
 *       required: true
 *       type: "integer"
 *       format: "int64"
 *     - name: dvflCookie
 *       in: header
 *       description: Cookie of the user making the request
 *       required: true
 *       type: string
 *     responses:
 *       200:
 *        description: "Suppression succed"
 *       204:
 *        description: "No user deleted"
 *       400:
 *        description: "id is not valid"
 *       401:
 *        description: "The user is unauthenticated"
 *       403:
 *        description: "The user is not allowed"
 *       500:
 *        description: "Internal error with the request"
 */

module.exports.delete = async (app) => {
    app.delete("/api/user/:id", async function (req, res) {
        try {
            const dvflcookie = req.headers.dvflcookie;
            const idUserTarget = req.params.id;
            // unauthenticated user
            if (!dvflcookie) {
                res.sendStatus(401);
                return;
            }
            // if the user is not allowed
            const userIdAgent = app.cookiesList[req.headers.dvflcookie];
            if (!userIdAgent) {
                res.sendStatus(401);
                return;
            }
            const authViewResult = await require("../functions/userAuthorization").validateUserAuth(app, userIdAgent, "viewUsers");
            if (!authViewResult) {
                res.sendStatus(403);
                return;
            }
            const authManageUserResult = await require("../functions/userAuthorization").validateUserAuth(app, userIdAgent, "manageUser");
            if (!authManageUserResult) {
                res.sendStatus(403);
                return;
            }
            // Id is not a number or user try to delete himself
            if (isNaN(idUserTarget) || idUserTarget == userIdAgent) {
                res.sendStatus(400);
                return;
            }

            const queryDeleteUser = `UPDATE users 
            SET b_deleted = "1",
            dt_creationdate = CURRENT_TIMESTAMP
            WHERE i_id = ?;`;

            const dbRes = await app.executeQuery(app.db, queryDeleteUser, [idUserTarget]);
            // The sql request has an error
            if (dbRes[0]) {
                console.log(dbRes[0]);
                res.sendStatus(500);
                return;
            }
            // The response has no value
            if (dbRes[1].changedRows !== 1) {
                res.sendStatus(204);
                return;
            }
            res.sendStatus(200);
        } catch (error) {
            console.log("ERROR: DELETE /api/user/:id");
            console.log(error);
            res.sendStatus(500);
        }
    })
}

/**
 * @swagger
 * /user/discord/link/:
 *   get:
 *     summary: Get the link to connect to a Discord account
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Get the link to connect to a Discord account
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *               example:
 *                 result: https://discord.com/oauth2/authorize?client_id=Bas%20non%20ce%20lien%20marche%20pô&redirect_uri=http%3A%2F%2Flocalhost%2FdiscordConnection&response_type=code&scope=identify
 *       500:
 *        description: "Internal error with the request"
 */

const config = require("../config.json");
module.exports.get = (app) => {
    app.get("/api/user/discord/link/", async function (req, res) {
        try {
            if (!config.bot || !config.bot.clientId) {
                console.log("Discord link with MyFab not configured");
                res.sendStatus(500);
                return;
            }
            res.json({
                result: "https://discord.com/oauth2/authorize?client_id=" + config.bot.clientId + "&redirect_uri=http%3A%2F%2Flocalhost%2FdiscordConnection&response_type=code&scope=identify"
            })
        } catch (error) {
            console.log("ERROR: GET /api/user/discord/link/");
            console.log(error);
            res.sendStatus(500);
        }
    })
}

/**
 * @swagger
 * /user/discord/{code}:
 *   post:
 *     summary: Link discord account with MyFab
 *     tags: [User]
 *     parameters:
 *     - name: "code"
 *       in: "path"
 *       description: "Discord tocken for the user"
 *       required: true
 *       type: string
 *     - name: dvflCookie
 *       in: header
 *       description: Cookie of the user making the request
 *       required: true
 *       type: string
 *     responses:
 *       200:
 *        description: "The user have link his account"
 *       400:
 *        description: "The body does not have all the necessary field"
 *       401:
 *        description: "The user is unauthenticated"
 *       403:
 *        description: "This discord account is already been used or an id is already set for this user"
 *       500:
 *        description: "Internal error with the request"
 */

const DiscordOauth2 = require("discord-oauth2");
module.exports.post = async (app) => {
    app.post("/api/user/discord/:code", async function (req, res) {
        try {
            if (!config.bot || !config.bot.clientId || !config.bot.clientSecret) {
                console.log("Discord link with MyFab not configured");
                res.sendStatus(500);
                return;
            }
            const dvflcookie = req.headers.dvflcookie;
            // unauthenticated user
            if (!dvflcookie) {
                res.sendStatus(401);
                return;
            }
            // The body does not have all the necessary field
            if (!req.params.code) {
                res.sendStatus(400);
                return;
            }
            const userId = app.cookiesList[dvflcookie];
            if (!userId) {
                res.sendStatus(401);
                return;
            }

            const oauth = new DiscordOauth2();
            const access_token = req.params.code;
            oauth.tokenRequest({
                clientId: config.bot.clientId,
                clientSecret: config.bot.clientSecret,
                code: access_token,
                scope: "identify",
                grantType: "authorization_code",
                redirectUri: (config.url.split(":")[0] + ":" + config.url.split(":")[1]) + "/" + "discordConnection",
            }).then((result) => {
                oauth.getUser(result.access_token).then(async (userDiscordData) => {
                    const querySelect = `SELECT 1 FROM users
                    WHERE v_discordid = ?
                    OR (i_id = ?
                        AND v_discordid IS NOT NULL)`;

                    const dbResSelect = await app.executeQuery(app.db, querySelect, [userDiscordData.id, userId]);
                    if (dbResSelect[0]) {
                        console.log(dbResSelect[0]);
                        res.sendStatus(500);
                        return;
                    }
                    if (dbResSelect[1].length != 0) {
                        res.sendStatus(403);
                        return;
                    }

                    const queryUpdate = `UPDATE users SET v_discordid = ? WHERE i_id = ?;`;

                    const dbResUpdate = await app.executeQuery(app.db, queryUpdate, [userDiscordData.id, userId]);
                    if (dbResUpdate[0]) {
                        console.log(dbResUpdate[0]);
                        res.sendStatus(500);
                        return;
                    }

                    res.json({
                        tag: userDiscordData.username + "#" + userDiscordData.discriminator,
                        avatar: userDiscordData.avatar ? "https://cdn.discordapp.com/avatars/" + userDiscordData.id + "/" + userDiscordData.avatar + ".webp?size=128" : "https://external-preview.redd.it/4PE-nlL_PdMD5PrFNLnjurHQ1QKPnCvg368LTDnfM-M.png?auto=webp&s=ff4c3fbc1cce1a1856cff36b5d2a40a6d02cc1c3"
                    })
                }).catch(() => {
                    res.sendStatus(500);
                    return;
                })
            }).catch(() => {
                res.sendStatus(500);
                return;
            })
        } catch (error) {
            console.log("ERROR: POST /api/user/discord/:code");
            console.log(error);
            res.sendStatus(500);
        }
    })
}