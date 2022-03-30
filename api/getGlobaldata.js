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

module.exports.getStatus = getStatus;
async function getStatus(data) {
    const query = `SELECT stat.i_id as id,
             stat.v_name as name,
             stat.v_color as color
             FROM gd_status AS stat `;

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
 * components:
 *   schemas:
 *     ProjectType:
 *       type: object
 *       properties:
 *         id:
 *           type: "integer"
 *           format: "int64"
 *           description: Id of the project
 *         name:
 *           type: "string"
 *           description: name of the project
 *       example:
 *         id: 1
 *         name: PIX
 */

/**
 * @swagger
 * /projectType/:
 *   get:
 *     summary: Get all types of project.
 *     tags: [GlobalData]
 *     responses:
 *       "200":
 *         description: "Get all types of project"
 *         content:
 *           application/json:
 *             schema:
 *               type: "array"
 *               items:
 *                 $ref: '#/components/schemas/ProjectType'
 *       500:
 *        description: "Internal error with the request"
 */

 module.exports.getProjectType = getProjectType;
 async function getProjectType(data) {
     const query = `SELECT projType.i_id as id,
             projType.v_name as name
             FROM gd_ticketprojecttype AS projType `;
 
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
  * /version/:
  *   get:
  *     summary: Get the version of the project.
  *     tags: [GlobalData]
  *     responses:
  *       "200":
  *         description: "Get the version of the project."
  *         content:
  */
 
 module.exports.getVersion = getVersion;
 async function getVersion(data) { 
     return {
         type: "json",
         code: 200,
         json: {
             version: require("../package.json").version
         }
     }
 }

module.exports.startApi = startApi;
async function startApi(app) {
    app.get("/api/status", async function (req, res) {
        try {
            const data = await require("../functions/apiActions").prepareData(app, req, res);
            const result = await getStatus(data);
            await require("../functions/apiActions").sendResponse(req, res, result);
        } catch (error) {
            console.log("ERROR: GET /api/status/");
            console.log(error);
            res.sendStatus(500);
        }
    })

    app.get("/api/projectType/", async function (req, res) {
        try {
            const data = await require("../functions/apiActions").prepareData(app, req, res);
            const result = await getProjectType(data)
            await require("../functions/apiActions").sendResponse(req, res, result);
        } catch (error) {
            console.log("ERROR: GET /api/projectType/");
            console.log(error);
            res.sendStatus(500);
        }
    })

    app.get("/api/version/", async function (req, res) {
        try {
            const data = await require("../functions/apiActions").prepareData(app, req, res);
            const result = await getVersion(data)
            await require("../functions/apiActions").sendResponse(req, res, result);
        } catch (error) {
            console.log("ERROR: GET /api/version/");
            console.log(error);
            res.sendStatus(500);
        }
    })
}