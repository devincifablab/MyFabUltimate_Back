const config = require('../../config.json');
const executeQuery = require("../../functions/dataBase/executeQuery").run;
let db;

beforeAll(async () => {
    db = await require("../../functions/dataBase/createConnection").open();
});

afterAll(() => {
    db.end();
})


describe('GET /api/user/', () => {
    test('200', async () => {
        const user = "userGetAllGood";
        const userData = await require('../createNewUserAndLog').createNewUserAndLog(db, executeQuery, user);
        expect(userData, "User '" + user + "' already exist").not.toBe(0);
        await executeQuery(db, 'INSERT INTO `rolescorrelation` (`i_idUser`, `i_idRole`) VALUES (?, (SELECT i_id FROM `gd_roles` WHERE v_name = "roleViewUsers"))', [userData]);

        const data = {
            userId: userData,
            userAuthorization: {
                validateUserAuth: async (app, userIdAgent, authName) => {
                    return true
                }
            },
            app: {
                db: db,
                executeQuery: executeQuery
            }
        }
        const response = await require("../../api/user").userGetAll(data)

        expect(response.code).toBe(200);
        expect(response.type).toBe("json");
        expect(Array.isArray(response.json)).toBe(true);
        expect(response.json.length).toBeGreaterThanOrEqual(1);
        expect(response.json[0]["id"] != null).toBe(true);
        expect(response.json[0]["firstName"] != null).toBe(true);
        expect(response.json[0]["lastName"] != null).toBe(true);
        expect(response.json[0]["email"] != null).toBe(true);
    })

    test('401-userIsUnauthenticated', async () => {
        const user = "userGetAllGoodWithoutValidUser";
        const userData = await require('../createNewUserAndLog').createNewUserAndLog(db, executeQuery, user);
        expect(userData, "User '" + user + "' already exist").not.toBe(0);
        await executeQuery(db, 'INSERT INTO `rolescorrelation` (`i_idUser`, `i_idRole`) VALUES (?, (SELECT i_id FROM `gd_roles` WHERE v_name = "roleViewUsers"))', [userData]);

        const data = {}
        const response = await require("../../api/user").userGetAll(data)

        expect(response.code).toBe(401);
        expect(response.type).toBe("code");
    })

    test('403-noViewUsersAuth', async () => {
        const user = "userGetAllGoodWithUserNotAuthorised";
        const userData = await require('../createNewUserAndLog').createNewUserAndLog(db, executeQuery, user);
        expect(userData, "User '" + user + "' already exist").not.toBe(0);
        await executeQuery(db, 'INSERT INTO `rolescorrelation` (`i_idUser`, `i_idRole`) VALUES (?, (SELECT i_id FROM `gd_roles` WHERE v_name = "roleViewUsers"))', [userData]);

        const data = {
            userId: userData,
            userAuthorization: {
                validateUserAuth: async (app, userIdAgent, authName) => {
                    return false
                }
            },
            app: {
                db: db,
                executeQuery: executeQuery
            }
        }
        const response = await require("../../api/user").userGetAll(data)

        expect(response.code).toBe(403);
        expect(response.type).toBe("code");
    })
})



describe('GET /api/user/me', () => {
    test('200', async () => {
        const user = "userGetMeGood";
        const userData = await require('../createNewUserAndLog').createNewUserAndLog(db, executeQuery, user);
        expect(userData, "User '" + user + "' already exist").not.toBe(0);
        await executeQuery(db, 'INSERT INTO `rolescorrelation` (`i_idUser`, `i_idRole`) VALUES (?, (SELECT i_id FROM `gd_roles` WHERE v_name = "roleViewUsers"))', [userData]);

        const data = {
            userId: userData,
            userAuthorization: {
                validateUserAuth: async (app, userIdAgent, authName) => {
                    return true
                }
            },
            app: {
                db: db,
                executeQuery: executeQuery
            }
        }
        const response = await require("../../api/user").userGetMe(data);

        expect(response.code).toBe(200);
        expect(response.type).toBe("json");
        expect(response.json["id"] != null).toBe(true);
        expect(response.json["firstName"] != null).toBe(true);
        expect(response.json["lastName"] != null).toBe(true);
        expect(response.json["email"] != null).toBe(true);
        expect(response.json["creationDate"] != null).toBe(true);
        expect(response.json["language"] != null).toBe(true);
        expect(Number.isInteger(response.json["acceptedRule"])).toBe(true);
        expect(Number.isInteger(response.json["mailValidated"])).toBe(true);
    })

    test('401-userIsUnauthenticated', async () => {
        const data = {}
        const response = await require("../../api/user").userGetMe(data)

        expect(response.code).toBe(401);
        expect(response.type).toBe("code");
    })
})



