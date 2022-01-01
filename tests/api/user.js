const axios = require('axios');
const config = require('../../config.json');


module.exports.getAll = {
    test200: async (db, executeQuery) => {
        const userData = await require('../createNewUserAndLog').createNewUserAndLog(db, executeQuery, "getAllGood");
        await executeQuery(db, 'INSERT INTO `rolescorrelation` (`i_idUser`, `i_idRole`) VALUES (?, (SELECT i_id FROM `gd_roles` WHERE v_name = "roleViewUsers"))', [userData[0]]);
        return await new Promise((resolve, reject) => {
            axios({
                method: 'get',
                url: config.url + config.port + '/api/user',
                headers: {
                    'dvflCookie': userData[1]
                }
            }).then(function (response) {
                if (response.status !== 200) {
                    console.log("code !== 200");
                    return resolve(false);
                }
                if (!Array.isArray(response.data)) {
                    console.log("response.data is not an array");
                    return resolve(false);
                }
                if (response.data.length < 1) {
                    console.log("response.data is empty");
                    return resolve(false);
                }
                if (!response.data[0]["id"]) {
                    console.log("response.data[0]['id'] doesn't exist");
                    return resolve(false);
                }
                if (!response.data[0]["firstName"]) {
                    console.log("response.data[0]['firstName'] doesn't exist");
                    return resolve(false);
                }
                if (!response.data[0]["lastName"]) {
                    console.log("response.data[0]['lastName'] doesn't exist");
                    return resolve(false);
                }
                if (!response.data[0]["email"]) {
                    console.log("response.data[0]['email'] doesn't exist");
                    return resolve(false);
                }
                return resolve(true);
            }).catch(async function (err) {
                console.log("test200 get an error : " + err.response.status);
                return resolve(false);
            });
        });
    },
    testNoHeader: async (db, executeQuery) => {
        const userData = await require('../createNewUserAndLog').createNewUserAndLog(db, executeQuery, "getAllWithoutHeader");
        await executeQuery(db, 'INSERT INTO `rolescorrelation` (`i_idUser`, `i_idRole`) VALUES (?, (SELECT i_id FROM `gd_roles` WHERE v_name = "roleViewUsers"))', [userData[0]]);
        return await new Promise((resolve, reject) => {
            axios({
                method: 'get',
                url: config.url + config.port + '/api/user'
            }).then(function (response) {
                console.log("The request has been accepted but it should not");
                return resolve(false);
            }).catch(async function (err) {
                if (err.response.status !== 401) {
                    console.log("testNoHeader get an error : " + err.response.status);
                    return resolve(false);
                }
                return resolve(true);
            });
        });
    },
    testNoValidDvflCookie: async (db, executeQuery) => {
        const userData = await require('../createNewUserAndLog').createNewUserAndLog(db, executeQuery, "getAllWithoutValidCookie");
        await executeQuery(db, 'INSERT INTO `rolescorrelation` (`i_idUser`, `i_idRole`) VALUES (?, (SELECT i_id FROM `gd_roles` WHERE v_name = "roleViewUsers"))', [userData[0]]);
        return await new Promise((resolve, reject) => {
            axios({
                method: 'get',
                url: config.url + config.port + '/api/user',
                headers: {
                    'dvflCookie': "wrongCookie"
                }
            }).then(function (response) {
                console.log("The request has been accepted but it should not");
                return resolve(false);
            }).catch(async function (err) {
                if (err.response.status !== 401) {
                    console.log("testNoValidDvflCookie get an error : " + err.response.status);
                    return resolve(false);
                }
                return resolve(true);
            });
        });
    },
    testWithoutAuthorization: async (db, executeQuery) => {
        const userData = await require('../createNewUserAndLog').createNewUserAndLog(db, executeQuery, "getAllWithoutAuthorization");
        return await new Promise((resolve, reject) => {
            axios({
                method: 'get',
                url: config.url + config.port + '/api/user',
                headers: {
                    'dvflCookie': userData[1]
                }
            }).then(function (response) {
                console.log("The request has been accepted but it should not");
                return resolve(false);
            }).catch(async function (err) {
                if (err.response.status !== 403) {
                    console.log("testWithoutAuthorization get an error : " + err.response.status);
                    return resolve(false);
                }
                return resolve(true);
            });
        });
    }
}

