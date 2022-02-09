const fs = require("fs");


function makeid(length, filename) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    if (fs.existsSync(__dirname + '/../../data/files/stl/' + result + "_" + filename)) {
        return makeid(length, filename);
    } else {
        return result + "_" + filename;
    }
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Ticket:
 *       type: object
 *       properties:
 *         id:
 *           type: "integer"
 *           format: "int64"
 *           description: Id of the ticket
 *         userName:
 *           type: "string"
 *           description: Name of the user
 *         projectType:
 *           type: "string"
 *           description: Project description
 *         creationDate:
 *           type: "string"
 *           format: "date-time"
 *           description: "Date when the user was created"
 *         modificationDate:
 *           type: "string"
 *           format: "date-time"
 *           description: "Date when the user was modified"
 *         statusName:
 *           type: "string"
 *           description: "The name of the status"
 *         statusColor:
 *           type: "string"
 *           description: "The color of the status"
 *         priorityName:
 *           type: "string"
 *           description: The name of the priority
 *         priorityColor:
 *           type: "string"
 *           description: The color of the priority
 *       example:
 *         id: 212
 *         userName: John D.
 *         projectType: Test
 *         creationDate: 2021-12-16T09:31:38.000Z
 *         modificationDate: 2021-12-16T09:31:38.000Z
 *         statusName: Ouvert
 *         statusColor: 111111
 *         priorityName: Normal
 *         priorityColor: 444444
 */

/**
 * @swagger
 * tags:
 *   name: Ticket
 *   description: Everything about tickets
 */

/**
 * @swagger
 * /ticket/me/:
 *   get:
 *     summary: Get all tickets data from a user.
 *     tags: [Ticket]
 *     parameters:
 *     - name: dvflCookie
 *       in: header
 *       description: Cookie of the user making the request
 *       required: true
 *       type: string
 *     responses:
 *       "200":
 *         description: "Get all ticlets data from a user"
 *         content:
 *           application/json:
 *             schema:
 *               type: "array"
 *               items:
 *                 $ref: '#/components/schemas/Ticket'
 *       401:
 *        description: "The user is unauthenticated"
 *       500:
 *        description: "Internal error with the request"
 */

module.exports.getMe = async (app) => {
    app.get("/api/ticket/me/", async function (req, res) {
        try {
            const dvflcookie = req.headers.dvflcookie;
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
            const query = `SELECT pt.i_id AS 'id', CONCAT(u.v_firstName, ' ', LEFT(u.v_lastName, 1), '.') AS 'userName',
             tpt.v_name AS 'projectType', u.v_title AS 'title' ,
             pt.dt_creationdate AS 'creationDate', pt.dt_modificationdate AS 'modificationDate',
             stat.v_name AS 'statusName', stat.v_color AS 'statusColor', tp.v_name AS 'priorityName', tp.v_color AS 'priorityColor' 
             FROM printstickets AS pt 
             INNER JOIN users AS u ON pt.i_idUser = u.i_id 
             INNER JOIN gd_ticketprojecttype AS tpt ON pt.i_projecttype = tpt.i_id 
             INNER JOIN gd_ticketpriority AS tp ON pt.i_priority = tp.i_id
             INNER JOIN gd_status AS stat ON pt.i_status = stat.i_id
             WHERE pt.i_idUser = ? AND pt.b_isDeleted = 0 ORDER BY pt.dt_creationdate DESC`;

            const dbRes = await app.executeQuery(app.db, query, [userIdAgent]);
            if (dbRes[0]) {
                console.log(dbRes[0]);
                res.sendStatus(500);
                return;
            }
            res.json(dbRes[1])
        } catch (error) {
            console.log("ERROR: GET /api/ticket/me/");
            console.log(error);
            res.sendStatus(500);
        }
    })
}

/**
 * @swagger
 * /ticket/:
 *   get:
 *     summary: Get all tickets data. The user need to be a 'myFabAgent'
 *     tags: [Ticket]
 *     parameters:
 *     - name: dvflCookie
 *       in: header
 *       description: Cookie of the user making the request
 *       required: true
 *       type: string
 *     responses:
 *       "200":
 *         description: "Get all ticlets data"
 *         content:
 *           application/json:
 *             schema:
 *               type: "array"
 *               items:
 *                 $ref: '#/components/schemas/Ticket'
 *       401:
 *        description: "The user is unauthenticated"
 *       403:
 *        description: "The user is not allowed"
 *       500:
 *        description: "Internal error with the request"
 */

