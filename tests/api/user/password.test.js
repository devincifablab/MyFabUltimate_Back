const executeQuery = require("../../../functions/dataBase/executeQuery").run;
let db;

beforeAll(async () => {
    db = await require("../../../functions/dataBase/createConnection").open();
});

afterAll(() => {
    db.end();
})


describe('PUT /user/password/', () => {
    test('200', async () => {
        const user = "passwordPutMe200";
        const userData = await require('../../createNewUserAndLog').createNewUserAndLog(db, executeQuery, user);
        expect(userData, "User '" + user + "' already exist").not.toBe(0);
        const data = {
            userId: userData,
            userAuthorization: require("../../../functions/userAuthorization"),
            app: {
                db: db,
                executeQuery: executeQuery,
                cookiesList: {}
            },
            body: {
                actualPassword: "string",
                newPassword: "newPassword"
            }
        }
        const response = await require("../../../api/user/password").putPasswordMe(data);

        expect(response.code).toBe(200);
        expect(response.type).toBe("code");
    })

    test('400noBody', async () => {
        const user = "passwordPutMe400noBody";
        const userData = await require('../../createNewUserAndLog').createNewUserAndLog(db, executeQuery, user);
        expect(userData, "User '" + user + "' already exist").not.toBe(0);
        const data = {
            userId: userData,
            userAuthorization: require("../../../functions/userAuthorization"),
            app: {
                db: db,
                executeQuery: executeQuery,
                cookiesList: {}
            }
        }
        const response = await require("../../../api/user/password").putPasswordMe(data);

        expect(response.code).toBe(400);
        expect(response.type).toBe("code");
    })

    test('400noActualPassword', async () => {
        const user = "passwordPutMe400noActualPassword";
        const userData = await require('../../createNewUserAndLog').createNewUserAndLog(db, executeQuery, user);
        expect(userData, "User '" + user + "' already exist").not.toBe(0);
        const data = {
            userId: userData,
            userAuthorization: require("../../../functions/userAuthorization"),
            app: {
                db: db,
                executeQuery: executeQuery,
                cookiesList: {}
            },
            body: {
                newPassword: "newPassword"
            }
        }
        const response = await require("../../../api/user/password").putPasswordMe(data);

        expect(response.code).toBe(400);
        expect(response.type).toBe("code");
    })

    test('400noNewPassword', async () => {
        const user = "passwordPutMe400noNewPassword";
        const userData = await require('../../createNewUserAndLog').createNewUserAndLog(db, executeQuery, user);
        expect(userData, "User '" + user + "' already exist").not.toBe(0);
        const data = {
            userId: userData,
            userAuthorization: require("../../../functions/userAuthorization"),
            app: {
                db: db,
                executeQuery: executeQuery,
                cookiesList: {}
            },
            body: {
                actualPassword: "string"
            }
        }
        const response = await require("../../../api/user/password").putPasswordMe(data);

        expect(response.code).toBe(400);
        expect(response.type).toBe("code");
    })

    test('401noUser', async () => {
        const user = "passwordPutMe401noUser";
        const userData = await require('../../createNewUserAndLog').createNewUserAndLog(db, executeQuery, user);
        expect(userData, "User '" + user + "' already exist").not.toBe(0);
        const data = {
            userAuthorization: require("../../../functions/userAuthorization"),
            app: {
                db: db,
                executeQuery: executeQuery,
                cookiesList: {}
            },
            body: {
                actualPassword: "string",
                newPassword: "newPassword"
            }
        }
        const response = await require("../../../api/user/password").putPasswordMe(data);

        expect(response.code).toBe(401);
        expect(response.type).toBe("code");
    })

    test('204invalidPassword', async () => {
        const user = "passwordPutMe204invalidPassword";
        const userData = await require('../../createNewUserAndLog').createNewUserAndLog(db, executeQuery, user);
        expect(userData, "User '" + user + "' already exist").not.toBe(0);
        const data = {
            userId: userData,
            userAuthorization: require("../../../functions/userAuthorization"),
            app: {
                db: db,
                executeQuery: executeQuery,
                cookiesList: {}
            },
            body: {
                actualPassword: "incorrectPassword",
                newPassword: "newPassword"
            }
        }
        const response = await require("../../../api/user/password").putPasswordMe(data);

        expect(response.code).toBe(204);
        expect(response.type).toBe("code");
    })
})