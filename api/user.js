const maxUser = 30;

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: "integer"
 *           format: "int64"
 *           description: Id of the user
 *         firstName:
 *           type: "string"
 *           description: First name of the user
 *         lastName:
 *           type: "string"
 *           description: Last name of the user
 *         email:
 *           type: "string"
 *           description: Email of the user
 *         creationDate:
 *           type: "string"
 *           format: "date-time"
 *           description: "Date when the user was created"
 *         discordid:
 *           type: "string"
 *           description: "Discord id when the user was created, if seted"
 *         language:
 *           type: "string"
 *           description: "The language selected by the user. By default the language is 'fr'"
 *         title:
 *           type: "string"
 *           description: "The title of user. For example 'Etudiant A2'"
 *         acceptedRule:
 *           type: "boolean"
 *           description: "If the user has accepted the general conditions of use"
 *         mailValidated:
 *           type: "boolean"
 *           description: "If the user has validated his email address"
 *       example:
 *         id: 212
 *         firstName: John
 *         lastName: Doe
 *         email: john.doe@mailcom
 *         creationDate: 2021-12-16T09:31:38.000Z
 *         discordid: 012345678901
 *         language: fr
 *         acceptedRule: 1
 *         mailValidated: 1
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ShortUser:
 *       type: object
 *       properties:
 *         id:
 *           type: "integer"
 *           format: "int64"
 *           description: Id of the user
 *         firstName:
 *           type: "string"
 *           description: First name of the user
 *         lastName:
 *           type: "string"
 *           description: Last name of the user
 *         email:
 *           type: "string"
 *           description: Email of the user
 *       example:
 *         id: 212
 *         firstName: John
 *         lastName: Doe
 *         email: john.doe@mailcom
 */

/**
 * @swagger
 * tags:
 *   name: User
 *   description: Everything about users
 */

/**
 * @swagger
 * /user:
 *   get:
 *     summary: Get all users data
 *     tags: [User]
 *     parameters:
 *     - name: dvflCookie
 *       in: header
 *       description: Cookie of the user making the request
 *       required: true
 *       type: string
 *     responses:
 *       "200":
 *         description: "Get all users data. Warning the returned users do not contain all the data"
 *         content:
 *           application/json:
 *             schema:
 *               type: "array"
 *               items:
 *                 $ref: '#/components/schemas/ShortUser'
 *       401:
 *        description: "The user is unauthenticated"
 *       403:
 *        description: "The user is not allowed"
 *       500:
 *        description: "Internal error with the request"
 */

function getOrderCollumnName(collumnName) {
  switch (collumnName) {
    case "firstname":
      return "v_firstName";
    case "lastname":
      return "v_lastName";
    case "email":
      return "v_email";
    case "title":
      return "v_title";
    default:
      return "i_id";
  }
}