module.exports.getAll = async (app) => {
    app.get("/api/ticket/", async function (req, res) {
        try {
            const dvflcookie = req.headers.dvflcookie;
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
            const authViewResult = await require("../../functions/userAuthorization").validateUserAuth(app, userIdAgent, "myFabAgent");
            if (!authViewResult) {
                res.sendStatus(403);
                return;
            }
            const query = `SELECT pt.i_id AS 'id', CONCAT(u.v_firstName, ' ', LEFT(u.v_lastName, 1), '.') AS 'userName',
             tpt.v_name AS 'projectType', u.v_title AS 'title' , pt.i_groupNumber AS 'groupNumber' ,
             pt.dt_creationdate AS 'creationDate', pt.dt_modificationdate AS 'modificationDate',
             stat.v_name AS 'statusName', stat.v_color AS 'statusColor', 
             tp.v_name AS 'priorityName', tp.v_color AS 'priorityColor' 
             FROM printstickets AS pt 
             INNER JOIN users AS u ON pt.i_idUser = u.i_id 
             INNER JOIN gd_ticketprojecttype AS tpt ON pt.i_projecttype = tpt.i_id 
             INNER JOIN gd_ticketpriority AS tp ON pt.i_priority = tp.i_id
             INNER JOIN gd_status AS stat ON pt.i_status = stat.i_id
             WHERE pt.b_isDeleted = 0 ORDER BY pt.dt_creationdate DESC`

            const dbRes = await app.executeQuery(app.db, query, []);
            if (dbRes[0]) {
                console.log(dbRes[0]);
                res.sendStatus(500);
                return;
            }
            res.json(dbRes[1])
        } catch (error) {
            console.log("ERROR: GET /api/ticket/");
            console.log(error);
            res.sendStatus(500);
        }
    })
}

/**
 * @swagger
 * /ticket/{id}:
 *   get:
 *     summary: Get a ticket data. The user need to be a 'myFabAgent' or the ticket owner
 *     tags: [Ticket]
 *     parameters:
 *     - name: dvflCookie
 *       in: header
 *       description: Cookie of the user making the request
 *       required: true
 *       type: string
 *     - name: "id"
 *       in: "path"
 *       description: "Id of the ticket"
 *       required: true
 *       type: "integer"
 *       format: "int64"
 *     responses:
 *       "200":
 *         description: "Get a ticket data"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
 *       204:
 *        description: "The content of the answer is either empty or contains more than one ticket"
 *       400:
 *        description: "Parameters or body not valid"
 *       401:
 *        description: "The user is unauthenticated"
 *       403:
 *        description: "The user is not allowed"
 *       500:
 *        description: "Internal error with the request"
 */

