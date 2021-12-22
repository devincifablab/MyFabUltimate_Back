/**
 * @swagger
 * components:
 *   schemas:
 *     Role:
 *       type: object
 *       properties:
 *         id:
 *           type: "integer"
 *           format: "int64"
 *           description: Id of the role
 *         name:
 *           type: "string"
 *           description: Name of the role
 *         description:
 *           type: "string"
 *           description: Description of the role
 *         color:
 *           type: "string"
 *           description: Color of the role
 *       example:
 *         id: 212
 *         name: Agent
 *         description: Agent qui permet de voir et de réaliser les tickets de MyFab
 *         color: F7FA31
 */

/**
 * @swagger
 * tags:
 *   name: Role
 *   description: Everything about roles and permissions
 */

/**
 * @swagger
 * /user/{idUser}/role/:
 *   get:
 *     summary: See all role for a user
 *     tags: [Role]
 *     parameters:
 *     - name: dvflCookie
 *       in: header
 *       description: Cookie of the user making the request
 *       required: true
 *       type: string
 *     - name: "idUser"
 *       in: "path"
 *       description: "Id of user"
 *       required: true
 *       type: "integer"
 *       format: "int64"
 *     responses:
 *       200:
 *         description: "The role list is send"
 *         content:
 *           application/json:
 *             schema:
 *               type: "array"
 *               items:
 *                 $ref: '#/components/schemas/Role'
 *       204:
 *         description: "The target user is not unknown"
 *       400:
 *        description: "The body does not have all the necessary field"
 *       401:
 *        description: "The user making the request is not authorized"
 *       403:
 *        description: "This correlation already exist"
 *       500:
 *        description: "Internal error with the request or unknown role or user"
 */

module.exports.get = async (app) => {
    app.get("/api/user/:idUser/role/", async function (req, res) {
        try {
            // The body does not have all the necessary field
            if (!req.params.idUser || !req.headers.dvflcookie || isNaN(req.params.idUser)) {
                res.sendStatus(400);
                return;
            }
            const userId = req.params.idUser;

            const dvflcookie = req.headers.dvflcookie;

            const resTestIfCorrelationExist = await app.executeQuery(app.db, "SELECT gd_roles.i_id AS 'id', gd_roles.v_name AS 'name', gd_roles.v_description AS 'description',gd_roles.v_color AS 'color' FROM `rolescorrelation` INNER JOIN gd_roles ON rolescorrelation.i_idRole = gd_roles.i_id WHERE rolescorrelation.i_idUser = ?", [userId]);
            // Error with the sql request
            if (resTestIfCorrelationExist[0]) {
                console.log(resTestIfCorrelationExist[0]);
                res.sendStatus(500);
                return;
            }

            res.json(resTestIfCorrelationExist[1]);
        } catch (error) {
            console.log("ERROR: POST /user/:idUser/role/:idRole/");
            console.log(error);
        }
    })
}


/**
 * @swagger
 * /user/role/:
 *   get:
 *     summary: See all role for actual user
 *     tags: [Role]
 *     parameters:
 *     - name: dvflCookie
 *       in: header
 *       description: Cookie of the user making the request
 *       required: true
 *       type: string
 *     responses:
 *       200:
 *         description: "The role list is send"
 *         content:
 *           application/json:
 *             schema:
 *               type: "array"
 *               items:
 *                 $ref: '#/components/schemas/Role'
 *       204:
 *         description: "The target user is not unknown"
 *       400:
 *        description: "The body does not have all the necessary field"
 *       401:
 *        description: "The user making the request is not authorized"
 *       403:
 *        description: "This correlation already exist"
 *       500:
 *        description: "Internal error with the request or unknown role or user"
 */

module.exports.getMe = async (app) => {
    app.get("/api/user/role/", async function (req, res) {
        try {
            // The body does not have all the necessary field
            if (!req.headers.dvflcookie) {
                res.sendStatus(400);
                return;
            }

            const dvflcookie = req.headers.dvflcookie;
            const userId = 1; // Set temporaly

            const resTestIfCorrelationExist = await app.executeQuery(app.db, "SELECT gd_roles.i_id AS 'id', gd_roles.v_name AS 'name', gd_roles.v_description AS 'description',gd_roles.v_color AS 'color' FROM `rolescorrelation` INNER JOIN gd_roles ON rolescorrelation.i_idRole = gd_roles.i_id WHERE rolescorrelation.i_idUser = ?", [userId]);
            // Error with the sql request
            if (resTestIfCorrelationExist[0]) {
                console.log(resTestIfCorrelationExist[0]);
                res.sendStatus(500);
                return;
            }

            res.json(resTestIfCorrelationExist[1]);
        } catch (error) {
            console.log("ERROR: GET /user/role/");
            console.log(error);
        }
    })
}

