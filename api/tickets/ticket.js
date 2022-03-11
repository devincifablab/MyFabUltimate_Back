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

module.exports.getTicketAllFromUser = getTicketAllFromUser;
async function getTicketAllFromUser(data) {
    //The user is unauthenticated
    const userIdAgent = data.userId;
    if (!userIdAgent) {
        return {
            type: "code",
            code: 401
        }
    }
    const query = `SELECT pt.i_id AS 'id', CONCAT(u.v_firstName, ' ', LEFT(u.v_lastName, 1), '.') AS 'userName',
             tpt.v_name AS 'projectType', u.v_title AS 'title' ,
             pt.dt_creationdate AS 'creationDate', pt.dt_modificationdate AS 'modificationDate',
             stat.v_name AS 'statusName', stat.v_color AS 'statusColor', tp.v_name AS 'priorityName', tp.v_color AS 'priorityColor' 
             FROM printstickets AS pt 
             INNER JOIN users AS u ON pt.i_idUser = u.i_id 
             INNER JOIN gd_ticketprojecttype AS tpt ON pt.i_projecttype = tpt.i_id 
             INNER JOIN gd_ticketpriority AS tp ON pt.i_priority = tp.i_id
             LEFT OUTER JOIN gd_status AS stat ON pt.i_status = stat.i_id
             WHERE pt.i_idUser = ? AND pt.b_isDeleted = 0 ORDER BY pt.i_id ASC`;

    const dbRes = await data.app.executeQuery(data.app.db, query, [userIdAgent]);
    if (dbRes[0]) {
        console.log(dbRes[0]);
        return {
            type: "code",
            code: 500
        }
    }
    return {
        type: "json",
        code: 200,
        json: dbRes[1]
    }
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

module.exports.getTicketAll = getTicketAll;
async function getTicketAll(data) {
    const userIdAgent = data.userId;
    if (!userIdAgent) {
        return {
            type: "code",
            code: 401
        }
    }
    const authViewResult = await data.userAuthorization.validateUserAuth(data.app, userIdAgent, "myFabAgent");
    if (!authViewResult) {
        return {
            type: "code",
            code: 403
        }
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
             LEFT OUTER JOIN gd_status AS stat ON pt.i_status = stat.i_id
             WHERE pt.b_isDeleted = 0 ORDER BY pt.i_id ASC`

    const dbRes = await data.app.executeQuery(data.app.db, query, []);
    if (dbRes[0]) {
        console.log(dbRes[0]);
        return {
            type: "code",
            code: 500
        }
    }
    return {
        type: "json",
        code: 200,
        json: dbRes[1]
    }
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

module.exports.getTicketById = getTicketById;
async function getTicketById(data) {
    // parameters or body not valid
    if (!data.params || !data.params.id || isNaN(data.params.id)) {
        return {
            type: "code",
            code: 400
        }
    }
    // unauthenticated user
    const userIdAgent = data.userId;
    if (!userIdAgent) {
        return {
            type: "code",
            code: 401
        }
    }
    const querySelectUser = `SELECT i_idUser AS 'id'
                        FROM printstickets
                        WHERE i_id = ? AND b_isDeleted = 0`;
    const resGetUserTicket = await data.app.executeQuery(data.app.db, querySelectUser, [data.params.id]);
    if (resGetUserTicket[0]) {
        console.log(resGetUserTicket[0]);
        return {
            type: "code",
            code: 500
        }
    } else if (resGetUserTicket[1].length !== 1) {
        return {
            type: "code",
            code: 204
        }
    }
    const idTicketUser = resGetUserTicket[1][0].id;
    if (idTicketUser != userIdAgent) {
        const authViewResult = await data.userAuthorization.validateUserAuth(data.app, userIdAgent, "myFabAgent");
        if (!authViewResult) {
            return {
                type: "code",
                code: 403
            }
        }
    }
    const querySelect = `SELECT pt.i_id AS 'id', CONCAT(u.v_firstName, ' ', LEFT(u.v_lastName, 1), '.') AS 'userName',
             tpt.v_name AS 'projectType', u.v_title AS 'title' , u.v_email AS 'email' , pt.i_groupNumber AS 'groupNumber' ,
             pt.dt_creationdate AS 'creationDate', pt.dt_modificationdate AS 'modificationDate',
             stat.v_name AS 'statusName', stat.v_color AS 'statusColor',
             tp.v_name AS 'priorityName', tp.v_color AS 'priorityColor' 
             FROM printstickets AS pt 
             INNER JOIN users AS u ON pt.i_idUser = u.i_id 
             INNER JOIN gd_ticketprojecttype AS tpt ON pt.i_projecttype = tpt.i_id 
             INNER JOIN gd_ticketpriority AS tp ON pt.i_priority = tp.i_id
             LEFT OUTER JOIN gd_status AS stat ON pt.i_status = stat.i_id
             WHERE pt.i_id = ? AND pt.b_isDeleted = 0`;
    const dbRes = await data.app.executeQuery(data.app.db, querySelect, [data.params.id]);
    if (dbRes[0]) {
        console.log(dbRes[0]);
        return {
            type: "code",
            code: 500
        }
    }
    if (dbRes[1] == null || dbRes[1].length !== 1) {
        return {
            type: "code",
            code: 204
        }
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
    const dbResSelectLogUpdProjectType = await data.app.executeQuery(data.app.db, querySelectLogUpdProjectType, [data.params.id]);
    if (dbResSelectLogUpdProjectType[0]) {
        console.log(dbResSelectLogUpdProjectType[0]);
        return {
            type: "code",
            code: 500
        }
    }
    result.history = dbResSelectLogUpdProjectType[1];

    const querySelectLogUpdStatus = `SELECT
            CONCAT(u.v_firstName, ' ', LEFT(u.v_lastName, 1), '. a changé le status projet en : ', gds.v_name) AS message,
            ltc.dt_timeStamp AS timeStamp
            FROM log_ticketschange AS ltc
            INNER JOIN users AS u ON ltc.i_idUser = u.i_id
            LEFT OUTER JOIN gd_status AS gds ON ltc.v_newValue = gds.i_id
            WHERE i_idTicket = ? AND v_action = 'upd_status'
            ORDER BY ltc.dt_timeStamp ASC`;
    const dbResSelectLogStatus = await data.app.executeQuery(data.app.db, querySelectLogUpdStatus, [data.params.id]);
    if (dbResSelectLogStatus[0]) {
        console.log(dbResSelectLogStatus[0]);
        return {
            type: "code",
            code: 500
        }
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
    const dbResSelectLogPriority = await data.app.executeQuery(data.app.db, querySelectLogPriority, [data.params.id]);
    if (dbResSelectLogPriority[0]) {
        console.log(dbResSelectLogPriority[0]);
        return {
            type: "code",
            code: 500
        }
    }
    for (const elem of dbResSelectLogPriority[1]) {
        result.history.push(elem);
    }

    result.history.sort(function (a, b) {
        return new Date(b.timeStamp) - new Date(a.timeStamp);
    });

    return {
        type: "json",
        code: 200,
        json: result
    }
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

module.exports.postTicket = postTicket;
async function postTicket(data) {
    // The body does not have all the necessary field
    if (!data.body || !data.body.projectType || isNaN(data.body.projectType) || isNaN(data.body && data.body.groupNumber ? data.body.groupNumber : 1) || !data.body.comment) {
        return {
            type: "code",
            code: 400
        }
    }
    const userId = data.userId;
    if (!userId) {
        return {
            type: "code",
            code: 401
        }
    }
    const querySelectProjectType = `SELECT 1 FROM gd_ticketprojecttype WHERE i_id = ?`;
    const resSelectProjectType = await data.app.executeQuery(data.app.db, querySelectProjectType, [data.body.projectType]);
    if (resSelectProjectType[0]) {
        console.log(resSelectProjectType[0]);
        return {
            type: "code",
            code: 500
        }
    } else if (resSelectProjectType[1].length == 0) {
        return {
            type: "code",
            code: 400
        }
    }

    const queryCreateTicket = `INSERT INTO printstickets (i_idUser, i_projecttype, i_groupNumber, i_priority, i_status)
                            VALUES (?, ?, ?, (SELECT i_id FROM gd_ticketpriority WHERE v_name = 'Normal'), (SELECT i_id FROM gd_status WHERE v_name = 'Ouvert'));`;
    const dbRes = await data.app.executeQuery(data.app.db, queryCreateTicket, [userId, data.body.projectType, data.body.groupNumber]);
    if (dbRes[0]) {
        console.log(dbRes[0]);
        return {
            type: "code",
            code: 500
        }
    }
    const querySelectLastId = `SELECT LAST_INSERT_ID() AS 'id';`;
    const lastIdentityRes = await data.app.executeQuery(data.app.db, querySelectLastId, []);
    if (lastIdentityRes[0] || lastIdentityRes[1].length !== 1) {
        console.log(lastIdentityRes[0]);
        return {
            type: "code",
            code: 500
        }
    }

    //Detects if there are one or more files
    let files;
    if (data.files == null) files = [];
    else if (data.files.filedata.length == null) files = [data.files.filedata];
    else files = data.files.filedata;

    //loop all files
    for (const file of files) {
        const fileNameSplited = file.name.split(".");
        if ((fileNameSplited[fileNameSplited.length - 1]).toLowerCase() === "stl") {
            await new Promise(async (resolve) => {
                const newFileName = makeid(10, file.name);
                fs.copyFile(file.tempFilePath, __dirname + '/../../data/files/stl/' + newFileName, async (err) => {
                    if (err) throw err;
                    const queryInsertFile = `INSERT INTO ticketfiles (i_idUser, i_idTicket, v_fileName, v_fileServerName)
                                            VALUES (?, ?, ?, ?);`;
                    const resInsertFile = await data.app.executeQuery(data.app.db, queryInsertFile, [userId, lastIdentityRes[1][0].id, file.name, newFileName]);
                    if (resInsertFile[0]) {
                        console.log(resInsertFile[0]);
                        return {
                            type: "code",
                            code: 500
                        }
                    }
                    resolve();
                });
            })
        }
        fs.unlinkSync(file.tempFilePath);
    }

    const queryInsert = `INSERT INTO ticketmessages (i_idUser, i_idTicket, v_content)
                        VALUES (?, ?, ?)`;
    const resCommentInsert = await data.app.executeQuery(data.app.db, queryInsert, [userId, lastIdentityRes[1][0].id, data.body.comment]);
    if (resCommentInsert[0]) {
        console.log(resCommentInsert[0]);
        return {
            type: "code",
            code: 500
        }
    }
    return {
        type: "json",
        code: 200,
        json: lastIdentityRes[1][0]
    }
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
 *       400:
 *        description: "The ticket is not found"
 *       401:
 *        description: "The user is unauthenticated"
 *       500:
 *        description: "Internal error with the request"
 */

module.exports.deleteTicketWithId = deleteTicketWithId;
async function deleteTicketWithId(data) {
    // parameters or body not valid
    if (!data.params || !data.params.id) {
        return {
            type: "code",
            code: 400
        }
    }
    // if the user is not allowed
    const userIdAgent = data.userId;
    if (!userIdAgent) {
        return {
            type: "code",
            code: 401
        }
    }
    const querySelect = `SELECT i_idUser AS 'id',
                                b_isDeleted AS 'isDeleted'
                                FROM printstickets
                                WHERE i_id = ?`;
    const resGetUserTicket = await data.app.executeQuery(data.app.db, querySelect, [data.params.id]);
    if (resGetUserTicket[0] || resGetUserTicket[1].length > 1) {
        console.log(resGetUserTicket[0]);
        return {
            type: "code",
            code: 500
        }
    }
    if (resGetUserTicket[1].length < 1) {
        return {
            type: "code",
            code: 400
        }
    }
    const idTicketUser = resGetUserTicket[1][0].id;
    if (idTicketUser != userIdAgent) {
        const authViewResult = await data.userAuthorization.validateUserAuth(data.app, userIdAgent, "myFabAgent");
        if (!authViewResult) {
            return {
                type: "code",
                code: 403
            }
        }
    }

    const queryUpdate = `UPDATE printstickets
                        SET b_isDeleted = '1'
                        WHERE i_id = ?;`;
    const resDeleteTicket = await data.app.executeQuery(data.app.db, queryUpdate, [data.params.id]);
    if (resDeleteTicket[0]) {
        console.log(resDeleteTicket[0]);
        return {
            type: "code",
            code: 500
        }
    } else if (resDeleteTicket[0] || resDeleteTicket[1].changedRows !== 1) {
        return {
            type: "code",
            code: 204
        }
    }

    //return response
    return {
        type: "code",
        code: 200
    }
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
 *     - name: "projecttype"
 *       in: "query"
 *       description: "New status for the ticket"
 *       required: true
 *       type: "integer"
 *       format: "int64"
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


module.exports.putTicketNewProjectType = putTicketNewProjectType;
async function putTicketNewProjectType(data) {
    // parameters or body not valid
    if (!data.query.projecttype || isNaN(data.query.projecttype) || !data.params.id || isNaN(data.params.id)) {
        return {
            type: "code",
            code: 400
        }
    }
    // if the user is not allowed
    const userIdAgent = data.userId;
    if (!userIdAgent) {
        return {
            type: "code",
            code: 401
        }
    }
    const authViewResult = await data.userAuthorization.validateUserAuth(data.app, userIdAgent, "myFabAgent");
    if (!authViewResult) {
        return {
            type: "code",
            code: 403
        }
    }

    const querySelect = `SELECT 1
            FROM gd_ticketprojecttype
            WHERE i_id = ?`;
    const resTestIfRoleExist = await data.app.executeQuery(data.app.db, querySelect, [data.query.projecttype]);
    if (resTestIfRoleExist[0]) {
        console.log(resTestIfRoleExist[0]);
        return {
            type: "code",
            code: 500
        }
    }

    const queryUpdate = `UPDATE printstickets
            SET i_projecttype = ?
            WHERE i_id = ?`;
    const resUpdate = await data.app.executeQuery(data.app.db, queryUpdate, [data.query.projecttype, data.params.id]);
    if (resUpdate[0]) {
        console.log(resUpdate[0]);
        return {
            type: "code",
            code: 500
        }
    }
    // The response has no value
    if (resUpdate[1].changedRows < 1) {
        return {
            type: "code",
            code: 204
        }
    }

    const queryInsertLog = `INSERT INTO log_ticketschange
            (i_idUser, i_idTicket, v_action, v_newValue)
            VALUES (?, ?, 'upd_projType', ?)`;
    const resInsertLog = await data.app.executeQuery(data.app.db, queryInsertLog, [userIdAgent, data.params.id, data.query.projecttype]);
    if (resInsertLog[0]) {
        console.log(resInsertLog[0]);
        return {
            type: "code",
            code: 500
        }
    }

    return {
        type: "code",
        code: 200
    }
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

module.exports.putTicketNewStatus = putTicketNewStatus;
async function putTicketNewStatus(data) {
    const idStatus = data.query.idStatus;
    const idTicket = data.params.id;
    // parameters or body not valid
    if (!idStatus || isNaN(idStatus) || !idTicket || isNaN(idTicket)) {
        return {
            type: "code",
            code: 400
        }
    }
    // if the user is not allowed
    const userIdAgent = data.userId;
    if (!userIdAgent) {
        return {
            type: "code",
            code: 401
        }
    }
    const authViewResult = await data.userAuthorization.validateUserAuth(data.app, userIdAgent, "myFabAgent");
    if (!authViewResult) {
        return {
            type: "code",
            code: 403
        }
    }

    const queryUpdate = `UPDATE printstickets 
                        SET i_status = ?
                        WHERE i_id = ?`;
    const resUpdate = await data.app.executeQuery(data.app.db, queryUpdate, [idStatus, idTicket]);
    if (resUpdate[0]) {
        console.log(resUpdate[0]);
        return {
            type: "code",
            code: 500
        }
    }
    // The response has no value
    if (resUpdate[1].changedRows < 1) {
        return {
            type: "code",
            code: 204
        }
    }

    const queryInsertLog = `INSERT INTO log_ticketschange
            (i_idUser, i_idTicket, v_action, v_newValue)
            VALUES (?, ?, 'upd_status', ?)`;
    const resInsertLog = await data.app.executeQuery(data.app.db, queryInsertLog, [userIdAgent, idTicket, idStatus]);
    if (resInsertLog[0]) {
        console.log(resInsertLog[0]);
        return {
            type: "code",
            code: 500
        }
    }

    return {
        type: "code",
        code: 200
    }
}


module.exports.startApi = startApi;
async function startApi(app) {
    app.get("/api/ticket/me/", async function (req, res) {
        try {
            const data = await require("../../functions/apiActions").prepareData(app, req, res);
            const result = await getTicketAllFromUser(data);
            await require("../../functions/apiActions").sendResponse(req, res, result);
        } catch (error) {
            console.log("ERROR: GET /api/ticket/me/");
            console.log(error);
            res.sendStatus(500);
        }
    })

    app.get("/api/ticket/", async function (req, res) {
        try {
            const data = await require("../../functions/apiActions").prepareData(app, req, res);
            const result = await getTicketAll(data);
            await require("../../functions/apiActions").sendResponse(req, res, result);
        } catch (error) {
            console.log("ERROR: GET /api/ticket/");
            console.log(error);
            res.sendStatus(500);
        }
    })

    app.get("/api/ticket/:id", async function (req, res) {
        try {
            const data = await require("../../functions/apiActions").prepareData(app, req, res);
            const result = await getTicketById(data);
            await require("../../functions/apiActions").sendResponse(req, res, result);
        } catch (error) {
            console.log("ERROR: GET /api/ticket/:id/");
            console.log(error);
            res.sendStatus(500);
        }
    })

    app.post("/api/ticket/", async function (req, res) {
        try {
            const data = await require("../../functions/apiActions").prepareData(app, req, res);
            const result = await postTicket(data);
            await require("../../functions/apiActions").sendResponse(req, res, result);
        } catch (error) {
            console.log("ERROR: POST /api/ticket/");
            console.log(error);
            res.sendStatus(500);
        }
    })

    app.delete("/api/ticket/:id", async function (req, res) {
        try {
            const data = await require("../../functions/apiActions").prepareData(app, req, res);
            const result = await deleteTicketWithId(data);
            await require("../../functions/apiActions").sendResponse(req, res, result);
        } catch (error) {
            console.log("ERROR: DELETE /api/ticket/:id");
            console.log(error);
            res.sendStatus(500);
        }
    })

    app.put("/api/ticket/:id/setProjecttype", async function (req, res) {
        try {
            const data = await require("../../functions/apiActions").prepareData(app, req, res);
            const result = await putTicketNewProjectType(data);
            await require("../../functions/apiActions").sendResponse(req, res, result);
        } catch (error) {
            console.log("ERROR: PUT /api/ticket/:id/setProjecttype/");
            console.log(error);
            res.sendStatus(500);
        }
    })

    app.put("/api/ticket/:id/setStatus", async function (req, res) {
        try {
            const data = await require("../../functions/apiActions").prepareData(app, req, res);
            const result = await putTicketNewStatus(data);
            await require("../../functions/apiActions").sendResponse(req, res, result);
        } catch (error) {
            console.log("ERROR: PUT /api/ticket/:id/setStatus");
            console.log(error);
            res.sendStatus(500);
        }
    })
}