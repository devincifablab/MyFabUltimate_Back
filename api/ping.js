/**
 * @swagger
 * components:
 *   schemas:
 *     Ping:
 *       type: object
 *       properties:
 *         result:
 *           type: string
 *           description: The response of the server
 *       example:
 *         result: pong
 */

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
 *               $ref: '#/components/schemas/Ping'
 */


module.exports.get = (req, res, app) => {
    res.json({
        result: "pong"
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
 *               $ref: '#/components/schemas/Ping'
 */

module.exports.post = (req, res, app) => {
    res.json({
        result: "pong"
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
 *               $ref: '#/components/schemas/Ping'
 */

module.exports.put = (req, res, app) => {
    res.json({
        result: "pong"
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
 *               $ref: '#/components/schemas/Ping'
 */

module.exports.delete = (req, res, app) => {
    res.json({
        result: "pong"
    })
}