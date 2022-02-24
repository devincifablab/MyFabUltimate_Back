const sha256 = require("sha256");
const axios = require("axios");


/**
 * @swagger
 * /user/login/microsoft/:
 *   get:
 *     summary: Connect a microsoft account and return a cookie
 *     tags: [User]
 *     parameters:
 *     - name: "token"
 *       in: "header"
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
 *       400:
 *        description: "The body does not have all the necessary field"
 *       401:
 *        description: "The account is not from the De Vinci Microsoft organization"
 *       500:
 *        description: "Internal error with the request"
 */

module.exports.postMicrosoftLogin = postMicrosoftLogin;
async function postMicrosoftLogin(data) {
    const token = data.authorization;
    // The body does not have all the necessary field
    if (!token) {
        return {
            type: "code",
            code: 400
        }
    }
    return await new Promise(async function (resolve) {
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
                    console.log("response");
                    const firstName = response.data.givenName;
                    const lastName = response.data.surname;
                    const email = response.data.mail;
                    const jobTitle = response.data.jobTitle;
                    const dbRes = await data.app.executeQuery(data.app.db, "SELECT `i_id` AS 'id', `v_title` AS 'title' FROM `users` WHERE `v_email` = ?;", [email]);

                    // Error with the sql request
                    if (dbRes[0]) {
                        console.log(dbRes[0]);
                        return resolve({
                            type: "code",
                            code: 500
                        })
                    }
                    // No match with tables => invalid email or password
                    if (dbRes[1].length < 1) {
                        //La création de nouveau compte pour une organisation différente est désactivé
                        if (responseOrganization.data.value[0].displayName != "De Vinci") {
                            return resolve({
                                type: "code",
                                code: 401
                            })
                        }

                        //On doit créer un compte
                        const language = data.body.language ? data.body.language : "fr";
                        const resInsertNewAccount = await data.app.executeQuery(data.app.db, "INSERT INTO `users` (`v_firstName`, `v_lastName`, `v_email`, `v_password`, `v_language`, `v_title`, `b_isMicrosoft`, `b_mailValidated`) VALUES (?, ?, ?, ?, ?, ?, 1, 1);", [firstName, lastName, email, sha256(token), language, jobTitle]);
                        // Error with the sql request
                        if (resInsertNewAccount[0] || resInsertNewAccount[1].affectedRows !== 1) {
                            console.log(resInsertNewAccount[0]);
                            return resolve({
                                type: "code",
                                code: 500
                            })
                        }
                        const resGetIdUserInserted = await data.app.executeQuery(data.app.db, "SELECT LAST_INSERT_ID() AS 'id';", []);
                        // Error with the sql request
                        if (resGetIdUserInserted[0] || resGetIdUserInserted[1].length !== 1 || resGetIdUserInserted[1][0].id === 0) {
                            console.log(resGetIdUserInserted[0]);
                            return resolve({
                                type: "code",
                                code: 500
                            })
                        }
                        const idNewUser = resGetIdUserInserted[1][0].id;
                        const cookie = sha256((new Date().toISOString() + idNewUser + email).split('').sort(function () {
                            return 0.5 - Math.random()
                        }).join(''));
                        data.app.cookiesList[cookie] = idNewUser;

                        return resolve({
                            type: "json",
                            code: 200,
                            json: {
                                dvflCookie: cookie
                            }
                        })

                    }
                    // Too much match with tables
                    if (dbRes[1].length > 1) {
                        console.log("Login match with multiple users : " + email);
                        return resolve({
                            type: "code",
                            code: 500
                        })
                    }

                    const id = dbRes[1][0].id;
                    if (dbRes[1][0].title !== jobTitle) {
                        await data.app.executeQuery(data.app.db, "UPDATE `users` SET `v_title` = ? WHERE `i_id` = ?;", [jobTitle, id]);
                    }

                    const cookie = sha256((new Date().toISOString() + id + email).split('').sort(function () {
                        return 0.5 - Math.random()
                    }).join(''));
                    data.app.cookiesList[cookie] = id;

                    return resolve({
                        type: "json",
                        code: 200,
                        json: {
                            dvflCookie: cookie
                        }
                    })
                })
                .catch((error) => {
                    console.log(error);
                    return resolve({
                        type: "code",
                        code: 500
                    })
                })
        })
    })
}

module.exports.startApi = startApi;
async function startApi(app) {
    app.get("/api/user/login/microsoft", async function (req, res) {
        try {
            const data = await require("../../functions/apiActions").prepareData(app, req, res);
            data.authorization = req.headers.authorization;
            const result = await postMicrosoftLogin(data);
            await require("../../functions/apiActions").sendResponse(req, res, result);
        } catch (error) {
            console.log("ERROR: POST api/user/login/microsoft/");
            console.log(error);
            res.sendStatus(500);
        }
    })
}