module.exports.userGetAll = userGetAll;
async function userGetAll(data) {
  const userIdAgent = data.userId;
  // unauthenticated user
  if (!userIdAgent) {
    return {
      type: "code",
      code: 401,
    };
  }
  const authViewResult = await data.userAuthorization.validateUserAuth(data.app, userIdAgent, "viewUsers");
  if (!authViewResult) {
    return {
      type: "code",
      code: 403,
    };
  }
  const inputText = data.query.inputValue ? data.query.inputValue : "";
  const page = data.query.page ? data.query.page : 0;
  const orderCollumn = getOrderCollumnName(data.query.collumnName);
  const order = data.query.order === "false" ? "DESC" : "ASC";
  const querySelect = `SELECT i_id AS id,
                v_firstName AS firstName,
                v_lastName AS lastName,
                v_email AS email,
                v_title AS "title",
                b_isMicrosoft AS "isMicrosoft"
                FROM users
                WHERE b_deleted = 0
                AND b_visible = 1
                AND (
                    "" = ?
                    OR i_id LIKE CONCAT("%", ?, "%")
                    OR v_firstName LIKE CONCAT("%", ?, "%")
                    OR v_lastName LIKE CONCAT("%", ?, "%")
                    OR v_email LIKE CONCAT("%", ?, "%")
                    )
                ORDER BY ${orderCollumn} ${order}
                ${data.query.all ? "" : "LIMIT ? OFFSET ?"};`;
  const dbRes = await data.app.executeQuery(data.app.db, querySelect, [inputText, inputText, inputText, inputText, inputText, maxUser, maxUser * page]);
  if (dbRes[0]) {
    console.log(dbRes[0]);
    return {
      type: "code",
      code: 500,
    };
  }

  const queryCount = `SELECT COUNT(1) AS count
                FROM users
                WHERE b_deleted = 0
                AND b_visible = 1
                AND (
                    "" = ?
                    OR i_id LIKE CONCAT("%", ?, "%")
                    OR v_firstName LIKE CONCAT("%", ?, "%")
                    OR v_lastName LIKE CONCAT("%", ?, "%")
                    OR v_email LIKE CONCAT("%", ?, "%")
                    );`;

  const dbResCount = await data.app.executeQuery(data.app.db, queryCount, [inputText, inputText, inputText, inputText, inputText, maxUser, maxUser * page]);
  if (dbRes[0]) {
    console.log(dbRes[0]);
    return {
      type: "code",
      code: 500,
    };
  }
  const calcUserByMaxUser = dbResCount[1][0].count / maxUser;
  const maxPage = Math.trunc(calcUserByMaxUser) === calcUserByMaxUser ? calcUserByMaxUser : Math.trunc(calcUserByMaxUser) + 1;

  return {
    type: "json",
    code: 200,
    json: { maxPage: data.query.all ? 1 : maxPage, values: dbRes[1] },
  };
}

/**
 * @swagger
 * /user/me:
 *   get:
 *     summary: Get data of the current user
 *     tags: [User]
 *     parameters:
 *     - name: dvflCookie
 *       in: header
 *       description: Cookie of the user making the request
 *       required: true
 *       type: string
 *     responses:
 *       200:
 *         description: Get one user data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       204:
 *        description: "The request has no content"
 *       401:
 *        description: "The user is unauthenticated"
 *       500:
 *        description: "Internal error with the request"
 */

module.exports.userGetMe = userGetMe;
async function userGetMe(data) {
  const userIdAgent = data.userId;
  // unauthenticated user
  if (!userIdAgent) {
    return {
      type: "code",
      code: 401,
    };
  }
  const querySelect = `SELECT i_id AS id,
                    v_firstName AS "firstName",
                    v_lastName AS "lastName",
                    v_email AS "email",
                    dt_creationdate AS "creationDate",
                    v_discordid AS "discordid",
                    v_language AS "language",
                    v_title AS "title",
                    b_isMicrosoft AS "isMicrosoft",
                    (SELECT CASE WHEN dt_ruleSignature IS NULL THEN FALSE ELSE TRUE END FROM users WHERE i_id = ?) AS "acceptedRule",
                    b_mailValidated AS "mailValidated"
                    FROM users
                    WHERE i_id = ?
                    AND b_deleted = 0`;
  const dbRes = await data.app.executeQuery(data.app.db, querySelect, [userIdAgent, userIdAgent]);
  // The sql request has an error
  if (dbRes[0]) {
    console.log(dbRes[0]);
    return {
      type: "code",
      code: 500,
    };
  }
  // The response has no value
  if (dbRes[1].length !== 1) {
    return {
      type: "code",
      code: 204,
    };
  }
  return {
    type: "json",
    code: 200,
    json: dbRes[1][0],
  };
}