module.exports.get = async (app) => {
    app.get("/api/ticket/:id", async function (req, res) {
        try {
            const dvflcookie = req.headers.dvflcookie;
            // unauthenticated user
            if (!dvflcookie) {
                res.sendStatus(401);
                return;
            }
            // parameters or body not valid
            if (!req.params.id || isNaN(req.params.id)) {
                res.sendStatus(400);
                return;
            }
            // if the user is not allowed
            const userIdAgent = app.cookiesList[req.headers.dvflcookie];
            if (!userIdAgent) {
                res.sendStatus(401);
                return;
            }
            const resGetUserTicket = await app.executeQuery(app.db, "SELECT `i_idUser` AS 'id' FROM `printstickets` WHERE i_id = ?", [req.params.id]);
            if (resGetUserTicket[0]) {
                console.log(resGetUserTicket[0]);
                res.sendStatus(500);
                return;
            } else if (resGetUserTicket[1].length !== 1) {
                res.sendStatus(204);
                return;
            }
            const idTicketUser = resGetUserTicket[1][0].id;
            if (idTicketUser != userIdAgent) {
                const authViewResult = await require("../../functions/userAuthorization").validateUserAuth(app, userIdAgent, "myFabAgent");
                if (!authViewResult) {
                    res.sendStatus(403);
                    return;
                }
            }
            const query = `SELECT pt.i_id AS 'id', CONCAT(u.v_firstName, ' ', LEFT(u.v_lastName, 1), '.') AS 'userName',
             tpt.v_name AS 'projectType', u.v_title AS 'title' , u.v_email AS 'email' , pt.i_groupNumber AS 'groupNumber' ,
             pt.dt_creationdate AS 'creationDate', pt.dt_modificationdate AS 'modificationDate',
             stat.v_name AS 'statusName', stat.v_color AS 'statusColor',
             tp.v_name AS 'priorityName', tp.v_color AS 'priorityColor' 
             FROM printstickets AS pt 
             INNER JOIN users AS u ON pt.i_idUser = u.i_id 
             INNER JOIN gd_ticketprojecttype AS tpt ON pt.i_projecttype = tpt.i_id 
             INNER JOIN gd_ticketpriority AS tp ON pt.i_priority = tp.i_id
             INNER JOIN gd_status AS stat ON pt.i_status = stat.i_id
             WHERE pt.i_id = ? AND pt.b_isDeleted = 0`;
            const dbRes = await app.executeQuery(app.db, query, [req.params.id]);
            if (dbRes[0]) {
                console.log(dbRes[0]);
                res.sendStatus(500);
                return;
            }
            if (dbRes[1] == null || dbRes[1].length !== 1) {
                res.sendStatus(204);
                return;
            }
            const result = dbRes[1][0];

            const querySelectLogUpdProjectType = `SELECT
            CONCAT(u.v_firstName, ' ', LEFT(u.v_lastName, 1), '. a changé le type de projet en ', gdtpt.v_name) AS message,
            ltc.dt_timeStamp AS timeStamp
            FROM log_ticketschange AS ltc
            INNER JOIN users AS u ON ltc.i_idUser = u.i_id
            INNER JOIN gd_ticketprojecttype AS gdtpt ON ltc.v_newValue = gdtpt.i_id
            WHERE i_idTicket = ? AND v_action = 'upd_projType'
            ORDER BY ltc.dt_timeStamp ASC`;
            const dbResSelectLogUpdProjectType = await app.executeQuery(app.db, querySelectLogUpdProjectType, [req.params.id]);
            if (dbResSelectLogUpdProjectType[0]) {
                console.log(dbResSelectLogUpdProjectType[0]);
                res.sendStatus(500);
                return;
            }
            result.history = dbResSelectLogUpdProjectType[1];

            const querySelectLogUpdStatus = `SELECT
            CONCAT(u.v_firstName, ' ', LEFT(u.v_lastName, 1), '. a changé le status projet en : ', gds.v_name) AS message,
            ltc.dt_timeStamp AS timeStamp
            FROM log_ticketschange AS ltc
            INNER JOIN users AS u ON ltc.i_idUser = u.i_id
            INNER JOIN gd_status AS gds ON ltc.v_newValue = gds.i_id
            WHERE i_idTicket = ? AND v_action = 'upd_status'
            ORDER BY ltc.dt_timeStamp ASC`;
            const dbResSelectLogStatus = await app.executeQuery(app.db, querySelectLogUpdStatus, [req.params.id]);
            if (dbResSelectLogStatus[0]) {
                console.log(dbResSelectLogStatus[0]);
                res.sendStatus(500);
                return;
            }
            for (const elem of dbResSelectLogStatus[1]) {
                result.history.push(elem);
            }

            const querySelectLogPriority = `SELECT
            CONCAT('La priorité du ticket est passé en : ', gdtp.v_name) AS message,
            dt_timeStamp AS timeStamp
            FROM log_ticketschange AS ltc
            INNER JOIN gd_ticketpriority AS gdtp ON ltc.v_newValue = gdtp.i_id
            WHERE i_idTicket = ? AND v_action = 'upd_priority'`;
            const dbResSelectLogPriority = await app.executeQuery(app.db, querySelectLogPriority, [req.params.id]);
            if (dbResSelectLogPriority[0]) {
                console.log(dbResSelectLogPriority[0]);
                res.sendStatus(500);
                return;
            }
            for (const elem of dbResSelectLogPriority[1]) {
                result.history.push(elem);
            }



            result.history.sort(function (a, b) {
                return new Date(b.timeStamp) - new Date(a.timeStamp);
            });

            res.json(result);
        } catch (error) {
            console.log("ERROR: GET /api/ticket/:id/");
            console.log(error);
            res.sendStatus(500);
        }
    })
}

