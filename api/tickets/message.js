/**
 * @swagger
 * components:
 *   schemas:
 *     TicketMessage:
 *       type: object
 *       properties:
 *         userName:
 *           type: "string"
 *           description: Name of the user
 *         content:
 *           type: "string"
 *           description: Content of the message
 *         creationDate:
 *           type: "string"
 *           format: "date-time"
 *           description: Date when the user post the message
 *       example:
 *         userName: John D.
 *         content: Hello world
 *         creationDate: 2021-12-16T09:31:38.000Z
 */

/**
 * @swagger
 * /ticket/{id}/message:
 *   get:
 *     summary: Get all messages from a ticket. The user need to be a 'myFabAgent' or the ticket owner
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

module.exports.get = async (app) => {
    app.get("/api/ticket/:id/message/", async function (req, res) {
        try {
            const dvflcookie = req.headers.dvflcookie;
            // unauthenticated user
            if (!dvflcookie) {
                res.sendStatus(401);
                return;
            }
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
            const resGetUserTicket = await app.executeQuery(app.db, "SELECT `i_idUser` AS 'id' FROM `printstickets` WHERE i_id = ?", [req.params.id]);
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
            const dbRes = await app.executeQuery(app.db, "SELECT CONCAT(u.v_firstName, ' ', LEFT(u.v_lastName, 1), '.') AS 'userName', tm.v_content AS 'content', tm.dt_creationDate AS 'creationDate' FROM `ticketmessages` AS tm INNER JOIN users AS u ON tm.i_idUser = u.i_id WHERE i_idTicket = ? ORDER BY creationDate DESC", [req.params.id]);
            if (dbRes[0]) {
                console.log(dbRes[0]);
                res.sendStatus(500);
                return;
            }
            res.json(dbRes[1])
        } catch (error) {
            console.log("ERROR: GET /api/ticket/:id/message/");
            console.log(error);
        }
    })
}

/**
 * @swagger
 * /ticket/{id}/message:
 *   post:
 *     summary: Get all messages from a ticket. The user need to be a 'myFabAgent' or the ticket owner
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
 *       description: "Post all data for post new message"
 *       required: true
 *       content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              content:
 *                type: "string"
 *            example:
 *              content: hello world
 *     responses:
 *       200:
 *         description: "The message is posted"
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
    app.post("/api/ticket/:id/message/", async function (req, res) {
        try {
            const dvflcookie = req.headers.dvflcookie;
            // unauthenticated user
            if (!dvflcookie) {
                res.sendStatus(401);
                return;
            }
            // The body does not have all the necessary field
            if (!req.params.id || isNaN(req.params.id) || !req.body.content) {
                res.sendStatus(400);
                return;
            }
            // if the user is not allowed
            const userIdAgent = app.cookiesList[req.headers.dvflcookie];
            const resGetUserTicket = await app.executeQuery(app.db, "SELECT `i_idUser` AS 'id' FROM `printstickets` WHERE i_id = ?", [req.params.id]);
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

            const dbRes = await app.executeQuery(app.db, "INSERT INTO `ticketmessages` (`i_idUser`, `i_idTicket`, `v_content`) VALUES (?, ?, ?)", [userIdAgent, req.params.id, req.body.content]);
            if (dbRes[0]) {
                console.log(dbRes[0]);
                res.sendStatus(500);
                return;
            }
            res.sendStatus(200);
        } catch (error) {
            console.log("ERROR: POST /api/ticket/");
            console.log(error);
        }
    })
}