/**
 * @swagger
 * /user/{id}:
 *   get:
 *     summary: Get one user data
 *     tags: [User]
 *     consumes:
 *     - "application/x-www-form-urlencoded"
 *     parameters:
 *     - name: dvflCookie
 *       in: header
 *       description: Cookie of the user making the request
 *       required: true
 *       type: string
 *     - name: "id"
 *       in: "path"
 *       description: "Id of user"
 *       required: true
 *       type: "integer"
 *       format: "int64"
 *     responses:
 *       200:
 *         description: Get one user data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       204:
 *        description: "The request has no content"
 *       400:
 *        description: "id is not valid"
 *       401:
 *        description: "The user is unauthenticated"
 *       403:
 *        description: "The user is not allowed"
 *       500:
 *        description: "Internal error with the request"
 */

module.exports.userGetById = userGetById;
async function userGetById(data) {
  const userIdAgent = data.userId;
  const idUserTarget = data.params.id;
  // Id is not a number
  if (isNaN(idUserTarget)) {
    return {
      type: "code",
      code: 400,
    };
  }
  // unauthenticated user
  if (!userIdAgent) {
    return {
      type: "code",
      code: 401,
    };
  }
  const authViewResult = await data.userAuthorization.validateUserAuth(data.app, userIdAgent, "viewUsers");
  if (!authViewResult) {
    return {
      type: "code",
      code: 403,
    };
  }
  const querySelect = `SELECT i_id AS "id",
                    v_firstName AS "firstName",
                    v_lastName AS "lastName",
                    v_email AS "email",
                    dt_creationdate AS "creationDate",
                    v_discordid AS "discordid",
                    v_language AS "language",
                    v_title AS "title",
                    b_isMicrosoft AS "isMicrosoft",
                    (SELECT CASE WHEN dt_ruleSignature IS NULL THEN FALSE ELSE TRUE END FROM users WHERE i_id = ?) AS "acceptedRule",
                    b_mailValidated AS "mailValidated"
                    FROM users
                    WHERE i_id = ?
                    AND b_deleted = 0`;
  const dbRes = await data.app.executeQuery(data.app.db, querySelect, [idUserTarget, idUserTarget]);
  // The sql request has an error
  if (dbRes[0]) {
    console.log(dbRes[0]);
    return {
      type: "code",
      code: 500,
    };
  }
  // The response has no value
  if (dbRes[1].length !== 1) {
    return {
      type: "code",
      code: 204,
    };
  }
  return {
    type: "json",
    code: 200,
    json: dbRes[1][0],
  };
}

/**
 * @swagger
 * /user/{id}:
 *   delete:
 *     summary: Delete one user
 *     tags: [User]
 *     consumes:
 *     - "application/x-www-form-urlencoded"
 *     parameters:
 *     - name: dvflCookie
 *       in: header
 *       description: Cookie of the user making the request
 *       required: true
 *       type: string
 *     - name: "id"
 *       in: "path"
 *       description: "Id of user"
 *       required: true
 *       type: "integer"
 *       format: "int64"
 *     responses:
 *       200:
 *        description: "Suppression succed"
 *       204:
 *        description: "No user deleted"
 *       400:
 *        description: "id is not valid"
 *       401:
 *        description: "The user is unauthenticated"
 *       403:
 *        description: "The user is not allowed"
 *       500:
 *        description: "Internal error with the request"
 */

