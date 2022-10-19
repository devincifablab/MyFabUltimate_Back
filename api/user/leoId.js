const fs = require("fs");
const sha256 = require("sha256");
const axios = require("axios");
const jwt_decode = require("jwt-decode");

function makeid(length) {
  var result = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

/**
 * @swagger
 * /user/login/microsoft/:
 *   get:
 *     summary: Connect a microsoft account and return a cookie
 *     tags: [User]
 *     parameters:
 *     - name: "token"
 *       in: "header"
 *       description: "Token to login/register"
 *       required: true
 *       type: "string"
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
 *        description: "The account is not from the De Vinci Microsoft organization"
 *       500:
 *        description: "Internal error with the request"
 */

module.exports.postMicrosoftLogin = postMicrosoftLogin;
async function postMicrosoftLogin(data) {
  const myFabOpen = JSON.parse(fs.readFileSync(__dirname + "/../../data/serviceData.json")).myFabOpen;
  if (!myFabOpen) {
    return {
      type: "code",
      code: 403,
    };
  }

  const token = data.authorization;
  // The body does not have all the necessary field
  if (!token) {
    return {
      type: "code",
      code: 400,
    };
  }
  return await new Promise(async function (resolve) {
    await axios({
      method: "GET",
      headers: {
        Authorization: token,
      },
      url: "https://graph.microsoft.com/v1.0/organization",
    }).then(async (responseOrganization) => {
      await axios({
        method: "GET",
        headers: {
          Authorization: token,
        },
        url: "https://graph.microsoft.com/v1.0/me",
      })
        .then(async (response) => {
          const firstName = response.data.givenName;
          const lastName = response.data.surname;
          const email = response.data.mail;
          const jobTitle = response.data.jobTitle;
          const dbRes = await data.app.executeQuery(data.app.db, "SELECT `i_id` AS 'id', `v_title` AS 'title' FROM `users` WHERE `v_email` = ?;", [email]);

          // Error with the sql request
          if (dbRes[0]) {
            console.log(dbRes[0]);
            return resolve({
              type: "code",
              code: 500,
            });
          }
          // No match with tables => invalid email or password
          if (dbRes[1].length < 1) {
            //La création de nouveau compte pour une organisation différente est désactivé
            if (responseOrganization.data.value[0].displayName != "De Vinci") {
              return resolve({
                type: "code",
                code: 401,
              });
            }

            //On doit créer un compte
            const language = data.body.language ? data.body.language : "fr";
            const resInsertNewAccount = await data.app.executeQuery(
              data.app.db,
              "INSERT INTO `users` (`v_firstName`, `v_lastName`, `v_email`, `v_password`, `v_language`, `v_title`, `b_isMicrosoft`, `b_mailValidated`) VALUES (?, ?, ?, ?, ?, ?, 1, 1);",
              [firstName, lastName, email, sha256(token), language, jobTitle]
            );
            // Error with the sql request
            if (resInsertNewAccount[0] || resInsertNewAccount[1].affectedRows !== 1) {
              console.log(resInsertNewAccount[0]);
              return resolve({
                type: "code",
                code: 500,
              });
            }
            const resGetIdUserInserted = await data.app.executeQuery(data.app.db, "SELECT LAST_INSERT_ID() AS 'id';", []);
            // Error with the sql request
            if (resGetIdUserInserted[0] || resGetIdUserInserted[1].length !== 1 || resGetIdUserInserted[1][0].id === 0) {
              console.log(resGetIdUserInserted[0]);
              return resolve({
                type: "code",
                code: 500,
              });
            }
            const idNewUser = resGetIdUserInserted[1][0].id;
            const cookie = await require("../../functions/apiActions").saveNewCookie(data.app, { id: idNewUser, email: email });

            return resolve({
              type: "json",
              code: 200,
              json: {
                dvflCookie: cookie,
              },
            });
          }
          // Too much match with tables
          if (dbRes[1].length > 1) {
            console.log("Login match with multiple users : " + email);
            return resolve({
              type: "code",
              code: 500,
            });
          }

          const id = dbRes[1][0].id;
          if (dbRes[1][0].title !== jobTitle) {
            await data.app.executeQuery(data.app.db, "UPDATE `users` SET `v_title` = ? WHERE `i_id` = ?;", [jobTitle, id]);
          }

          const cookie = await require("../../functions/apiActions").saveNewCookie(data.app, { id, email });

          return resolve({
            type: "json",
            code: 200,
            json: {
              dvflCookie: cookie,
            },
          });
        })
        .catch((error) => {
          console.log(error);
          return resolve({
            type: "code",
            code: 500,
          });
        });
    });
  });
}

/**
 * @swagger
 * /user/login/JWT/:
 *   post:
 *     summary: Connect to MyFab with JWT
 *     tags: [User]
 *     requestBody:
 *       description: "JWT for connection"
 *       required: true
 *       content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              JWT:
 *                type: string
 *     responses:
 *       200:
 *         description: User connected successfully
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
 *        description: "The account is not from the De Vinci Microsoft organization"
 *       500:
 *        description: "Internal error with the request"
 */

module.exports.postLoginJWT = postLoginJWT;
async function postLoginJWT(data) {
  const myFabOpen = JSON.parse(fs.readFileSync(__dirname + "/../../data/serviceData.json")).myFabOpen;
  if (!myFabOpen) {
    return {
      type: "code",
      code: 403,
    };
  }

  if (!data.body || !data.body.JWT) {
    return {
      type: "code",
      code: 400,
    };
  }

  const decoded = jwt_decode(data.body.JWT);

  const queryCheckIfEmailExist = `SELECT 1 FROM users
  WHERE v_email = ?;`;
  const resTestIfAccountExist = await data.app.executeQuery(data.app.db, queryCheckIfEmailExist, [decoded.email]);
  if (resTestIfAccountExist[1].length === 0) {
    //Création du compte
    const queryInsert = `INSERT INTO users (v_firstName, v_lastName, v_email, v_password, v_title, b_mailValidated, b_isMicrosoft)
                        VALUES (?, ?, ?, ?, ' ', 1, 1);`;
    const resInsertNewAccount = await data.app.executeQuery(data.app.db, queryInsert, [decoded.first_name, decoded.last_name, decoded.email, makeid(60)]);
    if (resInsertNewAccount[0] || resInsertNewAccount[1].affectedRows !== 1) {
      console.log(resInsertNewAccount[0]);
      return {
        type: "code",
        code: 500,
      };
    }
    data.app.io.emit("event-reload-users"); // reload users menu on client
  }
  //Connection
  const querySelect = `SELECT i_id AS 'id'
                        FROM users
                        WHERE v_email = ?
                        AND b_deleted = 0;`;
  const dbRes = await data.app.executeQuery(data.app.db, querySelect, [decoded.email]);
  // Error with the sql request
  if (dbRes[0]) {
    console.log(dbRes[0]);
    return {
      type: "code",
      code: 500,
    };
  }
  // No match with tables => invalid email or password
  if (dbRes[1].length < 1) {
    return {
      type: "code",
      code: 401,
    };
  }
  // Too much match with tables
  if (dbRes[1].length > 1) {
    console.log("Login match with multiple users : " + decoded.email);
    return {
      type: "code",
      code: 500,
    };
  }

  const id = dbRes[1][0].id;
  const cookie = await require("../../functions/apiActions").saveNewCookie(data.app, { id, email: decoded.email, expireIn: new Date(data.body.expires).toISOString() });

  return {
    type: "json",
    code: 200,
    json: {
      dvflCookie: cookie,
    },
  };
}

module.exports.startApi = startApi;
async function startApi(app) {
  app.get("/api/user/login/microsoft", async function (req, res) {
    try {
      const data = await require("../../functions/apiActions").prepareData(app, req, res);
      data.authorization = req.headers.authorization;
      const result = await postMicrosoftLogin(data);
      await require("../../functions/apiActions").sendResponse(req, res, result);
    } catch (error) {
      console.log("ERROR: POST /api/user/login/microsoft/");
      console.log(error);
      res.sendStatus(500);
    }
  });

  app.post("/api/user/login/JWT/", async function (req, res) {
    try {
      const data = await require("../../functions/apiActions").prepareData(app, req, res);
      data.authorization = req.headers.authorization;
      const result = await postLoginJWT(data);
      await require("../../functions/apiActions").sendResponse(req, res, result);
    } catch (error) {
      console.log("ERROR: POST /api/user/login/JWT");
      console.log(error);
      res.sendStatus(500);
    }
  });
}