/**
 * @swagger
 * /ticket/:
 *   post:
 *     summary: Create new ticket. The user need to be authenticated.
 *     tags: [Ticket]
 *     parameters:
 *     - name: dvflCookie
 *       in: header
 *       description: Cookie of the user making the request
 *       required: true
 *       type: string
 *     requestBody:
 *       description: "Post all data for ticket creation (projectType)"
 *       required: true
 *       content:
 *         multipart/form-data:
 *          schema:
 *            type: object
 *            properties:
 *              projectType:
 *                type: "integer"
 *                format: "int64"
 *                required: true
 *              groupNumber:
 *                type: "integer"
 *                format: "int64"
 *              comment:
 *                type: "string"
 *                required: true
 *              filedata:
 *                 type: array
 *                 required: true
 *                 items:
 *                   type: string
 *                   format: binary
 *            example:
 *              projectType: 1
 *     responses:
 *       "200":
 *         description: "The id of the new ticket"
 *         content:
 *           application/json:
 *             schema:
 *               type: "object"
 *               properties:
 *                 id:
 *                   type: integer
 *                   format: int64
 *       400:
 *        description: "The body does not have all the necessary field"
 *       401:
 *        description: "The user is unauthenticated"
 *       500:
 *        description: "Internal error with the request"
 */

module.exports.post = async (app) => {
    app.post("/api/ticket/", async function (req, res) {
        try {
            // The body does not have all the necessary field
            if (!req.body.projectType || isNaN(req.body.projectType) || req.body.groupNumber ? isNaN(req.body.groupNumber) : false || !req.body.comment || !req.files) {
                res.sendStatus(400);
                return;
            }
            const dvflcookie = req.headers.dvflcookie;
            // unauthenticated user
            if (!dvflcookie) {
                res.sendStatus(401);
                return;
            }
            // if the user is not allowed
            const userId = app.cookiesList[req.headers.dvflcookie];
            if (!userId) {
                res.sendStatus(401);
                return;
            }
            const dbRes = await app.executeQuery(app.db, "INSERT INTO `printstickets` (`i_idUser`, `i_projecttype`, `i_groupNumber`,`i_priority`,`i_status`) VALUES (?, ?, ?, (SELECT i_id FROM `gd_ticketpriority` WHERE v_name = 'Normal'), (SELECT i_id FROM `gd_status` WHERE v_name = 'Ouvert'));", [userId, req.body.projectType, req.body.groupNumber]);
            if (dbRes[0]) {
                console.log(dbRes[0]);
                res.sendStatus(500);
                return;
            }
            const lastIdentityRes = await app.executeQuery(app.db, "SELECT LAST_INSERT_ID() AS 'id';", []);
            if (lastIdentityRes[0] || lastIdentityRes[1].length !== 1) {
                console.log(lastIdentityRes[0]);
                res.sendStatus(500);
                return;
            }

            //Detects if there are one or more files
            let files;
            if (req.files.filedata.length == null) files = [req.files.filedata];
            else files = req.files.filedata;

            //loop all files
            for (const file of files) {
                const fileNameSplited = file.name.split(".");
                if ((fileNameSplited[fileNameSplited.length - 1]).toLowerCase() === "stl") {
                    await new Promise(async (resolve) => {
                        const newFileName = makeid(10, file.name);
                        fs.copyFile(file.tempFilePath, __dirname + '/../../data/files/stl/' + newFileName, async (err) => {
                            if (err) throw err;
                            const resInsertFile = await app.executeQuery(app.db, "INSERT INTO `ticketfiles` (`i_idUser`, `i_idTicket`, `v_fileName`, `v_fileServerName`) VALUES (?, ?, ?, ?);", [userId, lastIdentityRes[1][0].id, file.name, newFileName]);
                            if (resInsertFile[0]) {
                                console.log(resInsertFile[0]);
                                res.sendStatus(500);
                                return;
                            }
                            resolve();
                        });
                    })
                }
                fs.unlinkSync(file.tempFilePath);
            }

            const resCommentInsert = await app.executeQuery(app.db, "INSERT INTO `ticketmessages` (`i_idUser`, `i_idTicket`, `v_content`) VALUES (?, ?, ?)", [userId, lastIdentityRes[1][0].id, req.body.comment]);
            if (resCommentInsert[0]) {
                console.log(resCommentInsert[0]);
                res.sendStatus(500);
                return;
            }

            res.json(lastIdentityRes[1][0])
        } catch (error) {
            console.log("ERROR: POST /api/ticket/");
            console.log(error);
            res.sendStatus(500);
        }
    })
}

