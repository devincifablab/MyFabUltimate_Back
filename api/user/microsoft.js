const sha256 = require("sha256");
const axios = require("axios");


/**
 * @swagger
 * /user/login/microsoft/{token}:
 *   post:
 *     summary: Connect a microsoft account and return a cookie
 *     tags: [User]
 *     parameters:
 *     - name: "token"
 *       in: "path"
 *       description: "Token to login/register"
 *       required: true
 *       type: "string"
 *     responses:
 *       200:
 *         description: Test to detect if the server is responding correctly
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dvflCookie:
 *                   type: string
 *               example:
 *                 dvflCookie: "cookieValue"
 *       204:
 *        description: "The account is not from the devinci network."
 *       400:
 *        description: "The body does not have all the necessary field"
 *       401:
 *        description: "The account is not from the De Vinci Microsoft organization"
 *       500:
 *        description: "Internal error with the request"
 */

module.exports.get = async (app) => {
    app.get("/api/user/login/microsoft", async function (req, res) {
        try {
            const token = req.headers.authorization;
            // The body does not have all the necessary field
            if (!req.headers.authorization) {
                res.sendStatus(400);
                return;
            }
            await axios({
                method: 'GET',
                headers: {
                    'Authorization': token,
                },
                url: 'https://graph.microsoft.com/v1.0/organization',
            }).then(async (responseOrganization) => {
                await axios({
                        method: 'GET',
                        headers: {
                            'Authorization': token,
                        },
                        url: 'https://graph.microsoft.com/v1.0/me',
                    }).then(async (response) => {
                        const firstName = response.data.givenName;
                        const lastName = response.data.surname;
                        const email = response.data.mail;
                        const jobTitle = response.data.jobTitle;
                        const dbRes = await app.executeQuery(app.db, "SELECT `i_id` AS 'id', `v_title` AS 'title' FROM `users` WHERE `v_email` = ?;", [email]);

                        // Error with the sql request
                        if (dbRes[0]) {
                            console.log(dbRes[0]);
                            res.sendStatus(500);
                            return;
                        }
                        // No match with tables => invalid email or password
                        if (dbRes[1].length < 1) {
                            //La création de nouveau compte pour une organisation différente est désactivé
                            if (responseOrganization.data.value[0].displayName != "De Vinci") {
                                res.sendStatus(401);
                                return;
                            }

                            //On doit créer un compte
                            const language = req.body.language ? req.body.language : "fr";
                            const resInsertNewAccount = await app.executeQuery(app.db, "INSERT INTO `users` (`v_firstName`, `v_lastName`, `v_email`, `v_password`, `v_language`, `v_title`, `b_isMicrosoft`, `b_mailValidated`) VALUES (?, ?, ?, ?, ?, ?, 1, 1);", [firstName, lastName, email, sha256(token), language, jobTitle]);
                            // Error with the sql request
                            if (resInsertNewAccount[0] || resInsertNewAccount[1].affectedRows !== 1) {
                                console.log(resInsertNewAccount[0]);
                                res.sendStatus(500);
                                return;
                            }
                            const resGetIdUserInserted = await app.executeQuery(app.db, "SELECT LAST_INSERT_ID() AS 'id';", []);
                            // Error with the sql request
                            if (resGetIdUserInserted[0] || resGetIdUserInserted[1].length !== 1 || resGetIdUserInserted[1][0].id === 0) {
                                console.log(resGetIdUserInserted[0]);
                                res.sendStatus(500);
                                return;
                            }
                            const idNewUser = resGetIdUserInserted[1][0].id;
                            const cookie = sha256((new Date().toISOString() + idNewUser + email).split('').sort(function () {
                                return 0.5 - Math.random()
                            }).join(''));
                            app.cookiesList[cookie] = idNewUser;

                            res.json({
                                dvflCookie: cookie
                            })
                            return;
                        }
                        // Too much match with tables
                        if (dbRes[1].length > 1) {
                            console.log("Login match with multiple users : " + email);
                            res.sendStatus(500);
                            return;
                        }

                        const id = dbRes[1][0].id;
                        if (dbRes[1][0].title !== jobTitle) {
                            await app.executeQuery(app.db, "UPDATE `users` SET `v_title` = ? WHERE `i_id` = ?;", [jobTitle, id]);
                        }

                        const cookie = sha256((new Date().toISOString() + id + email).split('').sort(function () {
                            return 0.5 - Math.random()
                        }).join(''));
                        app.cookiesList[cookie] = id;

                        res.json({
                            dvflCookie: cookie
                        })
                    })
                    .catch((error) => {
                        console.log(error);
                        res.sendStatus(500);
                    })
            })
        } catch (error) {
            console.log("ERROR: POST /api/user/login/");
            console.log(error);
            res.sendStatus(500);
        }
    })
}