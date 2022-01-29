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
 * /ticket/{id}/file:
 *   get:
 *     summary: Get the list of files from a ticket 
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
 *         description: Get the list of files from a ticket 
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: "integer"
 *                   format: "int64"
 *                 filename:
 *                   type: string
 *                 comment:
 *                   type: string
 *                 isValid:
 *                   type: boolean
 *                 creationDate:
 *                   type: "string"
 *                   format: "date-time"
 *                 modificationDate:
 *                   type: "string"
 *                   format: "date-time"
 *       400:
 *        description: "The body does not have all the necessary field"
 *       401:
 *        description: "The user is unauthenticated"
 *       403:
 *        description: "The user is not allowed"
 *       500:
 *        description: "Internal error with the request"
 */

module.exports.getListOfFile = async (app) => {
    app.get('/api/ticket/:id/file', async (req, res) => {
        try {
            const dvflcookie = req.headers.dvflcookie;
            const idTicket = req.params.id;
            // unauthenticated user
            if (!dvflcookie) {
                res.sendStatus(401);
                return;
            }
            const userIdAgent = app.cookiesList[req.headers.dvflcookie];

            const resGetUserTicket = await app.executeQuery(app.db, "SELECT `i_idUser` AS 'id' FROM `printstickets` WHERE i_id = ?", [idTicket]);
            if (resGetUserTicket[0] || resGetUserTicket[1].length !== 1) {
                console.log(resGetUserTicket[0]);
                res.sendStatus(500);
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

            const dbRes = await app.executeQuery(app.db, "SELECT `i_id` AS 'id', `v_fileName` AS 'filename', `v_comment` AS 'comment', `b_valid` AS 'isValid', `dt_creationDate` AS 'creationDate', `dt_modificationDate` AS 'modificationDate' FROM `ticketfiles` WHERE `i_idTicket` = ?", [idTicket]);
            if (dbRes[0]) {
                console.log(dbRes[0]);
                res.sendStatus(500);
                return;
            }
            res.json(dbRes[1])
        } catch (err) {
            console.log("ERROR: GET /api/ticket/:id/file/");
            console.log(err);
            res.sendStatus(500);
        }
    });
}

/**
 * @swagger
 * /file/{id}:
 *   get:
 *     summary: Download a file from a ticket
 *     tags: [Ticket]
 *     parameters:
 *     - name: dvflCookie
 *       in: header
 *       description: Cookie of the user making the request. The user need to be the ticket owner or an agent.
 *       required: true
 *       type: string
 *     - name: "id"
 *       in: "path"
 *       description: "Id of the ticket"
 *       required: true
 *       type: "integer"
 *       format: "int64"
 *     responses:
 *       200:
 *         description: "Get a file from a ticket"
 *       400:
 *        description: "The body does not have all the necessary field"
 *       401:
 *        description: "The user is unauthenticated"
 *       403:
 *        description: "The user is not allowed"
 *       500:
 *        description: "Internal error with the request"
 */

module.exports.getOneFile = async (app) => {
    app.get('/api/file/:id/', async (req, res) => {
        try {
            // The body does not have all the necessary field
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
            const resGetUserTicket = await app.executeQuery(app.db, "SELECT pt.i_idUser AS 'id', tf.v_fileServerName AS 'fileServerName', tf.v_fileName AS 'fileName' FROM `ticketfiles` AS tf INNER JOIN `printstickets` AS pt ON tf.i_idTicket = pt.i_id WHERE tf.i_id = ?", [req.params.id]);
            if (resGetUserTicket[0] || resGetUserTicket[1].length > 1) {
                console.log(resGetUserTicket[0]);
                res.sendStatus(500);
                return;
            }
            if (resGetUserTicket[1].length < 1) {
                res.sendStatus(400);
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
            if (fs.existsSync(__dirname + "/../../data/files/stl/" + resGetUserTicket[1][0].fileServerName)) res.download(__dirname + "/../../data/files/stl/" + resGetUserTicket[1][0].fileServerName, resGetUserTicket[1][0].fileName);
            else res.sendStatus(204);
        } catch (err) {
            console.log("ERROR: GET /api/file/:id/");
            console.log(err);
            res.sendStatus(500);
        }
    });
}

/**
 * @swagger
 * /ticket/{id}/file:
 *   post:
 *     summary: Add a new file to an existing ticket
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
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               filename:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       "200":
 *         description: "Get all messages from a ticket"
 *         content:
 *           application/json:
 *             schema:
 *               type: "array"
 *               items:
 *                 $ref: '#/components/schemas/TicketMessage'
 *       400:
 *        description: "The body does not have all the necessary field"
 *       401:
 *        description: "The user is unauthenticated"
 *       403:
 *        description: "The user is not allowed"
 *       500:
 *        description: "Internal error with the request"
 */

module.exports.post = async (app) => {
    app.post('/api/ticket/:id/file/', async (req, res) => {
        try {
            // The body does not have all the necessary field
            if (!req.files) {
                res.sendStatus(400);
                return;
            }

            //Detects if there are one or more files
            let files;
            if (req.files.filename.length == null) files = [req.files.filename];
            else files = req.files.filename;

            // The body does not have all the necessary field
            if (!req.params.id || isNaN(req.params.id)) {
                res.sendStatus(400);
                for (const file of files) {
                    fs.unlinkSync(file.tempFilePath);
                }
                return;
            }

            // if the user is not allowed
            const userIdAgent = app.cookiesList[req.headers.dvflcookie];
            if (!userIdAgent) {
                res.sendStatus(401);
                for (const file of files) {
                    fs.unlinkSync(file.tempFilePath);
                }
                return;
            }
            const resGetUserTicket = await app.executeQuery(app.db, "SELECT `i_idUser` AS 'id' FROM `printstickets` WHERE i_id = ?", [req.params.id]);
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
                    for (const file of files) {
                        fs.unlinkSync(file.tempFilePath);
                    }
                    return;
                }
            }

            //loop all files
            for (const file of files) {
                const fileNameSplited = file.name.split(".");
                if ((fileNameSplited[fileNameSplited.length - 1]).toLowerCase() === "stl") {
                    await new Promise(async (resolve) => {
                        const newFileName = makeid(10, file.name);
                        fs.copyFile(file.tempFilePath, __dirname + '/../../data/files/stl/' + newFileName, async (err) => {
                            if (err) throw err;
                            const resInsertFile = await app.executeQuery(app.db, "INSERT INTO `ticketfiles` (`i_idUser`, `i_idTicket`, `v_fileName`, `v_fileServerName`) VALUES (?, ?, ?, ?);", [userIdAgent, req.params.id, file.name, newFileName]);
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

            //return response
            res.sendStatus(200);
        } catch (err) {
            console.log("ERROR: POST /api/ticket/:id/file/");
            console.log(err);
            res.sendStatus(500);
        }
    });
}

/**
 * @swagger
 * /file/{id}:
 *   put:
 *     summary: Change comment and isValid for a ticket
 *     tags: [Ticket]
 *     parameters:
 *     - name: dvflCookie
 *       in: header
 *       description: Cookie of the user making the request
 *       required: true
 *       type: string
 *     - name: "id"
 *       in: "path"
 *       description: "Id of the file"
 *       required: true
 *       type: "integer"
 *       format: "int64"
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment:
 *                 type: string
 *               isValid:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: "Modification saved successfully"
 *       400:
 *        description: "The body does not have all the necessary field"
 *       401:
 *        description: "The user is unauthenticated"
 *       403:
 *        description: "The user is not allowed"
 *       500:
 *        description: "Internal error with the request"
 */

module.exports.put = async (app) => {
    app.put('/api/file/:id/', async (req, res) => {
        try {
            const dvflcookie = req.headers.dvflcookie;
            // unauthenticated user
            if (!dvflcookie) {
                res.sendStatus(401);
                return;
            }
            if (!req.params.id, !req.body.comment, typeof req.body.isValid != "boolean") {
                res.sendStatus(400);
                return;
            }
            const idTicket = req.params.id;
            const userIdAgent = app.cookiesList[dvflcookie];

            const authViewResult = await require("../../functions/userAuthorization").validateUserAuth(app, userIdAgent, "myFabAgent");
            if (!authViewResult) {
                res.sendStatus(403);
                return;
            }

            const resUpdateFile = await app.executeQuery(app.db, "UPDATE `ticketfiles` SET `v_comment` = ?, `b_valid` = ? WHERE `i_id` = ?", [req.body.comment, req.body.isValid, idTicket]);
            if (resUpdateFile[0]) {
                console.log(resUpdateFile[0]);
                res.sendStatus(500);
                return;
            } else if (resUpdateFile[0] || resUpdateFile[1].affectedRows !== 1) {
                res.sendStatus(204);
                return;
            }

            //return response
            res.sendStatus(200);
        } catch (err) {
            console.log("ERROR: PUT /api/file/:id/");
            console.log(err);
            res.sendStatus(500);
        }
    });
}