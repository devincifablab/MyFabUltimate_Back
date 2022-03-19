const fs = require('fs');
const executeQuery = require("../../../functions/dataBase/executeQuery").run;
let db;
let idProjectType;
let idNewProjectType;
let idPriority;

beforeAll(async () => {
    db = await require("../../../functions/dataBase/createConnection").open();
    await fs.copyFileSync(__dirname + "/../../Forme-Boîte.stl", __dirname + "/../../../data/files/stl/token_test.stl")
});

afterAll(() => {
    db.end();
    fs.readdir(__dirname + "/../../../data/files/stl/", (err, files) => {
        files.forEach(file => {
            if (file.endsWith('-test.STL')) fs.unlinkSync(__dirname + "/../../../data/files/stl/" + file);
        });
    });
})

describe('GET /api/ticket/:id/file/', () => {
    test('200myFabAgent', async () => {
        //Prepare
        const user = "ticketGetTicketFile200user";
        const userData = await require('../../createNewUserAndLog').createNewUserAndLog(db, executeQuery, user);
        expect(userData, "User '" + user + "' already exist").not.toBe(0);
        const userAgent = "ticketGetTicketFile200myFabAgent";
        const userDataAgent = await require('../../createNewUserAndLog').createNewUserAndLog(db, executeQuery, userAgent);
        expect(userDataAgent, "User '" + userAgent + "' already exist").not.toBe(0);
        await executeQuery(db, "INSERT INTO `printstickets` (`i_idUser`, `i_projecttype`, `i_priority`) VALUES (?, 1, 1)", [userData]);
        const idTicket = (await executeQuery(db, "SELECT LAST_INSERT_ID() AS 'id'", []))[1][0].id;
        await executeQuery(db, "INSERT INTO `ticketfiles` (`i_idUser`, `i_idTicket`, `v_fileName`, `v_fileServerName`, `v_comment`) VALUES (?, ?, 'test.stl', 'token_test.stl', 'test')", [userData, idTicket]);

        //Execute
        const data = {
            userId: userDataAgent,
            userAuthorization: {
                validateUserAuth: async (app, userIdAgent, authName) => {
                    return true
                }
            },
            app: {
                db: db,
                executeQuery: executeQuery
            },
            params: {
                id: idTicket
            }
        }
        const response = await require("../../../api/tickets/file").ticketFileGetListOfFile(data);

        //Tests
        expect(response.code).toBe(200);
        expect(response.type).toBe("json");
        expect(response.json.length).not.toBe(0);
        expect(typeof response.json[0].id).toBe("number");
        expect(typeof response.json[0].filename).toBe("string");
        expect(typeof response.json[0].comment).toBe("string");
        expect(response.json[0].isValid == null).toBe(true);
        expect(Object.prototype.toString.call(response.json[0].creationDate) === '[object Date]').toBe(true);
        expect(Object.prototype.toString.call(response.json[0].modificationDate) === '[object Date]').toBe(true);
    })

    test('200userOwner', async () => {
        //Prepare
        const user = "ticketGetTicketFile200userOwner";
        const userData = await require('../../createNewUserAndLog').createNewUserAndLog(db, executeQuery, user);
        expect(userData, "User '" + user + "' already exist").not.toBe(0);
        await executeQuery(db, "INSERT INTO `printstickets` (`i_idUser`, `i_projecttype`, `i_priority`) VALUES (?, 1, 1)", [userData]);
        const idTicket = (await executeQuery(db, "SELECT LAST_INSERT_ID() AS 'id'", []))[1][0].id;
        await executeQuery(db, "INSERT INTO `ticketfiles` (`i_idUser`, `i_idTicket`, `v_fileName`, `v_fileServerName`, `v_comment`) VALUES (?, ?, 'test.stl', 'token_test.stl', 'test')", [userData, idTicket]);

        //Execute
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
            },
            params: {
                id: idTicket
            }
        }
        const response = await require("../../../api/tickets/file").ticketFileGetListOfFile(data);

        //Tests
        expect(response.code).toBe(200);
        expect(response.type).toBe("json");
        expect(response.json.length).not.toBe(0);
        expect(typeof response.json[0].id).toBe("number");
        expect(typeof response.json[0].filename).toBe("string");
        expect(typeof response.json[0].comment).toBe("string");
        expect(response.json[0].isValid == null).toBe(true);
        expect(Object.prototype.toString.call(response.json[0].creationDate) === '[object Date]').toBe(true);
        expect(Object.prototype.toString.call(response.json[0].modificationDate) === '[object Date]').toBe(true);
    })

    test('400noParams', async () => {
        //Prepare
        const user = "ticketGetTicketFile400noParams";
        const userData = await require('../../createNewUserAndLog').createNewUserAndLog(db, executeQuery, user);
        expect(userData, "User '" + user + "' already exist").not.toBe(0);
        await executeQuery(db, "INSERT INTO `printstickets` (`i_idUser`, `i_projecttype`, `i_priority`) VALUES (?, 1, 1)", [userData]);
        const idTicket = (await executeQuery(db, "SELECT LAST_INSERT_ID() AS 'id'", []))[1][0].id;
        await executeQuery(db, "INSERT INTO `ticketfiles` (`i_idUser`, `i_idTicket`, `v_fileName`, `v_fileServerName`, `v_comment`) VALUES (?, ?, 'test.stl', 'token_test.stl', 'test')", [userData, idTicket]);

        //Execute
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
        const response = await require("../../../api/tickets/file").ticketFileGetListOfFile(data);

        //Tests
        expect(response.code).toBe(400);
        expect(response.type).toBe("code");
    })

    test('400noId', async () => {
        //Prepare
        const user = "ticketGetTicketFile400noId";
        const userData = await require('../../createNewUserAndLog').createNewUserAndLog(db, executeQuery, user);
        expect(userData, "User '" + user + "' already exist").not.toBe(0);
        await executeQuery(db, "INSERT INTO `printstickets` (`i_idUser`, `i_projecttype`, `i_priority`) VALUES (?, 1, 1)", [userData]);
        const idTicket = (await executeQuery(db, "SELECT LAST_INSERT_ID() AS 'id'", []))[1][0].id;
        await executeQuery(db, "INSERT INTO `ticketfiles` (`i_idUser`, `i_idTicket`, `v_fileName`, `v_fileServerName`, `v_comment`) VALUES (?, ?, 'test.stl', 'token_test.stl', 'test')", [userData, idTicket]);

        //Execute
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
            },
            params: {}
        }
        const response = await require("../../../api/tickets/file").ticketFileGetListOfFile(data);

        //Tests
        expect(response.code).toBe(400);
        expect(response.type).toBe("code");
    })

    test('400idIsNan', async () => {
        //Prepare
        const user = "ticketGetTicketFile400idIsNan";
        const userData = await require('../../createNewUserAndLog').createNewUserAndLog(db, executeQuery, user);
        expect(userData, "User '" + user + "' already exist").not.toBe(0);
        await executeQuery(db, "INSERT INTO `printstickets` (`i_idUser`, `i_projecttype`, `i_priority`) VALUES (?, 1, 1)", [userData]);
        const idTicket = (await executeQuery(db, "SELECT LAST_INSERT_ID() AS 'id'", []))[1][0].id;
        await executeQuery(db, "INSERT INTO `ticketfiles` (`i_idUser`, `i_idTicket`, `v_fileName`, `v_fileServerName`, `v_comment`) VALUES (?, ?, 'test.stl', 'token_test.stl', 'test')", [userData, idTicket]);

        //Execute
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
            },
            params: {
                id: "idTicket"
            }
        }
        const response = await require("../../../api/tickets/file").ticketFileGetListOfFile(data);

        //Tests
        expect(response.code).toBe(400);
        expect(response.type).toBe("code");
    })

    test('401noUser', async () => {
        //Prepare
        const user = "ticketGetTicketFile401noUser";
        const userData = await require('../../createNewUserAndLog').createNewUserAndLog(db, executeQuery, user);
        expect(userData, "User '" + user + "' already exist").not.toBe(0);
        await executeQuery(db, "INSERT INTO `printstickets` (`i_idUser`, `i_projecttype`, `i_priority`) VALUES (?, 1, 1)", [userData]);
        const idTicket = (await executeQuery(db, "SELECT LAST_INSERT_ID() AS 'id'", []))[1][0].id;
        await executeQuery(db, "INSERT INTO `ticketfiles` (`i_idUser`, `i_idTicket`, `v_fileName`, `v_fileServerName`, `v_comment`) VALUES (?, ?, 'test.stl', 'token_test.stl', 'test')", [userData, idTicket]);

        //Execute
        const data = {
            userAuthorization: {
                validateUserAuth: async (app, userIdAgent, authName) => {
                    return true
                }
            },
            app: {
                db: db,
                executeQuery: executeQuery
            },
            params: {
                id: idTicket
            }
        }
        const response = await require("../../../api/tickets/file").ticketFileGetListOfFile(data);

        //Tests
        expect(response.code).toBe(401);
        expect(response.type).toBe("code");
    })

    test('403unauthorized', async () => {
        //Prepare
        const user = "ticketGetTicketFile403unauthorizedUser";
        const userData = await require('../../createNewUserAndLog').createNewUserAndLog(db, executeQuery, user);
        expect(userData, "User '" + user + "' already exist").not.toBe(0);
        const userAgent = "ticketGetTicketFile403unauthorizedAgent";
        const userDataAgent = await require('../../createNewUserAndLog').createNewUserAndLog(db, executeQuery, userAgent);
        expect(userDataAgent, "User '" + userAgent + "' already exist").not.toBe(0);
        await executeQuery(db, "INSERT INTO `printstickets` (`i_idUser`, `i_projecttype`, `i_priority`) VALUES (?, 1, 1)", [userData]);
        const idTicket = (await executeQuery(db, "SELECT LAST_INSERT_ID() AS 'id'", []))[1][0].id;
        await executeQuery(db, "INSERT INTO `ticketfiles` (`i_idUser`, `i_idTicket`, `v_fileName`, `v_fileServerName`, `v_comment`) VALUES (?, ?, 'test.stl', 'token_test.stl', 'test')", [userData, idTicket]);

        //Execute
        const data = {
            userId: userDataAgent,
            userAuthorization: {
                validateUserAuth: async (app, userIdAgent, authName) => {
                    return false
                }
            },
            app: {
                db: db,
                executeQuery: executeQuery
            },
            params: {
                id: idTicket
            }
        }
        const response = await require("../../../api/tickets/file").ticketFileGetListOfFile(data);

        //Tests
        expect(response.code).toBe(403);
        expect(response.type).toBe("code");
    })
})

