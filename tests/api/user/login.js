const axios = require('axios');
const config = require('../../../config.json');


module.exports.loginAUser = {
    test200: async (db, executeQuery) => {
        const user = "postLogin" + "Good"
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