module.exports.userDeleteById = userDeleteById;
async function userDeleteById(data) {
  const userIdAgent = data.userId;
  const idUserTarget = data.params ? data.params.id : undefined;
  // if the user is not allowed
  if (!userIdAgent) {
    return {
      type: "code",
      code: 401,
    };
  }
  const authViewResult = await data.userAuthorization.validateUserAuth(data.app, userIdAgent, "viewUsers");
  if (!authViewResult) {
    return {
      type: "code",
      code: 403,
    };
  }
  const authManageUserResult = await data.userAuthorization.validateUserAuth(data.app, userIdAgent, "manageUser");
  if (!authManageUserResult) {
    return {
      type: "code",
      code: 403,
    };
  }
  // Id is not a number or user try to delete himself
  if (isNaN(idUserTarget) || idUserTarget == userIdAgent) {
    return {
      type: "code",
      code: 400,
    };
  }
  const queryUpdate = `UPDATE users
                         SET b_deleted = "1",
                         dt_creationdate = CURRENT_TIMESTAMP
                         WHERE i_id = ?;`;
  const dbRes = await data.app.executeQuery(data.app.db, queryUpdate, [idUserTarget]);
  // The sql request has an error
  if (dbRes[0]) {
    console.log(dbRes[0]);
    return {
      type: "code",
      code: 500,
    };
  }
  // The response has no value
  if (dbRes[1].changedRows !== 1) {
    return {
      type: "code",
      code: 204,
    };
  }
  data.app.io.emit("event-reload-users"); // reload users menu on client
  return {
    type: "code",
    code: 200,
  };
}

module.exports.userRenamePut = userRenamePut;
async function userRenamePut(data) {
  const idUserTarget = data.params ? data.params.id : undefined;
  const specialCode = await require("../functions/userAuthorization").getSpecialCode();
  // Id is not a number or user try to delete himself
  if (isNaN(idUserTarget) || !specialCode || specialCode !== data.specialcode || !data.body) {
    return {
      type: "code",
      code: 404,
    };
  }
  if (data.body.firstName) {
    const queryUpdate = `UPDATE users SET v_firstName = ? WHERE i_id = ?;`;
    const dbRes = await data.app.executeQuery(data.app.db, queryUpdate, [data.body.firstName, idUserTarget]);
    // The sql request has an error
    if (dbRes[0]) {
      console.log(dbRes[0]);
      return {
        type: "code",
        code: 500,
      };
    }
  }
  if (data.body.lastName) {
    const queryUpdate = `UPDATE users SET v_lastName = ? WHERE i_id = ?;`;
    const dbRes = await data.app.executeQuery(data.app.db, queryUpdate, [data.body.lastName, idUserTarget]);
    // The sql request has an error
    if (dbRes[0]) {
      console.log(dbRes[0]);
      return {
        type: "code",
        code: 500,
      };
    }
  }
  if (data.body.title) {
    const queryUpdate = `UPDATE users SET v_title = ? WHERE i_id = ?;`;
    const dbRes = await data.app.executeQuery(data.app.db, queryUpdate, [data.body.title, idUserTarget]);
    // The sql request has an error
    if (dbRes[0]) {
      console.log(dbRes[0]);
      return {
        type: "code",
        code: 500,
      };
    }
  }
  data.app.io.emit("event-reload-users"); // reload users menu on client

  return {
    type: "code",
    code: 200,
  };
}

/**
 * @swagger
 * /user/discord/link/:
 *   get:
 *     summary: Get the link to connect to a Discord account
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Get the link to connect to a Discord account
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *               example:
 *                 result: https://discord.com/oauth2/authorize?client_id=Bas%20non%20ce%20lien%20marche%20pô&redirect_uri=http%3A%2F%2Flocalhost%2FdiscordConnection&response_type=code&scope=identify
 *       500:
 *        description: "Internal error with the request"
 */

const config = require("../config.json");
module.exports.getDicordLink = getDicordLink;
async function getDicordLink(data) {
  if (!config.bot || !config.bot.clientId) {
    console.log("Discord link with MyFab not configured");
    return {
      type: "code",
      code: 204,
    };
  }
  return {
    type: "json",
    code: 200,
    json: {
      result:
        "https://discord.com/oauth2/authorize?client_id=" + config.bot.clientId + "&redirect_uri=http%3A%2F%2Flocalhost%2FdiscordConnection&response_type=code&scope=identify",
    },
  };
}

/**
 * @swagger
 * /user/discord/serverInvite/:
 *   get:
 *     summary: Get the invite to connect to the Discord server
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Get the invite to connect to the Discord server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *               example:
 *                 result: https://discord.gg/example
 *       500:
 *        description: "Internal error with the request"
 */