/**
 * @swagger
 * /user/{idUser}/role/{idRole}:
 *   post:
 *     summary: Add a role to a user
 *     tags: [Role]
 *     parameters:
 *     - name: dvflCookie
 *       in: header
 *       description: Cookie of the user making the request
 *       required: true
 *       type: string
 *     - name: "idUser"
 *       in: "path"
 *       description: "Id of user"
 *       required: true
 *       type: "integer"
 *       format: "int64"
 *     - name: "idRole"
 *       in: "path"
 *       description: "Id of role"
 *       required: true
 *       type: "integer"
 *       format: "int64"
 *     responses:
 *       200:
 *         description: "Role added successfully to the user"
 *       400:
 *        description: "The body does not have all the necessary field"
 *       401:
 *        description: "This correlation already exist"
 *       500:
 *        description: "Internal error with the request or unknown role or user"
 */

module.exports.post = async (app) => {
    app.post("/api/user/:idUser/role/:idRole/", async function (req, res) {
        try {
            // The body does not have all the necessary field
            if (!req.params.idUser || !req.params.idRole || !req.headers.dvflcookie || isNaN(req.params.idUser) || isNaN(req.params.idRole)) {
                res.sendStatus(400);
                return;
            }
            const dvflcookie = req.headers.dvflcookie;

            const userId = req.params.idUser;
            const roleId = req.params.idRole;

            const resTestIfCorrelationExist = await app.executeQuery(app.db, "SELECT 1 FROM `rolescorrelation` WHERE i_idUser = ? AND i_idRole = ?;", [userId, roleId]);
            // Error with the sql request
            if (resTestIfCorrelationExist[0]) {
                console.log(resTestIfCorrelationExist[0]);
                res.sendStatus(500);
                return;
            }
            if (resTestIfCorrelationExist[1].length !== 0) {
                res.sendStatus(401);
                return;
            }

            const resInsertNewRoleCorrelation = await app.executeQuery(app.db, "INSERT INTO `rolescorrelation` (`i_idUser`, `i_idRole`) VALUES (?, ?);", [userId, roleId]);
            // Error with the sql request
            if (resInsertNewRoleCorrelation[0] || resInsertNewRoleCorrelation[1].affectedRows !== 1) {
                console.log(resInsertNewRoleCorrelation[0]);
                res.sendStatus(500);
                return;
            }

            res.sendStatus(200);
        } catch (error) {
            console.log("ERROR: POST /user/:idUser/role/:idRole/");
            console.log(error);
        }
    })
}


/**
 * @swagger
 * /user/{idUser}/role/{idRole}:
 *   delete:
 *     summary: Delete a role to a user
 *     tags: [Role]
 *     parameters:
 *     - name: dvflCookie
 *       in: header
 *       description: Cookie of the user making the request
 *       required: true
 *       type: string
 *     - name: "idUser"
 *       in: "path"
 *       description: "Id of user"
 *       required: true
 *       type: "integer"
 *       format: "int64"
 *     - name: "idRole"
 *       in: "path"
 *       description: "Id of role"
 *       required: true
 *       type: "integer"
 *       format: "int64"
 *     responses:
 *       200:
 *         description: "Role deleted successfully to the user"
 *       400:
 *        description: "The body does not have all the necessary field"
 *       401:
 *        description: "This correlation already exist"
 *       409:
 *        description: "The user hasn't this role"
 *       500:
 *        description: "Internal error with the request or unknown role or user"
 */

module.exports.delete = async (app) => {
    app.delete("/api/user/:idUser/role/:idRole/", async function (req, res) {
        try {
            // The body does not have all the necessary field
            if (!req.params.idUser || !req.params.idRole || !req.headers.dvflcookie || isNaN(req.params.idUser) || isNaN(req.params.idRole)) {
                res.sendStatus(400);
                return;
            }
            const dvflcookie = req.headers.dvflcookie;

            const userId = req.params.idUser;
            const roleId = req.params.idRole;

            const resTestIfCorrelationExist = await app.executeQuery(app.db, "SELECT i_id AS 'id' FROM `rolescorrelation` WHERE i_idUser = ? AND i_idRole = ?;", [userId, roleId]);
            // Error with the sql request
            if (resTestIfCorrelationExist[0]) {
                console.log(resTestIfCorrelationExist[0]);
                res.sendStatus(500);
                return;
            }
            if (resTestIfCorrelationExist[1].length === 0) {
                res.sendStatus(409);
                return;
            }

            const resInsertNewRoleCorrelation = await app.executeQuery(app.db, "DELETE FROM `rolescorrelation` WHERE `i_id` = ?", [resTestIfCorrelationExist[1][0].id]);
            // Error with the sql request
            if (resInsertNewRoleCorrelation[0] || resInsertNewRoleCorrelation[1].affectedRows !== 1) {
                console.log(resInsertNewRoleCorrelation[0]);
                res.sendStatus(500);
                return;
            }

            res.sendStatus(200);
        } catch (error) {
            console.log("ERROR: DELETE /user/:idUser/role/:idRole/");
            console.log(error);
        }
    })
}