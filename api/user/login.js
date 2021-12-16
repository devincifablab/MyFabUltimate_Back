const sha256 = require("sha256");


/**
 * @swagger
 * /user/login/:
 *   post:
 *     summary: Check data for login (email and password) and return the cookie
 *     tags: [User]
 *     requestBody:
 *       description: "Data to change log the user"
 *       required: true
 *       content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *              password:
 *                type: string
 *     responses:
 *       200:
 *         description: Test to detect if the server is responding correctly
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dvflCookie:
 *                   type: string
 *               example:
 *                 dvflCookie: "cookieValue"
 *       400:
 *        description: "The body does not have all the necessary field"
 *       401:
 *        description: "Email or password is incorrect"
 *       500:
 *        description: "Internal error with the request"
 */

module.exports.post = async (req, res, app) => {
    // The body does not have all the necessary field
    if (!req.body.email || !req.body.password) {
        res.sendStatus(400);
        return;
    }
    const dbRes = await app.executeQuery(app.db, "SELECT `i_id` AS 'id' FROM `users` WHERE `v_email` = ? AND `v_password` = ?;", [req.body.email, sha256(req.body.password)]);
    // Error with the sql request
    if (dbRes[0]) {
        console.log(dbRes[0]);
        res.sendStatus(500);
        return;
    }
    // No match with tables => invalid email or password
    if (dbRes[1].length < 1) {
        res.sendStatus(401);
        return;
    }
    // Too much match with tables
    if (dbRes[1].length > 1) {
        console.log("Login match with multiple users : " + req.body.email);
        res.sendStatus(500);
        return;
    }
    
    const id = dbRes[1][0].id;
    const cookie = sha256((new Date().toISOString() + id + req.body.email).split('').sort(function () {
        return 0.5 - Math.random()
    }).join(''));
    app.cookiesList[cookie] = id;

    res.json({
        dvflCookie: cookie
    })
}