const fs = require("fs");

/**
 * @swagger
 * components:
 *   schemas:
 *     Status:
 *       type: object
 *       properties:
 *         id:
 *           type: "integer"
 *           format: "int64"
 *           description: Id of the status
 *         name:
 *           type: "string"
 *           description: name of the status
 *         color:
 *           type: "string"
 *           description: color of the status
 *       example:
 *         id: 1
 *         name: ouvert
 *         Color: 456456
 */

/**
 * @swagger
 * tags:
 *   name: GlobalData
 *   description: Every globalData information 
 */

/**
 * @swagger
 * /status/:
 *   get:
 *     summary: Get all status.
 *     tags: [GlobalData]
 *     responses:
 *       "200":
 *         description: "Get all status"
 *         content:
 *           application/json:
 *             schema:
 *               type: "array"
 *               items:
 *                 $ref: '#/components/schemas/Status'
 *       500:
 *        description: "Internal error with the request"
 */

 module.exports.getStatus= async (app) => {
    app.get("/api/status", async function (req, res) {
        try {
            
            const query = `SELECT stat.i_id as id,
             stat.v_name as name,
             stat.v_color as color
             FROM gd_status AS stat `;

            const dbRes = await app.executeQuery(app.db, query,[]);
            if (dbRes[0]) {
                console.log(dbRes[0]);
                res.sendStatus(500);
                return;
            }
            res.json(dbRes[1])
        } catch (error) {
            console.log("ERROR: GET /api/ticket/status/");
            console.log(error);
            res.sendStatus(500);
        }
    })
}