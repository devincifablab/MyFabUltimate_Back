/**
 * @swagger
 * /user/authorization/{authName}:
 *   get:
 *     summary: Return true of false if the user is allowed to access to the ressource asked
 *     tags: [Role]
 *     parameters:
 *     - name: dvflCookie
 *       in: header
 *       description: Cookie of the user making the request
 *       required: true
 *       type: string
 *     - name: "authName"
 *       in: "path"
 *       description: "Name of the autorization. The value accepted are 'viewUsers', 'manageUser', 'changeUserRole', 'changeUserProtectedRole', 'myFabAgent'"
 *       required: true
 *       type: "integer"
 *       format: "int64"
 *     responses:
 *       200:
 *         description: Account created successfully and an email was sent
 *       400:
 *        description: "The body does not have all the necessary field"
 *       401:
 *        description: "User unknown"
 *       500:
 *        description: "Internal error with the request"
 */

module.exports.get = async (app) => {
    app.get("/api/user/authorization/:authName", async function (req, res) {
        try {
            // The body does not have all the necessary field
            if (!req.params.authName || !req.headers.dvflcookie) {
                res.sendStatus(400);
                return;
            }
            const userId = app.cookiesList[req.headers.dvflcookie];
            if (!userId) {
                res.sendStatus(401);
                return;
            }
            const result = await require("../../functions/userAuthorization").validateUserAuth(app, userId, req.params.authName);
            res.json(result);
        } catch (error) {
            console.log("ERROR: POST /user/register/");
            console.log(error);
            res.sendStatus(500);
        }
    })
}