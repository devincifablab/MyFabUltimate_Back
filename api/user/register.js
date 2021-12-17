const sha256 = require("sha256");
const validateEmail = (email) => {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
};


/**
 * @swagger
 * /user/register/:
 *   post:
 *     summary: Post all data for account creation (firstName, lastName, email and password) and send an email to validate the account
 *     tags: [User]
 *     requestBody:
 *       description: "Post all data for account creation (firstName, lastName, email and password) and send an email to validate the account"
 *       required: true
 *       content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              firstName:
 *                type: string
 *              lastName:
 *                type: string
 *              email:
 *                type: string
 *              password:
 *                type: string
 *     responses:
 *       200:
 *         description: Account created successfully and an email was sent
 *       400:
 *        description: "The body does not have all the necessary field or email not valid"
 *       401:
 *        description: "L'adresse email est déjà utilisé"
 *       500:
 *        description: "Internal error with the request"
 */

module.exports.post = async (req, res, app) => {
    try {
        // The body does not have all the necessary field
        if (!req.body.firstName || !req.body.lastName || !req.body.email || !req.body.password || validateEmail(req.body.email) === null) {
            res.sendStatus(400);
            return;
        }
        const resTestIfAccountExist = await app.executeQuery(app.db, "SELECT 1 FROM `users` WHERE v_email = ?;", [req.body.email]);
        // Error with the sql request
        if (resTestIfAccountExist[0]) {
            console.log(dbRes[0]);
            res.sendStatus(500);
            return;
        }
        if (resTestIfAccountExist[1].length !== 0) {
            res.sendStatus(401);
            return;
        }

        const language = req.body.language ? req.body.language : "fr";
        const resInsertNewAccount = await app.executeQuery(app.db, "INSERT INTO `users` (`v_firstName`, `v_lastName`, `v_email`, `v_password`, `v_language`) VALUES (?, ?, ?, ?, ?);", [req.body.firstName, req.body.lastName, req.body.email, sha256(req.body.password), language]);
        // Error with the sql request
        if (resInsertNewAccount[0] || resInsertNewAccount[1].affectedRows !== 1) {
            console.log(dbRes[0]);
            res.sendStatus(500);
            return;
        }

        //Send validation email to the user
        if (req.body.sendMail == null ? true : req.body.sendMail) {
            console.log("Mail send");
        }

        res.sendStatus(200);
    } catch (error) {
        console.log("Error in POST /user/register/");
        console.log(error);
        res.sendStatus(500);
    }
}