module.exports.getMe = {
    test200: async (db, executeQuery) => {
        const userData = await require('../createNewUserAndLog').createNewUserAndLog(db, executeQuery, "getMeGood");
        return await new Promise((resolve, reject) => {
            axios({
                method: 'get',
                url: config.url + config.port + '/api/user/me',
                headers: {
                    'dvflCookie': userData[1]
                }
            }).then(function (response) {
                if (response.status !== 200) {
                    console.log("code !== 200");
                    return resolve(false);
                }
                if (Object.prototype.toString.call(response.data) != "[object Object]") {
                    console.log("response.data is not an object");
                    return resolve(false);
                }
                if (Object.keys(response.data).length < 1) {
                    console.log("response.data is empty");
                    return resolve(false);
                }
                if (response.data["id"] === undefined) {
                    console.log("response.data['id'] doesn't exist");
                    return resolve(false);
                }
                if (response.data["id"] !== userData[0]) {
                    console.log("response.data['id'] doesn't have the good value");
                    return resolve(false);
                }
                if (response.data["firstName"] === undefined) {
                    console.log("response.data['firstName'] doesn't exist");
                    return resolve(false);
                }
                if (response.data["lastName"] === undefined) {
                    console.log("response.data['lastName'] doesn't exist");
                    return resolve(false);
                }
                if (response.data["email"] === undefined) {
                    console.log("response.data['email'] doesn't exist");
                    return resolve(false);
                }
                if (response.data["creationDate"] === undefined) {
                    console.log("response.data['creationDate'] doesn't exist");
                    return resolve(false);
                }
                if (response.data["discordid"] === undefined) {
                    console.log("response.data['discordid'] doesn't exist");
                    return resolve(false);
                }
                if (response.data["language"] === undefined) {
                    console.log("response.data['language'] doesn't exist");
                    return resolve(false);
                }
                if (response.data["acceptedRule"] === undefined) {
                    console.log("response.data['acceptedRule'] doesn't exist");
                    return resolve(false);
                }
                if (response.data["mailValidated"] === undefined) {
                    console.log("response.data['mailValidated'] doesn't exist");
                    return resolve(false);
                }
                return resolve(true);
            }).catch(async function (err) {
                console.log("test200 get an error : " + err.response.status);
                return resolve(false);
            });
        });
    },
    testNoHeader: async (db, executeQuery) => {
        const userData = await require('../createNewUserAndLog').createNewUserAndLog(db, executeQuery, "getMeWithoutHeader");
        return await new Promise((resolve, reject) => {
            axios({
                method: 'get',
                url: config.url + config.port + '/api/user/me'
            }).then(function (response) {
                console.log("The request has been accepted but it should not");
                return resolve(false);
            }).catch(async function (err) {
                if (err.response.status !== 401) {
                    console.log("testNoHeader get an error : " + err.response.status);
                    return resolve(false);
                }
                return resolve(true);
            });
        });
    },
    testNoValidDvflCookie: async (db, executeQuery) => {
        const userData = await require('../createNewUserAndLog').createNewUserAndLog(db, executeQuery, "getMeWithoutValidCookie");
        return await new Promise((resolve, reject) => {
            axios({
                method: 'get',
                url: config.url + config.port + '/api/user/me',
                headers: {
                    'dvflCookie': "wrongCookie"
                }
            }).then(function (response) {
                console.log("The request has been accepted but it should not");
                return resolve(false);
            }).catch(async function (err) {
                if (err.response.status !== 401) {
                    console.log("testNoValidDvflCookie get an error : " + err.response.status);
                    return resolve(false);
                }
                return resolve(true);
            });
        });
    }
}

