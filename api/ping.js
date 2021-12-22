/**
 * @swagger
 * tags:
 *   name: Ping
 *   description: Test to detect if the server is responding correctly
 */

/**
 * @swagger
 * /ping:
 *   get:
 *     summary: Test to detect if the server is responding correctly
 *     tags: [Ping]
 *     responses:
 *       200:
 *         description: Test to detect if the server is responding correctly
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *               example:
 *                 result: pong
 */


module.exports.get = (app) => {
    app.get("/api/ping/", async function (req, res) {
        try {
            res.json({
                result: "pong"
            })
        } catch (error) {
            console.log("ERROR: GET /api/ping/");
            console.log(error);
        }
    })
}

/**
 * @swagger
 * /ping:
 *   post:
 *     summary: Test to detect if the server is responding correctly
 *     tags: [Ping]
 *     responses:
 *       200:
 *         description: Test to detect if the server is responding correctly
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *               example:
 *                 result: pong
 */

module.exports.post = (app) => {
    app.post("/api/ping/", async function (req, res) {
        try {
            res.json({
                result: "pong"
            })
        } catch (error) {
            console.log("ERROR: POST /api/ping/");
            console.log(error);
        }
    })
}

/**
 * @swagger
 * /ping:
 *   put:
 *     summary: Test to detect if the server is responding correctly
 *     tags: [Ping]
 *     responses:
 *       200:
 *         description: Test to detect if the server is responding correctly
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *               example:
 *                 result: pong
 */

module.exports.put = (app) => {
    app.put("/api/ping/", async function (req, res) {
        try {
            res.json({
                result: "pong"
            })
        } catch (error) {
            console.log("ERROR: PUT /api/ping/");
            console.log(error);
        }
    })
}

/**
 * @swagger
 * /ping:
 *   delete:
 *     summary: Test to detect if the server is responding correctly
 *     tags: [Ping]
 *     responses:
 *       200:
 *         description: Test to detect if the server is responding correctly
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *               example:
 *                 result: pong
 */

module.exports.delete = (app) => {
    app.delete("/api/ping/", async function (req, res) {
        try {
            res.json({
                result: "pong"
            })
        } catch (error) {
            console.log("ERROR: DELETE /api/ping/");
            console.log(error);
        }
    })
}
