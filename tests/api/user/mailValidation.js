const axios = require('axios');
const config = require('../../../config.json');


module.exports.mailValidation = {
    test200: async (db, executeQuery) => {
        const user = "put" + "Good";
        const resInsertNewAccount = await app.executeQuery(app.db, "INSERT INTO `users` (`v_firstName`, `v_lastName`, `v_email`, `v_password`, `v_language`) VALUES (firstNameTest, lastNameTest, ?, '473287f8298dba7163a897908958f7c0eae733e25d2e027992ea2edc9bed2fa8', 'fr');", [userName + "@test.com"]);
        const resGetIdUserInserted = await app.executeQuery(app.db, "SELECT LAST_INSERT_ID() AS 'id';", []);
        const resInsertTocken = await app.executeQuery(app.db, "INSERT INTO `mailtocken` (`i_idUser`, `v_value`, `b_mailSend`) VALUES (?, ?, 1);", [resGetIdUserInserted[1][0].id, user]);

        return await new Promise((resolve, reject) => {
            axios({
                method: 'post',
                url: config.url + config.port + '/api/user/login',
                headers: {
                    'dvflCookie': userData[1]
                },
                data: {
                    email: user + "@test.com",
                    password: "string"
                }
            }).then(async function (response) {
                if (response.status !== 200) {
                    console.log("code !== 200");
                    return resolve(false);
                }
                if (!response.data.dvflCookie) {
                    console.log("response.data.dvflCookie doesn't exist");
                    return resolve(false);
                }
                return resolve(true);
            }).catch(async function (err) {
                console.log("test200 get an error : " + err.response.status);
                return resolve(false);
            });
        });
    },
    testEmailMissing: async (db, executeQuery) => {
        const user = "postLogin" + "EmailMissing"
        const userData = await require('../../createNewUserAndLog').createNewUserAndLog(db, executeQuery, user);
        return await new Promise((resolve, reject) => {
            axios({
                method: 'post',
                url: config.url + config.port + '/api/user/login',
                headers: {
                    'dvflCookie': userData[1]
                },
                data: {
                    password: "string"
                }
            }).then(async function (response) {
                console.log("The request has been accepted but it should not");
                return resolve(false);
            }).catch(async function (err) {
                if (err.response.status !== 400) {
                    console.log("testEmailMissing get an error : " + err.response.status);
                    return resolve(false);
                }
                return resolve(true);
            });
        });
    },
    testPasswordMissing: async (db, executeQuery) => {
        const user = "postLogin" + "PasswordMissing"
        const userData = await require('../../createNewUserAndLog').createNewUserAndLog(db, executeQuery, user);
        return await new Promise((resolve, reject) => {
            axios({
                method: 'post',
                url: config.url + config.port + '/api/user/login',
                headers: {
                    'dvflCookie': userData[1]
                },
                data: {
                    email: user + "@test.com",
                }
            }).then(async function (response) {
                console.log("The request has been accepted but it should not");
                return resolve(false);
            }).catch(async function (err) {
                if (err.response.status !== 400) {
                    console.log("testPasswordMissing get an error : " + err.response.status);
                    return resolve(false);
                }
                return resolve(true);
            });
        });
    },
    testEmailAndPasswordMissing: async (db, executeQuery) => {
        const user = "postLogin" + "EmailAndPasswordMissing"
        const userData = await require('../../createNewUserAndLog').createNewUserAndLog(db, executeQuery, user);
        return await new Promise((resolve, reject) => {
            axios({
                method: 'post',
                url: config.url + config.port + '/api/user/login',
                headers: {
                    'dvflCookie': userData[1]
                },
                data: {}
            }).then(async function (response) {
                console.log("The request has been accepted but it should not");
                return resolve(false);
            }).catch(async function (err) {
                if (err.response.status !== 400) {
                    console.log("EmailAndPasswordMissing get an error : " + err.response.status);
                    return resolve(false);
                }
                return resolve(true);
            });
        });
    },
    testEmailInvalid: async (db, executeQuery) => {
        const user = "postLogin" + "EmailInvalid"
        const userData = await require('../../createNewUserAndLog').createNewUserAndLog(db, executeQuery, user);
        return await new Promise((resolve, reject) => {
            axios({
                method: 'post',
                url: config.url + config.port + '/api/user/login',
                headers: {
                    'dvflCookie': userData[1]
                },
                data: {
                    email: "InvalidEmail@test.com",
                    password: "string"
                }
            }).then(async function (response) {
                console.log("The request has been accepted but it should not");
                return resolve(false);
            }).catch(async function (err) {
                if (err.response.status !== 401) {
                    console.log("EmailInvalid get an error : " + err.response.status);
                    return resolve(false);
                }
                return resolve(true);
            });
        });
    },
    testPasswordInvalid: async (db, executeQuery) => {
        const user = "postLogin" + "PasswordInvalid"
        const userData = await require('../../createNewUserAndLog').createNewUserAndLog(db, executeQuery, user);
        return await new Promise((resolve, reject) => {
            axios({
                method: 'post',
                url: config.url + config.port + '/api/user/login',
                headers: {
                    'dvflCookie': userData[1]
                },
                data: {
                    email: user + "@test.com",
                    password: "WrongPassword"
                }
            }).then(async function (response) {
                console.log("The request has been accepted but it should not");
                return resolve(false);
            }).catch(async function (err) {
                if (err.response.status !== 401) {
                    console.log("PasswordInvalid get an error : " + err.response.status);
                    return resolve(false);
                }
                return resolve(true);
            });
        });
    },
    testEmailAndPasswordInvalid: async (db, executeQuery) => {
        const user = "postLogin" + "EmailAndPasswordInvalid"
        const userData = await require('../../createNewUserAndLog').createNewUserAndLog(db, executeQuery, user);
        return await new Promise((resolve, reject) => {
            axios({
                method: 'post',
                url: config.url + config.port + '/api/user/login',
                headers: {
                    'dvflCookie': userData[1]
                },
                data: {
                    email: "InvalidEmail@test.com",
                    password: "WrongPassword"
                }
            }).then(async function (response) {
                console.log("The request has been accepted but it should not");
                return resolve(false);
            }).catch(async function (err) {
                if (err.response.status !== 401) {
                    console.log("EmailAndPasswordInvalid get an error : " + err.response.status);
                    return resolve(false);
                }
                return resolve(true);
            });
        });
    }
}