/**
 * @swagger
 * /ticket/{id}:
 *   delete:
 *     summary: Delete the selected ticket.
 *     tags: [Ticket]
 *     parameters:
 *     - name: dvflCookie
 *       in: header
 *       description: Cookie of the user making the request
 *       required: true
 *       type: string
 *     - name: "id"
 *       in: "path"
 *       description: "Id of the ticket"
 *       required: true
 *       type: "integer"
 *       format: "int64"
 *     responses:
 *       "200":
 *         description: "The ticket is deleted."
 *       "204":
 *         description: "No data changed."
 *       401:
 *        description: "The user is unauthenticated"
 *       500:
 *        description: "Internal error with the request"
 */

module.exports.deleteWithId = async (app) => {
    app.delete("/api/ticket/:id", async function (req, res) {
        try {
            const dvflcookie = req.headers.dvflcookie;
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
            const resGetUserTicket = await app.executeQuery(app.db, "SELECT `i_idUser` AS 'id', `b_isDeleted` AS 'isDeleted' FROM `printstickets` WHERE i_id = ?", [req.params.id]);
            if (resGetUserTicket[0] || resGetUserTicket[1].length > 1) {
                console.log(resGetUserTicket[0]);
                res.sendStatus(500);
                for (const file of files) {
                    fs.unlinkSync(file.tempFilePath);
                }
                return;
            }
            if (resGetUserTicket[1].length < 1) {
                res.sendStatus(400);
                for (const file of files) {
                    fs.unlinkSync(file.tempFilePath);
                }
                return;
            }
            const idTicketUser = resGetUserTicket[1][0].id;
            if (idTicketUser != userIdAgent) {
                const authViewResult = await require("../../functions/userAuthorization").validateUserAuth(app, userIdAgent, "myFabAgent");
                if (!authViewResult) {
                    res.sendStatus(403);
                    return;
                }
            }

            const resDeleteTicket = await app.executeQuery(app.db, "UPDATE `printstickets` SET `b_isDeleted` = '1' WHERE `i_id` = ?;", [req.params.id]);
            if (resDeleteTicket[0]) {
                console.log(resDeleteTicket[0]);
                res.sendStatus(500);
                return;
            } else if (resDeleteTicket[0] || resDeleteTicket[1].changedRows !== 1) {
                res.sendStatus(204);
                return;
            }

            //return response
            res.sendStatus(200);
        } catch (error) {
            console.log("ERROR: DELETE /api/ticket/:id");
            console.log(error);
            res.sendStatus(500);
        }
    })
}

/**
 * @swagger
 * /ticket/{id}/setProjecttype:
 *   put:
 *     summary: Change projectType of the ticket. The user need to be a 'myFabAgent'
 *     tags: [Ticket]
 *     parameters:
 *     - name: dvflCookie
 *       in: header
 *       description: Cookie of the user making the request
 *       required: true
 *       type: string
 *     - name: "id"
 *       in: "path"
 *       description: "Id of the ticket"
 *       required: true
 *       type: "integer"
 *       format: "int64"
 *     requestBody:
 *       description: "Content for the new projecttype"
 *       required: true
 *       content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              projecttype:
 *                type: "integer"
 *                format: "int64"
 *     responses:
 *       200:
 *        description: "The projecttype has been changed"
 *       400:
 *        description: "Parameters or body not valid"
 *       401:
 *        description: "The user is unauthenticated"
 *       403:
 *        description: "The user is not allowed"
 *       500:
 *        description: "Internal error with the request"
 */

