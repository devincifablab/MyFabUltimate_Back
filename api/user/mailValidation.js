/**
 * @swagger
 * /user/mailValidation/{tocken}:
 *   put:
 *     summary: Valid the user account link with the account
 *     tags: [User]
 *     parameters:
 *     - name: "tocken"
 *       in: "path"
 *       description: "Tocken to validate user email"
 *       required: true
 *       type: "string"
 *     responses:
 *       200:
 *         description: "Account validate successfully"
 *       400:
 *        description: "The body does not have all the necessary field or email not valid"
 *       401:
 *        description: "Invalid code"
 *       500:
 *        description: "Internal error with the request"
 */

module.exports.put = async (app) => {
    app.put("/api/user/mailValidation/:tocken", async function (req, res) {
        try {
            // The body does not have all the necessary field
            if (!req.params.tocken) {
                res.sendStatus(400);
                return;
            }
            const resGetUserId = await app.executeQuery(app.db, "SELECT `i_idUser` AS userId FROM `mailtocken` WHERE `v_value` = ?", [req.params.tocken]);
            // Error with the sql request
            if (resGetUserId[0]) {
                console.log(resGetUserId[0]);
                res.sendStatus(500);
                return;
            }
            if (resGetUserId[1].length !== 1 || !resGetUserId[1][0].userId) {
                res.sendStatus(401);
                return;
            }

            const userId = resGetUserId[1][0].userId;

            const resDeleteEmailTocken = await app.executeQuery(app.db, "DELETE FROM `mailtocken` WHERE `v_value` = ?", [req.params.tocken]);
            // Error with the sql request
            if (resDeleteEmailTocken[0]) {
                console.log(resDeleteEmailTocken[0]);
                res.sendStatus(500);
                return;
            }

            const resValidUser = await app.executeQuery(app.db, "UPDATE `users` SET `b_mailValidated` = '1' WHERE `i_id` = ?", [userId]);

            // Error with the sql request
            if (resValidUser[0] || resValidUser[1].affectedRows !== 1) {
                console.log("Error : update user for email validation");
                console.log(resValidUser[0]);
                res.sendStatus(500);
                return;
            }
            res.sendStatus(200);
        } catch (error) {
            console.log("ERROR: PUT /user/mailValidation/:tocken");
            console.log(error);
        }
    })
}