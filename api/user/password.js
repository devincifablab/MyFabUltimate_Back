const sha256 = require("sha256");

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

/**
 * @swagger
 * /user/password/:
 *   put:
 *     summary: Change the user's password with the associated cookie
 *     tags: [User]
 *     parameters:
 *     - name: dvflCookie
 *       in: header
 *       description: Cookie of the user making the request
 *       required: true
 *       type: string
 *     requestBody:
 *       description: "Data to change password"
 *       required: true
 *       content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              actualPassword:
 *                type: string
 *              newPassword:
 *                type: string
 *     responses:
 *       200:
 *        description: "The user password is updated"
 *        content:
 *          application/json:
 *            schema:
 *              type: "object"
 *              properties:
 *                result:
 *                  type: string
 *              example:
 *                result: "password changed"
 *       400:
 *        description: "The body does not have all the necessary field"
 *       401:
 *        description: "The user is unauthenticated"
 *       500:
 *        description: "Internal error with the request"
 */

module.exports.putMe = async (app) => {
    app.put("/api/user/password/", async function (req, res) {
        try {
            const dvflcookie = req.headers.dvflcookie;
            // unauthenticated user
            if (!dvflcookie) {
                res.sendStatus(401);
                return;
            }
            // The body does not have all the necessary field
            if (!req.body.actualPassword || !req.body.newPassword) {
                res.sendStatus(400);
                return;
            }
            const userTarget = app.cookiesList[dvflcookie];
            if (!userTarget) {
                res.sendStatus(401);
                return;
            }
            const dbRes = await app.executeQuery(app.db, "UPDATE `users` SET `v_password` = ? WHERE `i_id` = ? AND `v_password` = ?;", [sha256(req.body.newPassword), userTarget, sha256(req.body.actualPassword)]);
            // Error with the sql request
            if (dbRes[0]) {
                console.log(dbRes[0]);
                res.sendStatus(500);
                return;
            }
            // No match with tables => invalid password
            if (dbRes[1].affectedRows < 1) {
                res.json({
                    result: "password incorect"
                })
                return;
            }
            // Too much match with tables
            if (dbRes[1].affectedRows > 1) {
                console.log("update one user affect multiple users");
                res.sendStatus(500);
                return;
            }
            // Everything is fine
            res.json({
                result: "password changed"
            })
        } catch (error) {
            console.log("ERROR: PUT /user/password/");
            console.log(error);
            res.sendStatus(500);
        }
    })
}

/**
 * @swagger
 * /user/password/{id}:
 *   put:
 *     summary: Update selected user password
 *     tags: [User]
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
 *     requestBody:
 *       description: "Data to change password"
 *       required: true
 *       content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              newPassword:
 *                type: string
 *     responses:
 *       200:
 *         description: Test to detect if the server is responding correctly
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ping'
 *       400:
 *        description: "id is not valid"
 *       401:
 *        description: "The user is unauthenticated"
 *       403:
 *        description: "The user is not allowed"
 */

module.exports.put = async (app) => {
    app.put("/api/user/password/:id", async function (req, res) {
        try {
            const dvflcookie = req.headers.dvflcookie;
            const idUserTarget = 1; //req.params.id;
            // unauthenticated user
            if (!dvflcookie) {
                res.sendStatus(401);
                return;
            }
            const userIdAgent = app.cookiesList[dvflcookie];
            if (!userIdAgent) {
                console.log("a");
                res.sendStatus(401);
                return;
            }
            // if the user is not allowed
            const authViewResult = await require("../../functions/userAuthorization").validateUserAuth(app, userIdAgent, "viewUsers");
            if (!authViewResult) {
                console.log("b");
                res.sendStatus(401);
                return;
            }
            const authManageUsersResult = await require("../../functions/userAuthorization").validateUserAuth(app, userIdAgent, "manageUser");
            if (!authManageUsersResult) {
                console.log("c");
                res.sendStatus(401);
                return;
            }
            // The body does not have all the necessary field or id is not a number
            if (isNaN(idUserTarget) || !req.body.actualPassword || !req.body.newPassword) {
                console.log("d");
                res.sendStatus(400);
                return;
            }
            const dbRes = await app.executeQuery(app.db, "UPDATE `users` SET `v_password` = ? WHERE `i_id` = ?;", [sha256(req.body.newPassword), idUserTarget]);
            // Error with the sql request
            if (dbRes[0]) {
                console.log(dbRes[0]);
                res.sendStatus(500);
                return;
            }
            // No match with tables => invalid password
            if (dbRes[1].affectedRows < 1) {
                res.json({
                    result: "password incorect or user not found"
                })
                return;
            }
            // Too much match with tables
            if (dbRes[1].affectedRows > 1) {
                console.log("update one user affect multiple users");
                res.sendStatus(500);
                return;
            }
            // Everything is fine
            res.json({
                result: "password changed"
            })
        } catch (error) {
            console.log("ERROR: PUT /user/password/:id");
            console.log(error);
            res.sendStatus(500);
        }
    })
}

