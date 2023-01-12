const passport = require("passport");
const saml = require("passport-saml");
const fs = require("fs");
const sha256 = require("sha256");
const config = require("../../config.json");
const pendingUsers = {};

function makeid(length) {
  var result = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

var samlStrategy = new saml.Strategy(
  {
    //entityID: "http://app.example.com",
    // URL that goes from the Identity Provider -> Service Provider
    callbackUrl: "/api/user/login/adfs/callback",
    // URL that goes from the Service Provider -> Identity Provider
    entryPoint: config.adsf.entryPoint,
    issuer: config.adsf.issuer,
    cert: fs.readFileSync(__dirname + "/../../data/cert", "utf8"), // cert must be provided
  },
  function (profile, done) {
    return done(null, profile);
  }
);
passport.use(samlStrategy);

/**
 * @swagger
 * /user/login/adfs/:
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

module.exports.postLoginADFS = postLoginADFS;
async function postLoginADFS(data) {
  const myFabOpen = JSON.parse(fs.readFileSync(__dirname + "/../../data/serviceData.json")).myFabOpen;
  if (!myFabOpen) {
    return {
      type: "code",
      code: 403,
    };
  }

  if (!data.body || !data.body.token || !pendingUsers[data.body.token]) {
    return {
      type: "code",
      code: 400,
    };
  }

  const user = pendingUsers[data.body.token].user;

  const firstName = "test";
  const lastName = "test";
  const email = user.email;
  const title = "test title";
  if (!firstName || !lastName || !email || !title) {
    console.log("Error with adfs get user info");
    console.log(pendingUsers[data.body.token]);
    return {
      type: "code",
      code: 400,
    };
  }

  const dbRes = await data.app.executeQuery(data.app.db, "SELECT `i_id` AS 'id', `v_title` AS 'title' FROM `users` WHERE `v_email` = ?;", [email]);
  // Error with the sql request
  if (dbRes[0]) {
    console.log(dbRes[0]);
    return resolve({
      type: "code",
      code: 500,
    });
  }

  if (dbRes[1].length < 1) {
    //On doit créer un compte
    const language = data.body.language ? data.body.language : "fr";
    const resInsertNewAccount = await data.app.executeQuery(
      data.app.db,
      "INSERT INTO `users` (`v_firstName`, `v_lastName`, `v_email`, `v_password`, `v_language`, `v_title`, `b_isMicrosoft`, `b_mailValidated`) VALUES (?, ?, ?, ?, ?, ?, 1, 1);",
      [firstName, lastName, email, sha256(data.body.token), language, title]
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

    return {
      type: "json",
      code: 200,
      json: {
        dvflCookie: cookie,
      },
    };
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
  if (dbRes[1][0].title !== title) {
    await data.app.executeQuery(data.app.db, "UPDATE `users` SET `v_title` = ? WHERE `i_id` = ?;", [title, id]);
  }

  const cookie = await require("../../functions/apiActions").saveNewCookie(data.app, { id, email });

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
  app.use(passport.initialize());

  app.get("/api/user/login/adfs/", passport.authenticate("saml", { failureRedirect: "/login/fail" }), function (req, res) {
    res.redirect(`${config.siteRoot}/auth/adfs/`);
  });

  app.post("/api/user/login/adfs/", async (req, res) => {
    try {
      const data = await require("../../functions/apiActions").prepareData(app, req, res);
      const result = await postLoginADFS(data);
      await require("../../functions/apiActions").sendResponse(req, res, result);
    } catch (error) {
      console.log("ERROR: POST /api/user/login/adfs/");
      console.log(error);
      res.sendStatus(500);
    }
  });

  app.post("/api/user/login/adfs/callback", passport.authenticate("saml", { failureRedirect: "/login/fail" }), function (req, res) {
    const id = makeid(20);
    pendingUsers[id] = req.session.passport;
    res.redirect(`${config.siteRoot}/auth/adfs/${id}`);
  });
}