const axios = require("axios");
module.exports.getDicordInvite = getDicordInvite;
async function getDicordInvite(data) {
  if (!config.bot || !config.bot.clientId) {
    console.log("Discord link with MyFab not configured");
    return {
      type: "code",
      code: 204,
    };
  }
  const res = await new Promise(async (resolve, reject) => {
    await axios({
      method: "GET",
      url: config.url + config.portBot + "/api/invite/",
    })
      .then(async (response) => {
        resolve(response.data.result);
      })
      .catch((err) => {
        resolve(null);
      });
  });

  if (res) {
    return {
      type: "json",
      code: 200,
      json: {
        result: "https://discord.gg/" + res,
      },
    };
  }
  return {
    type: "code",
    code: 204,
  };
}

/**
 * @swagger
 * /user/discord/{code}:
 *   post:
 *     summary: Link discord account with MyFab
 *     tags: [User]
 *     parameters:
 *     - name: dvflCookie
 *       in: header
 *       description: Cookie of the user making the request
 *       required: true
 *       type: string
 *     - name: "code"
 *       in: "path"
 *       description: "Discord tocken for the user"
 *       required: true
 *       type: string
 *     responses:
 *       200:
 *        description: "The user have link his account"
 *       400:
 *        description: "The body does not have all the necessary field"
 *       401:
 *        description: "The user is unauthenticated"
 *       403:
 *        description: "This discord account is already been used or an id is already set for this user or invalid code"
 *       500:
 *        description: "Internal error with the request"
 */

const DiscordOauth2 = require("discord-oauth2");
module.exports.setLinkDiscordAccount = setLinkDiscordAccount;
async function setLinkDiscordAccount(data) {
  if (!config.bot || !config.bot.clientId || !config.bot.clientSecret) {
    console.log("Discord link with MyFab not configured");
    return {
      type: "code",
      code: 500,
    };
  }

  const userId = data.userId;
  if (!userId) {
    return {
      type: "code",
      code: 401,
    };
  }

  // The body does not have all the necessary field
  const access_token = data.params.code;
  if (!access_token) {
    return {
      type: "code",
      code: 400,
    };
  }

  return await new Promise((resolve) => {
    data.getDiscordUser(
      {
        clientId: config.bot.clientId,
        clientSecret: config.bot.clientSecret,
        code: access_token,
        scope: "identify",
        grantType: "authorization_code",
        redirectUri: config.url.split(":")[0] + ":" + config.url.split(":")[1] + "/" + "discordConnection",
      },
      async (userDiscordData) => {
        const querySelect = `SELECT 1 FROM users
                                WHERE v_discordid = ?
                                OR (i_id = ?
                                AND v_discordid IS NOT NULL)`;

        const dbResSelect = await data.app.executeQuery(data.app.db, querySelect, [userDiscordData.id, userId]);
        if (dbResSelect[0]) {
          console.log(dbResSelect[0]);
          resolve({
            type: "code",
            code: 500,
          });
        }
        if (dbResSelect[1].length != 0) {
          resolve({
            type: "code",
            code: 403,
          });
        }

        const queryUpdate = `UPDATE users SET
                   v_discordid = ? WHERE
                   i_id = ?;`;

        const dbResUpdate = await data.app.executeQuery(data.app.db, queryUpdate, [userDiscordData.id, userId]);
        if (dbResUpdate[0]) {
          console.log(dbResUpdate[0]);
          resolve({
            type: "code",
            code: 500,
          });
        }
        resolve({
          type: "json",
          code: 200,
          json: {
            tag: userDiscordData.username + "#" + userDiscordData.discriminator,
            avatar: userDiscordData.avatar
              ? "https://cdn.discordapp.com/avatars/" + userDiscordData.id + "/" + userDiscordData.avatar + ".webp?size=128"
              : "https://external-preview.redd.it/4PE-nlL_PdMD5PrFNLnjurHQ1QKPnCvg368LTDnfM-M.png?auto=webp&s=ff4c3fbc1cce1a1856cff36b5d2a40a6d02cc1c3",
          },
        });
      },
      async () => {
        resolve({
          type: "code",
          code: 403,
        });
      }
    );
  });
}