module.exports.getWithId = {
    test200: async (db, executeQuery) => {
        const userData = await require('../createNewUserAndLog').createNewUserAndLog(db, executeQuery, "getWithIdGood");
        await executeQuery(db, 'INSERT INTO `rolescorrelation` (`i_idUser`, `i_idRole`) VALUES (?, (SELECT i_id FROM `gd_roles` WHERE v_name = "roleViewUsers"))', [userData[0]]);
        return await new Promise((resolve, reject) => {
            axios({
                method: 'get',
                url: config.url + config.port + '/api/user/1',
                headers: {
                    'dvflCookie': userData[1]
                }
            }).then(function (response) {
                if (response.status !== 200) {
                    console.log("code !== 200");
                    return resolve(false);
                }
                if (Object.prototype.toString.call(response.data) != "[object Object]") {
                    console.log("response.data is not an object");
                    return resolve(false);
                }
                if (Object.keys(response.data).length < 1) {
                    console.log("response.data is empty");
                    return resolve(false);
                }
                if (response.data["id"] === undefined) {
                    console.log("response.data['id'] doesn't exist");
                    return resolve(false);
                }
                if (response.data["firstName"] === undefined) {
                    console.log("response.data['firstName'] doesn't exist");
                    return resolve(false);
                }
                if (response.data["lastName"] === undefined) {
                    console.log("response.data['lastName'] doesn't exist");
                    return resolve(false);
                }
                if (response.data["email"] === undefined) {
                    console.log("response.data['email'] doesn't exist");
                    return resolve(false);
                }
                if (response.data["creationDate"] === undefined) {
                    console.log("response.data['creationDate'] doesn't exist");
                    return resolve(false);
                }
                if (response.data["discordid"] === undefined) {
                    console.log("response.data['discordid'] doesn't exist");
                    return resolve(false);
                }
                if (response.data["language"] === undefined) {
                    console.log("response.data['language'] doesn't exist");
                    return resolve(false);
                }
                if (response.data["acceptedRule"] === undefined) {
                    console.log("response.data['acceptedRule'] doesn't exist");
                    return resolve(false);
                }
                if (response.data["mailValidated"] === undefined) {
                    console.log("response.data['mailValidated'] doesn't exist");
                    return resolve(false);
                }
                return resolve(true);
            }).catch(async function (err) {
                console.log("test200 get an error : " + err.response.status);
                return resolve(false);
            });
        });
    },
    testNoHeader: async (db, executeQuery) => {
        const userData = await require('../createNewUserAndLog').createNewUserAndLog(db, executeQuery, "getWithIdWithoutHeader");
        await executeQuery(db, 'INSERT INTO `rolescorrelation` (`i_idUser`, `i_idRole`) VALUES (?, (SELECT i_id FROM `gd_roles` WHERE v_name = "roleViewUsers"))', [userData[0]]);
        return await new Promise((resolve, reject) => {
            axios({
                method: 'get',
                url: config.url + config.port + '/api/user/1'
            }).then(function (response) {
                console.log("The request has been accepted but it should not");
                return resolve(false);
            }).catch(async function (err) {
                if (err.response.status !== 401) {
                    console.log("testNoHeader get an error : " + err.response.status);
                    return resolve(false);
                }
                return resolve(true);
            });
        });
    },
    testNoValidDvflCookie: async (db, executeQuery) => {
        const userData = await require('../createNewUserAndLog').createNewUserAndLog(db, executeQuery, "getWithIdWithoutValidCookie");
        await executeQuery(db, 'INSERT INTO `rolescorrelation` (`i_idUser`, `i_idRole`) VALUES (?, (SELECT i_id FROM `gd_roles` WHERE v_name = "roleViewUsers"))', [userData[0]]);
        return await new Promise((resolve, reject) => {
            axios({
                method: 'get',
                url: config.url + config.port + '/api/user/1',
                headers: {
                    'dvflCookie': "wrongCookie"
                }
            }).then(function (response) {
                console.log("The request has been accepted but it should not");
                return resolve(false);
            }).catch(async function (err) {
                if (err.response.status !== 401) {
                    console.log("testNoValidDvflCookie get an error : " + err.response.status);
                    return resolve(false);
                }
                return resolve(true);
            });
        });
    },
    testWithoutAuthorization: async (db, executeQuery) => {
        const userData = await require('../createNewUserAndLog').createNewUserAndLog(db, executeQuery, "getWithIdWithoutAuthorization");
        return await new Promise((resolve, reject) => {
            axios({
                method: 'get',
                url: config.url + config.port + '/api/user/1',
                headers: {
                    'dvflCookie': userData[1]
                }
            }).then(function (response) {
                console.log("The request has been accepted but it should not");
                return resolve(false);
            }).catch(async function (err) {
                if (err.response.status !== 403) {
                    console.log("testWithoutAuthorization get an error : " + err.response.status);
                    return resolve(false);
                }
                return resolve(true);
            });
        });
    }
}