describe('GET /api/user/:id', () => {
    test('200', async () => {
        const user = "userGetByIdGood";
        const userData = await require('../createNewUserAndLog').createNewUserAndLog(db, executeQuery, user);
        expect(userData, "User '" + user + "' already exist").not.toBe(0);
        await executeQuery(db, 'INSERT INTO `rolescorrelation` (`i_idUser`, `i_idRole`) VALUES (?, (SELECT i_id FROM `gd_roles` WHERE v_name = "roleViewUsers"))', [userData]);

        const data = {
            userId: userData,
            params: {
                id: 1
            },
            userAuthorization: {
                validateUserAuth: async (app, userIdAgent, authName) => {
                    return true
                }
            },
            app: {
                db: db,
                executeQuery: executeQuery
            }
        }
        const response = await require("../../api/user").userDeleteById(data);

        expect(response.code).toBe(200);
        expect(response.type).toBe("code");
    })

    test('401-userIsUnauthenticated', async () => {
        const user = "userGetByIdWhithoutValidUser";
        const userData = await require('../createNewUserAndLog').createNewUserAndLog(db, executeQuery, user);
        expect(userData, "User '" + user + "' already exist").not.toBe(0);
        await executeQuery(db, 'INSERT INTO `rolescorrelation` (`i_idUser`, `i_idRole`) VALUES (?, (SELECT i_id FROM `gd_roles` WHERE v_name = "roleViewUsers"))', [userData]);

        const data = {}
        const response = await require("../../api/user").userDeleteById(data)

        expect(response.code).toBe(401);
        expect(response.type).toBe("code");
    })

    test('403-noViewUsersAuth', async () => {
        const user = "userGetByIdNoViewUsersAuth";
        const userData = await require('../createNewUserAndLog').createNewUserAndLog(db, executeQuery, user);
        expect(userData, "User '" + user + "' already exist").not.toBe(0);
        await executeQuery(db, 'INSERT INTO `rolescorrelation` (`i_idUser`, `i_idRole`) VALUES (?, (SELECT i_id FROM `gd_roles` WHERE v_name = "roleViewUsers"))', [userData]);

        const data = {
            userId: userData,
            params: {
                id: 1
            },
            userAuthorization: {
                validateUserAuth: async (app, userIdAgent, authName) => {
                    if (authName === "viewUsers") return false;
                    return true;
                }
            },
            app: {
                db: db,
                executeQuery: executeQuery
            }
        }
        const response = await require("../../api/user").userDeleteById(data)

        expect(response.code).toBe(403);
        expect(response.type).toBe("code");
    })

    test('403-noManageUserAuth', async () => {
        const user = "userGetByIdNoManageUserAuth";
        const userData = await require('../createNewUserAndLog').createNewUserAndLog(db, executeQuery, user);
        expect(userData, "User '" + user + "' already exist").not.toBe(0);
        await executeQuery(db, 'INSERT INTO `rolescorrelation` (`i_idUser`, `i_idRole`) VALUES (?, (SELECT i_id FROM `gd_roles` WHERE v_name = "roleViewUsers"))', [userData]);

        const data = {
            userId: userData,
            params: {
                id: 1
            },
            userAuthorization: {
                validateUserAuth: async (app, userIdAgent, authName) => {
                    if (authName === "manageUser") return false;
                    return true;
                }
            },
            app: {
                db: db,
                executeQuery: executeQuery
            }
        }
        const response = await require("../../api/user").userDeleteById(data);

        expect(response.code).toBe(403);
        expect(response.type).toBe("code");
    })

    test('400-idUserTargetIsNan', async () => {
        const user = "userGetByIdIdUserTargetIsNan";
        const userData = await require('../createNewUserAndLog').createNewUserAndLog(db, executeQuery, user);
        expect(userData, "User '" + user + "' already exist").not.toBe(0);
        await executeQuery(db, 'INSERT INTO `rolescorrelation` (`i_idUser`, `i_idRole`) VALUES (?, (SELECT i_id FROM `gd_roles` WHERE v_name = "roleViewUsers"))', [userData]);

        const data = {
            userId: userData,
            params: {
                id: "test"
            },
            userAuthorization: {
                validateUserAuth: async (app, userIdAgent, authName) => {
                    return true;
                }
            },
            app: {
                db: db,
                executeQuery: executeQuery
            }
        }
        const response = await require("../../api/user").userDeleteById(data);

        expect(response.code).toBe(400);
        expect(response.type).toBe("code");
    })

    test('400-userTryToDeleteHimself', async () => {
        const user = "userGetByIdUserTryToDeleteHimself";
        const userData = await require('../createNewUserAndLog').createNewUserAndLog(db, executeQuery, user);
        expect(userData, "User '" + user + "' already exist").not.toBe(0);
        await executeQuery(db, 'INSERT INTO `rolescorrelation` (`i_idUser`, `i_idRole`) VALUES (?, (SELECT i_id FROM `gd_roles` WHERE v_name = "roleViewUsers"))', [userData]);

        const data = {
            userId: userData,
            params: {
                id: userData
            },
            userAuthorization: {
                validateUserAuth: async (app, userIdAgent, authName) => {
                    return true;
                }
            },
            app: {
                db: db,
                executeQuery: executeQuery
            }
        }
        const response = await require("../../api/user").userDeleteById(data);

        expect(response.code).toBe(400);
        expect(response.type).toBe("code");
    })

    test('204-userDoesNotExist', async () => {
        const user = "userGetByIdUuserDoesNotExist";
        const userData = await require('../createNewUserAndLog').createNewUserAndLog(db, executeQuery, user);
        expect(userData, "User '" + user + "' already exist").not.toBe(0);
        await executeQuery(db, 'INSERT INTO `rolescorrelation` (`i_idUser`, `i_idRole`) VALUES (?, (SELECT i_id FROM `gd_roles` WHERE v_name = "roleViewUsers"))', [userData]);

        const data = {
            userId: userData,
            params: {
                id: 99999999999999
            },
            userAuthorization: {
                validateUserAuth: async (app, userIdAgent, authName) => {
                    return true;
                }
            },
            app: {
                db: db,
                executeQuery: executeQuery
            }
        }
        const response = await require("../../api/user").userDeleteById(data);

        expect(response.code).toBe(204);
        expect(response.type).toBe("code");
    })
})

describe('GET api/user/discord/link/', () => {
    test('200', async () => {
        const data = {}
        const response = await require("../../api/user.js").getDicordLink(data);

        expect(response.code).toBe(200);
        expect(response.type).toBe("json");
        expect(Object.keys(response.json).length).toBe(1);
        expect((response.json.result != null)).toBe(true);
    })
})