/**
 * @swagger
 * /user/forgottenPassword/:
 *   post:
 *     summary: Send an email to reset password, if the request will be accepted if the email is valid and when it is incorrect
 *     tags: [User]
 *     requestBody:
 *       description: "Email of the user"
 *       required: true
 *       content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *     responses:
 *       200:
 *         description: "An email to reset the password has been sent"
 *       400:
 *        description: "Email not specified"
 *       500:
 *        description: "Internal error with the request"
 */

module.exports.postForgottenPassword = async (app) => {
    app.post("/api/user/forgottenPassword/", async function (req, res) {
        try {
            const email = req.body.email;
            if (!email) {
                res.sendStatus(400);
                return;
            }

            const dbRes = await app.executeQuery(app.db, 'SELECT `i_id` AS `id` FROM `users` WHERE `v_email` = ? AND `b_deleted` = 0 AND `b_visible` = 1', [email]);
            // The sql request has an error
            if (dbRes[0]) {
                console.log(dbRes[0]);
                res.sendStatus(500);
                return;
            }
            // The response has no value
            if (dbRes[1].length !== 1) {
                res.sendStatus(200);
                return;
            }
            const idNewUser = dbRes[1][0].id;
            const tocken = makeid(10);

            const sendMail = req.body.sendMail == null ? true : req.body.sendMail;
            const resInsertTocken = await app.executeQuery(app.db, "INSERT INTO `mailtocken` (`i_idUser`, `v_value`, `b_mailSend`) VALUES (?, ?, ?);", [idNewUser, tocken, sendMail ? "1" : "0"]);
            if (resInsertTocken[0]) {
                console.log(resInsertTocken[0]);
                res.sendStatus(500);
                return;
            }

            //Send validation email to the user
            if (sendMail) {
                require('../../functions/sendMail').sendMail(email, "[MyFab] Réinitialisation du mot de passe", "Bonjour,\nPour valider votre mail merci de cliquer sur ce lien\n" + tocken);
            }

            res.sendStatus(200);
        } catch (error) {
            console.log("ERROR: POST /api/user/forgottenPassword/");
            console.log(error);
            res.sendStatus(500);
        }
    })
}

/**
 * @swagger
 * /user/resetPassword/{tocken}:
 *   put:
 *     summary: Change the user's password with the associated tocken
 *     tags: [User]
 *     parameters:
 *     - name: "tocken"
 *       in: "path"
 *       description: "Tocken of user"
 *       required: true
 *       type: "string"
 *     requestBody:
 *       description: "Data to change password"
 *       required: true
 *       content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              newPassword:
 *                type: string
 *     responses:
 *       200:
 *        description: "The user password is updated"
 *       400:
 *        description: "The body does not have all the necessary field"
 *       401:
 *        description: "The user is unauthenticated"
 *       500:
 *        description: "Internal error with the request"
 */

module.exports.putResetPassword = async (app) => {
    app.put("/api/user/resetPassword/:tocken", async function (req, res) {
        try {
            // The body does not have all the necessary field
            if (!req.body.newPassword || !req.params.tocken) {
                res.sendStatus(400);
                return;
            }

            const dbSelectId = await app.executeQuery(app.db, "SELECT i_idUser AS 'id' FROM `mailtocken` WHERE v_value = ?", [req.params.tocken]);
            if (dbSelectId[0]) {
                console.log(dbSelectId[0]);
                res.sendStatus(500);
                return;
            }
            if (dbSelectId[1].length != 1) {
                res.sendStatus(401);
                return;
            }

            const idUser = dbSelectId[1][0].id;
            const dbRes = await app.executeQuery(app.db, "UPDATE `users` SET `v_password` = ? WHERE `i_id` = ?;", [sha256(req.body.newPassword), idUser]);
            // Error with the sql request
            if (dbRes[0]) {
                console.log(dbRes[0]);
                res.sendStatus(500);
                return;
            }

            const dbDelete = await app.executeQuery(app.db, "DELETE FROM `mailtocken` WHERE v_value = ?", [req.params.tocken]);
            if (dbDelete[0]) {
                console.log(dbDelete[0]);
                res.sendStatus(500);
                return;
            }

            // Everything is fine
            res.sendStatus(200);
        } catch (error) {
            console.log("ERROR: PUT /api/user/password/");
            console.log(error);
            res.sendStatus(500);
        }
    })
}