module.exports.deleteWithId = {
    test200: async (db, executeQuery) => {
        const userData = await require('../createNewUserAndLog').createNewUserAndLog(db, executeQuery, "deleteWithIdGoodAgent");
        const userToDeleteData = await require('../createNewUserAndLog').createNewUserAndLog(db, executeQuery, "deleteWithIdGoodNeedToDelete");
        await executeQuery(db, 'INSERT INTO `rolescorrelation` (`i_idUser`, `i_idRole`) VALUES (?, (SELECT i_id FROM `gd_roles` WHERE v_name = "roleViewUsers"))', [userData[0]]);
        await executeQuery(db, 'INSERT INTO `rolescorrelation` (`i_idUser`, `i_idRole`) VALUES (?, (SELECT i_id FROM `gd_roles` WHERE v_name = "roleManageUser"))', [userData[0]]);
        return await new Promise((resolve, reject) => {
            axios({
                method: 'delete',
                url: config.url + config.port + '/api/user/' + userToDeleteData[0],
                headers: {
                    'dvflCookie': userData[1]
                }
            }).then(async function (response) {
                if (response.status !== 200) {
                    console.log("code !== 200");
                    return resolve(false);
                }
                const res = await executeQuery(db, 'SELECT `b_deleted` FROM `users` WHERE `i_id` = ?', [userToDeleteData[0]]);
                if (res[0] || res[1].length !== 1 || res[1][0].b_deleted !== 1) {
                    console.log("The user is not deleted");
                    return resolve(false);
                }
                return resolve(true);
            }).catch(async function (err) {
                console.log("test200 get an error : " + err.response.status);
                return resolve(false);
            });
        });
    },
    testNoHeader: async (db, executeQuery) => {
        const userData = await require('../createNewUserAndLog').createNewUserAndLog(db, executeQuery, "deleteWithIdWithoutHeaderAgent");
        const userToDeleteData = await require('../createNewUserAndLog').createNewUserAndLog(db, executeQuery, "deleteWithIdWithoutHeaderNeedToDelete");
        await executeQuery(db, 'INSERT INTO `rolescorrelation` (`i_idUser`, `i_idRole`) VALUES (?, (SELECT i_id FROM `gd_roles` WHERE v_name = "roleViewUsers"))', [userData[0]]);
        await executeQuery(db, 'INSERT INTO `rolescorrelation` (`i_idUser`, `i_idRole`) VALUES (?, (SELECT i_id FROM `gd_roles` WHERE v_name = "roleManageUser"))', [userData[0]]);
        return await new Promise((resolve, reject) => {
            axios({
                method: 'delete',
                url: config.url + config.port + '/api/user/' + userToDeleteData[0]
            }).then(function (response) {
                console.log("The request has been accepted but it should not");
                return resolve(false);
            }).catch(async function (err) {
                if (err.response.status !== 401) {
                    console.log("testNoHeader get an error : " + err.response.status);
                    return resolve(false);
                }
                const res = await executeQuery(db, 'SELECT `b_deleted` FROM `users` WHERE `i_id` = ?', [userToDeleteData[0]]);
                if (res[0] || res[1].length !== 1 || res[1][0].b_deleted !== 0) {
                    console.log("The user is deleted (when en error is throw)");
                    return resolve(false);
                }
                return resolve(true);
            });
        });
    },
    testNoValidDvflCookie: async (db, executeQuery) => {
        const userData = await require('../createNewUserAndLog').createNewUserAndLog(db, executeQuery, "deleteWithIdWithoutValidCookieAgent");
        const userToDeleteData = await require('../createNewUserAndLog').createNewUserAndLog(db, executeQuery, "deleteWithIdWithoutValidCookieNeedToDelete");
        await executeQuery(db, 'INSERT INTO `rolescorrelation` (`i_idUser`, `i_idRole`) VALUES (?, (SELECT i_id FROM `gd_roles` WHERE v_name = "roleViewUsers"))', [userData[0]]);
        await executeQuery(db, 'INSERT INTO `rolescorrelation` (`i_idUser`, `i_idRole`) VALUES (?, (SELECT i_id FROM `gd_roles` WHERE v_name = "roleManageUser"))', [userData[0]]);
        return await new Promise((resolve, reject) => {
            axios({
                method: 'delete',
                url: config.url + config.port + '/api/user/' + userToDeleteData[0],
                headers: {
                    'dvflCookie': "wrongCookie"
                }
            }).then(function (response) {
                console.log("The request has been accepted but it should not");
                return resolve(false);
            }).catch(async function (err) {
                if (err.response.status !== 401) {
                    console.log("testNoValidDvflCookie get an error : " + err.response.status);
                    return resolve(false);
                }
                const res = await executeQuery(db, 'SELECT `b_deleted` FROM `users` WHERE `i_id` = ?', [userToDeleteData[0]]);
                if (res[0] || res[1].length !== 1 || res[1][0].b_deleted !== 0) {
                    console.log("The user is deleted (when en error is throw)");
                    return resolve(false);
                }
                return resolve(true);
            });
        });
    },
    testWithoutRoleViewUsersAuthorization: async (db, executeQuery) => {
        const userData = await require('../createNewUserAndLog').createNewUserAndLog(db, executeQuery, "deleteWithIdWithoutRoleViewUsersAuthorizationAgent");
        const userToDeleteData = await require('../createNewUserAndLog').createNewUserAndLog(db, executeQuery, "deleteWithIdWithoutRoleViewUsersAuthorizationNeedToDelete");
        await executeQuery(db, 'INSERT INTO `rolescorrelation` (`i_idUser`, `i_idRole`) VALUES (?, (SELECT i_id FROM `gd_roles` WHERE v_name = "roleManageUser"))', [userData[0]]);
        return await new Promise((resolve, reject) => {
            axios({
                method: 'delete',
                url: config.url + config.port + '/api/user/' + userToDeleteData[0],
                headers: {
                    'dvflCookie': userData[1]
                }
            }).then(function (response) {
                console.log("The request has been accepted but it should not");
                return resolve(false);
            }).catch(async function (err) {
                if (err.response.status !== 403) {
                    console.log("testWithoutRoleViewUsersAuthorization get an error : " + err.response.status);
                    return resolve(false);
                }
                const res = await executeQuery(db, 'SELECT `b_deleted` FROM `users` WHERE `i_id` = ?', [userToDeleteData[0]]);
                if (res[0] || res[1].length !== 1 || res[1][0].b_deleted !== 0) {
                    console.log("The user is deleted (when en error is throw)");
                    return resolve(false);
                }
                return resolve(true);
            });
        });
    },
    testWithoutRoleManageUserAuthorization: async (db, executeQuery) => {
        const userData = await require('../createNewUserAndLog').createNewUserAndLog(db, executeQuery, "deleteWithIdWithoutRoleManageUserAuthorizationAgent");
        const userToDeleteData = await require('../createNewUserAndLog').createNewUserAndLog(db, executeQuery, "deleteWithIdWithoutRoleManageUserAuthorizationNeedToDelete");
        await executeQuery(db, 'INSERT INTO `rolescorrelation` (`i_idUser`, `i_idRole`) VALUES (?, (SELECT i_id FROM `gd_roles` WHERE v_name = "roleViewUsers"))', [userData[0]]);
        return await new Promise((resolve, reject) => {
            axios({
                method: 'delete',
                url: config.url + config.port + '/api/user/' + userToDeleteData[0],
                headers: {
                    'dvflCookie': userData[1]
                }
            }).then(function (response) {
                console.log("The request has been accepted but it should not");
                return resolve(false);
            }).catch(async function (err) {
                if (err.response.status !== 403) {
                    console.log("testWithoutRoleManageUserAuthorization get an error : " + err.response.status);
                    return resolve(false);
                }
                const res = await executeQuery(db, 'SELECT `b_deleted` FROM `users` WHERE `i_id` = ?', [userToDeleteData[0]]);
                if (res[0] || res[1].length !== 1 || res[1][0].b_deleted !== 0) {
                    console.log("The user is deleted (when en error is throw)");
                    return resolve(false);
                }
                return resolve(true);
            });
        });
    },
    testWithIdNan: async (db, executeQuery) => {
        const userData = await require('../createNewUserAndLog').createNewUserAndLog(db, executeQuery, "deleteWithIdNanAgent");
        const userToDeleteData = await require('../createNewUserAndLog').createNewUserAndLog(db, executeQuery, "deleteWithIdNanNeedToDelete");
        await executeQuery(db, 'INSERT INTO `rolescorrelation` (`i_idUser`, `i_idRole`) VALUES (?, (SELECT i_id FROM `gd_roles` WHERE v_name = "roleViewUsers"))', [userData[0]]);
        await executeQuery(db, 'INSERT INTO `rolescorrelation` (`i_idUser`, `i_idRole`) VALUES (?, (SELECT i_id FROM `gd_roles` WHERE v_name = "roleManageUser"))', [userData[0]]);
        return await new Promise((resolve, reject) => {
            axios({
                method: 'delete',
                url: config.url + config.port + '/api/user/IntNaN',
                headers: {
                    'dvflCookie': userData[1]
                }
            }).then(async function (response) {
                console.log("The request has been accepted but it should not");
                return resolve(false);
            }).catch(async function (err) {
                if (err.response.status !== 400) {
                    console.log("testWithIdNan get an error : " + err.response.status);
                    return resolve(false);
                }
                const res = await executeQuery(db, 'SELECT `b_deleted` FROM `users` WHERE `i_id` = ?', [userToDeleteData[0]]);
                if (res[0] || res[1].length !== 1 || res[1][0].b_deleted !== 0) {
                    console.log("The user is deleted (when en error is throw)");
                    return resolve(false);
                }
                return resolve(true);
            });
        });
    },
    testWithIdAgent: async (db, executeQuery) => {
        const userData = await require('../createNewUserAndLog').createNewUserAndLog(db, executeQuery, "deleteWithIdAgentAgent");
        const userToDeleteData = await require('../createNewUserAndLog').createNewUserAndLog(db, executeQuery, "deleteWithIdAgentNeedToDelete");
        await executeQuery(db, 'INSERT INTO `rolescorrelation` (`i_idUser`, `i_idRole`) VALUES (?, (SELECT i_id FROM `gd_roles` WHERE v_name = "roleViewUsers"))', [userData[0]]);
        await executeQuery(db, 'INSERT INTO `rolescorrelation` (`i_idUser`, `i_idRole`) VALUES (?, (SELECT i_id FROM `gd_roles` WHERE v_name = "roleManageUser"))', [userData[0]]);
        return await new Promise((resolve, reject) => {
            axios({
                method: 'delete',
                url: config.url + config.port + '/api/user/' + userData[0],
                headers: {
                    'dvflCookie': userData[1]
                }
            }).then(async function (response) {
                console.log("The request has been accepted but it should not");
                return resolve(false);
            }).catch(async function (err) {
                if (err.response.status !== 400) {
                    console.log("testWithIdAgent get an error : " + err.response.status);
                    return resolve(false);
                }
                const res = await executeQuery(db, 'SELECT `b_deleted` FROM `users` WHERE `i_id` = ?', [userToDeleteData[0]]);
                if (res[0] || res[1].length !== 1 || res[1][0].b_deleted !== 0) {
                    console.log("The user is deleted (when en error is throw)");
                    return resolve(false);
                }
                return resolve(true);
            });
        });
    },
    testWithIdUnKnown: async (db, executeQuery) => {
        const userData = await require('../createNewUserAndLog').createNewUserAndLog(db, executeQuery, "deleteWithIdUnKnownAgent");
        await executeQuery(db, 'INSERT INTO `rolescorrelation` (`i_idUser`, `i_idRole`) VALUES (?, (SELECT i_id FROM `gd_roles` WHERE v_name = "roleViewUsers"))', [userData[0]]);
        await executeQuery(db, 'INSERT INTO `rolescorrelation` (`i_idUser`, `i_idRole`) VALUES (?, (SELECT i_id FROM `gd_roles` WHERE v_name = "roleManageUser"))', [userData[0]]);
        return await new Promise((resolve, reject) => {
            axios({
                method: 'delete',
                url: config.url + config.port + '/api/user/' + 10000000000000000000000000000000000000000000000000000000000,
                headers: {
                    'dvflCookie': userData[1]
                }
            }).then(async function (response) {
                if (response.status !== 204) {
                    console.log("testWithIdUnKnown get an incorrect response code : " + response.status);
                    return resolve(false);
                }
                return resolve(true);
            }).catch(async function (err) {
                console.log("testWithIdUnKnown get an error : " + err.response.status);
                return resolve(false);
            });
        });
    }
}