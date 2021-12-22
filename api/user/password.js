const sha256 = require("sha256");


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
            const userTarget = 1; // Set to 1 temporarily
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
            // if the user is not allowed
            if (false) {
                res.sendStatus(403);
                return;
            }
            // The body does not have all the necessary field or id is not a number
            if (isNaN(idUserTarget) || !req.body.actualPassword || !req.body.newPassword) {
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
        }
    })
}