describe('GET /api/file/:id/', () => {
    test('200myFabAgent', async () => {
        //Prepare
        const user = "ticketGetFile200user";
        const userData = await require('../../createNewUserAndLog').createNewUserAndLog(db, executeQuery, user);
        expect(userData, "User '" + user + "' already exist").not.toBe(0);
        const userAgent = "ticketGetFile200myFabAgent";
        const userDataAgent = await require('../../createNewUserAndLog').createNewUserAndLog(db, executeQuery, userAgent);
        expect(userDataAgent, "User '" + userAgent + "' already exist").not.toBe(0);
        await executeQuery(db, "INSERT INTO `printstickets` (`i_idUser`, `i_projecttype`, `i_priority`) VALUES (?, 1, 1)", [userData]);
        const idTicket = (await executeQuery(db, "SELECT LAST_INSERT_ID() AS 'id'", []))[1][0].id;
        await executeQuery(db, "INSERT INTO `ticketfiles` (`i_idUser`, `i_idTicket`, `v_fileName`, `v_fileServerName`, `v_comment`) VALUES (?, ?, 'test.stl', 'token_test.stl', 'test')", [userData, idTicket]);
        const idFile = (await executeQuery(db, "SELECT LAST_INSERT_ID() AS 'id'", []))[1][0].id;

        //Execute
        const data = {
            userId: userDataAgent,
            userAuthorization: {
                validateUserAuth: async (app, userIdAgent, authName) => {
                    return true
                }
            },
            app: {
                db: db,
                executeQuery: executeQuery
            },
            params: {
                id: idFile
            }
        }
        const response = await require("../../../api/tickets/file").ticketFileGetOneFile(data);

        //Tests
        expect(response.code).toBe(200);
        expect(response.type).toBe("download");
        expect(response.path != null).toBe(true);
        expect(response.fileName != null).toBe(true);
    })

    test('200userOwner', async () => {
        //Prepare
        const user = "ticketGetFile200userOwner";
        const userData = await require('../../createNewUserAndLog').createNewUserAndLog(db, executeQuery, user);
        expect(userData, "User '" + user + "' already exist").not.toBe(0);
        await executeQuery(db, "INSERT INTO `printstickets` (`i_idUser`, `i_projecttype`, `i_priority`) VALUES (?, 1, 1)", [userData]);
        const idTicket = (await executeQuery(db, "SELECT LAST_INSERT_ID() AS 'id'", []))[1][0].id;
        await executeQuery(db, "INSERT INTO `ticketfiles` (`i_idUser`, `i_idTicket`, `v_fileName`, `v_fileServerName`, `v_comment`) VALUES (?, ?, 'test.stl', 'token_test.stl', 'test')", [userData, idTicket]);

        //Execute
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
            },
            params: {
                id: idTicket
            }
        }
        const response = await require("../../../api/tickets/file").ticketFileGetOneFile(data);

        //Tests
        expect(response.code).toBe(200);
        expect(response.type).toBe("download");
        expect(response.path != null).toBe(true);
        expect(response.fileName != null).toBe(true);
    })

    test('400noParams', async () => {
        //Prepare
        const user = "ticketGetFile400noParams";
        const userData = await require('../../createNewUserAndLog').createNewUserAndLog(db, executeQuery, user);
        expect(userData, "User '" + user + "' already exist").not.toBe(0);
        await executeQuery(db, "INSERT INTO `printstickets` (`i_idUser`, `i_projecttype`, `i_priority`) VALUES (?, 1, 1)", [userData]);
        const idTicket = (await executeQuery(db, "SELECT LAST_INSERT_ID() AS 'id'", []))[1][0].id;
        await executeQuery(db, "INSERT INTO `ticketfiles` (`i_idUser`, `i_idTicket`, `v_fileName`, `v_fileServerName`, `v_comment`) VALUES (?, ?, 'test.stl', 'token_test.stl', 'test')", [userData, idTicket]);

        //Execute
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
        const response = await require("../../../api/tickets/file").ticketFileGetListOfFile(data);

        //Tests
        expect(response.code).toBe(400);
        expect(response.type).toBe("code");
    })

    test('400noId', async () => {
        //Prepare
        const user = "ticketGetFile400noId";
        const userData = await require('../../createNewUserAndLog').createNewUserAndLog(db, executeQuery, user);
        expect(userData, "User '" + user + "' already exist").not.toBe(0);
        await executeQuery(db, "INSERT INTO `printstickets` (`i_idUser`, `i_projecttype`, `i_priority`) VALUES (?, 1, 1)", [userData]);
        const idTicket = (await executeQuery(db, "SELECT LAST_INSERT_ID() AS 'id'", []))[1][0].id;
        await executeQuery(db, "INSERT INTO `ticketfiles` (`i_idUser`, `i_idTicket`, `v_fileName`, `v_fileServerName`, `v_comment`) VALUES (?, ?, 'test.stl', 'token_test.stl', 'test')", [userData, idTicket]);

        //Execute
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
            },
            params: {}
        }
        const response = await require("../../../api/tickets/file").ticketFileGetListOfFile(data);

        //Tests
        expect(response.code).toBe(400);
        expect(response.type).toBe("code");
    })

    test('400idIsNan', async () => {
        //Prepare
        const user = "ticketGetFile400idIsNan";
        const userData = await require('../../createNewUserAndLog').createNewUserAndLog(db, executeQuery, user);
        expect(userData, "User '" + user + "' already exist").not.toBe(0);
        await executeQuery(db, "INSERT INTO `printstickets` (`i_idUser`, `i_projecttype`, `i_priority`) VALUES (?, 1, 1)", [userData]);
        const idTicket = (await executeQuery(db, "SELECT LAST_INSERT_ID() AS 'id'", []))[1][0].id;
        await executeQuery(db, "INSERT INTO `ticketfiles` (`i_idUser`, `i_idTicket`, `v_fileName`, `v_fileServerName`, `v_comment`) VALUES (?, ?, 'test.stl', 'token_test.stl', 'test')", [userData, idTicket]);

        //Execute
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
            },
            params: {
                id: "idTicket"
            }
        }
        const response = await require("../../../api/tickets/file").ticketFileGetListOfFile(data);

        //Tests
        expect(response.code).toBe(400);
        expect(response.type).toBe("code");
    })

    test('401noUser', async () => {
        //Prepare
        const user = "ticketGetFile401noUser";
        const userData = await require('../../createNewUserAndLog').createNewUserAndLog(db, executeQuery, user);
        expect(userData, "User '" + user + "' already exist").not.toBe(0);
        await executeQuery(db, "INSERT INTO `printstickets` (`i_idUser`, `i_projecttype`, `i_priority`) VALUES (?, 1, 1)", [userData]);
        const idTicket = (await executeQuery(db, "SELECT LAST_INSERT_ID() AS 'id'", []))[1][0].id;
        await executeQuery(db, "INSERT INTO `ticketfiles` (`i_idUser`, `i_idTicket`, `v_fileName`, `v_fileServerName`, `v_comment`) VALUES (?, ?, 'test.stl', 'token_test.stl', 'test')", [userData, idTicket]);

        //Execute
        const data = {
            userAuthorization: {
                validateUserAuth: async (app, userIdAgent, authName) => {
                    return true
                }
            },
            app: {
                db: db,
                executeQuery: executeQuery
            },
            params: {
                id: idTicket
            }
        }
        const response = await require("../../../api/tickets/file").ticketFileGetListOfFile(data);

        //Tests
        expect(response.code).toBe(401);
        expect(response.type).toBe("code");
    })

    test('403unauthorized', async () => {
        //Prepare
        const user = "ticketGetFile403unauthorizedUser";
        const userData = await require('../../createNewUserAndLog').createNewUserAndLog(db, executeQuery, user);
        expect(userData, "User '" + user + "' already exist").not.toBe(0);
        const userAgent = "ticketGetFile403unauthorizedAgent";
        const userDataAgent = await require('../../createNewUserAndLog').createNewUserAndLog(db, executeQuery, userAgent);
        expect(userDataAgent, "User '" + userAgent + "' already exist").not.toBe(0);
        await executeQuery(db, "INSERT INTO `printstickets` (`i_idUser`, `i_projecttype`, `i_priority`) VALUES (?, 1, 1)", [userData]);
        const idTicket = (await executeQuery(db, "SELECT LAST_INSERT_ID() AS 'id'", []))[1][0].id;
        await executeQuery(db, "INSERT INTO `ticketfiles` (`i_idUser`, `i_idTicket`, `v_fileName`, `v_fileServerName`, `v_comment`) VALUES (?, ?, 'test.stl', 'token_test.stl', 'test')", [userData, idTicket]);

        //Execute
        const data = {
            userId: userDataAgent,
            userAuthorization: {
                validateUserAuth: async (app, userIdAgent, authName) => {
                    return false
                }
            },
            app: {
                db: db,
                executeQuery: executeQuery
            },
            params: {
                id: idTicket
            }
        }
        const response = await require("../../../api/tickets/file").ticketFileGetListOfFile(data);

        //Tests
        expect(response.code).toBe(403);
        expect(response.type).toBe("code");
    })
})