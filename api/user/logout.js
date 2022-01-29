const sha256 = require("sha256");


/**
 * @swagger
 * /user/logout/:
 *   delete:
 *     summary: Logout user and delete the cookie saved
 *     tags: [User]
 *     parameters:
 *     - name: dvflCookie
 *       in: header
 *       description: Cookie of the user making the request
 *       required: true
 *       type: string
 *     responses:
 *       200:
 *        description: "The user is now logout"
 *       401:
 *        description: "Email or password is incorrect"
 *       500:
 *        description: "Internal error with the request"
 */

module.exports.post = async (app) => {
    app.delete("/api/user/logout/", async function (req, res) {
        try {
            const dvflcookie = req.headers.dvflcookie;
            // unauthenticated user
            if (!dvflcookie) {
                res.sendStatus(401);
                return;
            }
            delete app.cookiesList[dvflcookie];

            res.sendStatus(200);
        } catch (error) {
            console.log("ERROR: DELETE /api/user/logout/");
            console.log(error);
            res.sendStatus(500);
        }
    })
}