module.exports.putProjectType = async (app) => {
    app.put("/api/ticket/:id/setProjecttype", async function (req, res) {
        try {
            const dvflcookie = req.headers.dvflcookie;
            // unauthenticated user
            if (!dvflcookie) {
                res.sendStatus(401);
                return;
            }
            // parameters or body not valid
            if (!req.body.projecttype || isNaN(req.body.projecttype) || !req.params.id || isNaN(req.params.id)) {
                res.sendStatus(400);
                return;
            }
            // if the user is not allowed
            const userIdAgent = app.cookiesList[req.headers.dvflcookie];
            if (!userIdAgent) {
                res.sendStatus(401);
                return;
            }
            const authViewResult = await require("../../functions/userAuthorization").validateUserAuth(app, userIdAgent, "myFabAgent");
            if (!authViewResult) {
                res.sendStatus(403);
                return;
            }

            const querySelect = `SELECT 1
            FROM gd_ticketprojecttype
            WHERE i_id = ?`;
            const resTestIfRoleExist = await app.executeQuery(app.db, querySelect, [req.body.projecttype]);
            if (resTestIfRoleExist[0]) {
                console.log(resTestIfRoleExist[0]);
                res.sendStatus(500);
                return;
            }

            const queryUpdate = `UPDATE printstickets
            SET i_projecttype = ?
            WHERE i_id = ?`;
            const resUpdate = await app.executeQuery(app.db, queryUpdate, [req.body.projecttype, req.params.id]);
            if (resUpdate[0]) {
                console.log(resUpdate[0]);
                res.sendStatus(500);
                return;
            }
            // The response has no value
            if (resUpdate[1].changedRows < 1) {
                res.sendStatus(204);
                return;
            }

            const queryInsertLog = `INSERT INTO log_ticketschange
            (i_idUser, i_idTicket, v_action, v_newValue)
            VALUES (?, ?, 'upd_projType', ?)`;
            const resInsertLog = await app.executeQuery(app.db, queryInsertLog, [userIdAgent, req.params.id, req.body.projecttype]);
            if (resInsertLog[0]) {
                console.log(resInsertLog[0]);
                res.sendStatus(500);
                return;
            }

            res.json(resUpdate[1][0]);
        } catch (error) {
            console.log("ERROR: PUT /api/ticket/:id/setProjecttype/");
            console.log(error);
            res.sendStatus(500);
        }
    })
}

/**
 * @swagger
 * /ticket/{id}/setStatus:
 *   put:
 *     summary: Change projectType of the ticket. The user need to be a 'myFabAgent'
 *     tags: [Ticket]
 *     parameters:
 *     - name: dvflCookie
 *       in: header
 *       description: Cookie of the user making the request
 *       required: true
 *       type: string
 *     - name: "id"
 *       in: "path"
 *       description: "Id of the ticket"
 *       required: true
 *       type: "integer"
 *       format: "int64"
 *     - name: "idStatus"
 *       in: "query"
 *       description: "New status for the ticket"
 *       required: true
 *       type: "integer"
 *       format: "int64"
 *     responses:
 *       200:
 *        description: "The projecttype has been changed"
 *       204:
 *        description: "No tickets have been modified"
 *       400:
 *        description: "Parameters or body not valid"
 *       401:
 *        description: "The user is unauthenticated"
 *       403:
 *        description: "The user is not allowed"
 *       500:
 *        description: "Internal error with the request"
 */

module.exports.putNewStatus = async (app) => {
    app.put("/api/ticket/:id/setStatus", async function (req, res) {
        try {
            const dvflcookie = req.headers.dvflcookie;
            const idStatus = req.query.idStatus;
            const idTicket = req.params.id;
            // unauthenticated user
            if (!dvflcookie) {
                res.sendStatus(401);
                return;
            }
            // parameters or body not valid
            if (!idStatus || isNaN(idStatus) || !idTicket || isNaN(idTicket)) {
                res.sendStatus(400);
                return;
            }
            // if the user is not allowed
            const userIdAgent = app.cookiesList[req.headers.dvflcookie];
            if (!userIdAgent) {
                res.sendStatus(401);
                return;
            }
            const authViewResult = await require("../../functions/userAuthorization").validateUserAuth(app, userIdAgent, "myFabAgent");
            if (!authViewResult) {
                res.sendStatus(403);
                return;
            }

            const resUpdate = await app.executeQuery(app.db, "UPDATE `printstickets` SET `i_status` = ? WHERE `i_id` = ?", [idStatus, idTicket]);
            if (resUpdate[0]) {
                console.log(resUpdate[0]);
                res.sendStatus(500);
                return;
            }
            // The response has no value
            if (resUpdate[1].changedRows < 1) {
                res.sendStatus(204);
                return;
            }

            const queryInsertLog = `INSERT INTO log_ticketschange
            (i_idUser, i_idTicket, v_action, v_newValue)
            VALUES (?, ?, 'upd_status', ?)`;
            const resInsertLog = await app.executeQuery(app.db, queryInsertLog, [userIdAgent, req.params.id, idStatus]);
            if (resInsertLog[0]) {
                console.log(resInsertLog[0]);
                res.sendStatus(500);
                return;
            }

            res.sendStatus(200);
        } catch (error) {
            console.log("ERROR: PUT /api/ticket/:id/setStatus");
            console.log(error);
            res.sendStatus(500);
        }
    })
}