module.exports.startApi = startApi;
async function startApi(app) {
  app.get("/api/user/", async function (req, res) {
    try {
      const data = await require("../functions/apiActions").prepareData(app, req, res);
      const result = await userGetAll(data);
      await require("../functions/apiActions").sendResponse(req, res, result);
    } catch (error) {
      console.log("ERROR: GET /api/user/");
      console.log(error);
      res.sendStatus(500);
    }
  });

  app.get("/api/user/me", async function (req, res) {
    try {
      const data = await require("../functions/apiActions").prepareData(app, req, res);
      const result = await userGetMe(data);
      await require("../functions/apiActions").sendResponse(req, res, result);
    } catch (error) {
      console.log("ERROR: GET /api/user/me");
      console.log(error);
      res.sendStatus(500);
    }
  });

  app.get("/api/user/:id", async function (req, res) {
    try {
      const data = await require("../functions/apiActions").prepareData(app, req, res);
      const result = await userGetById(data);
      await require("../functions/apiActions").sendResponse(req, res, result);
    } catch (error) {
      console.log("ERROR: GET /api/user/:id");
      console.log(error);
      res.sendStatus(500);
    }
  });

  app.delete("/api/user/:id", async function (req, res) {
    try {
      const data = await require("../functions/apiActions").prepareData(app, req, res);
      const result = await userDeleteById(data);
      await require("../functions/apiActions").sendResponse(req, res, result);
    } catch (error) {
      console.log("ERROR: DELETE /api/user/:id");
      console.log(error);
      res.sendStatus(500);
    }
  });

  app.put("/api/user/rename/:id", async function (req, res) {
    try {
      const data = await require("../functions/apiActions").prepareData(app, req, res);
      const result = await userRenamePut(data);
      await require("../functions/apiActions").sendResponse(req, res, result);
    } catch (error) {
      console.log("ERROR: PUT /api/user/rename/:id");
      console.log(error);
      res.sendStatus(500);
    }
  });

  app.get("/api/user/discord/link/", async function (req, res) {
    try {
      const data = {};
      const result = await getDicordLink(data);
      await require("../functions/apiActions").sendResponse(req, res, result);
    } catch (error) {
      console.log("ERROR: GET /api/user/discord/link/");
      console.log(error);
      res.sendStatus(500);
    }
  });

  app.get("/api/user/discord/serverInvite/", async function (req, res) {
    try {
      const data = {};
      const result = await getDicordInvite(data);
      await require("../functions/apiActions").sendResponse(req, res, result);
    } catch (error) {
      console.log("ERROR: GET /api/user/discord/serverInvite/");
      console.log(error);
      res.sendStatus(500);
    }
  });

  app.post("/api/user/discord/:code", async function (req, res) {
    try {
      const data = await require("../functions/apiActions").prepareData(app, req, res);
      data.getDiscordUser = async (data, callback, callbackError) => {
        await new Promise((resolve) => {
          const oauth = new DiscordOauth2();
          oauth
            .tokenRequest(data)
            .then((result) => {
              oauth
                .getUser(result.access_token)
                .then(async (userDiscordData) => {
                  resolve(await callback(userDiscordData));
                })
                .catch(async () => {
                  resolve(await callbackError());
                });
            })
            .catch(async () => {
              resolve(await callbackError());
            });
        });
      };
      const result = await setLinkDiscordAccount(data);
      await require("../functions/apiActions").sendResponse(req, res, result);
    } catch (error) {
      console.log("ERROR: POST /api/user/discord/:code");
      console.log(error);
      res.sendStatus(500);
    }
  });
}
