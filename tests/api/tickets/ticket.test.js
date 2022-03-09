const executeQuery = require("../../../functions/dataBase/executeQuery").run;
let db;
let idProjectType;
let idPriority;

beforeAll(async () => {
    db = await require("../../../functions/dataBase/createConnection").open();
    await executeQuery(db, "INSERT INTO `gd_ticketpriority` (`v_name`, `v_color`) VALUES ('testTicket', '000000')", []);
    idProjectType = (await executeQuery(db, "SELECT LAST_INSERT_ID() AS 'id'", []))[1][0].id;
    await executeQuery(db, "INSERT INTO `gd_ticketpriority` (`v_name`, `v_color`) VALUES ('testTicket', '000000')", []);
    idPriority = (await executeQuery(db, "SELECT LAST_INSERT_ID() AS 'id'", []))[1][0].id;
});

afterAll(() => {
    db.end();
})

describe('GET /api/ticket/me/', () => {
    test('200', async () => {
        //Prepare
        const user = "ticketGetAllMe200";
        const userData = await require('../../createNewUserAndLog').createNewUserAndLog(db, executeQuery, user);
        expect(userData, "User '" + user + "' already exist").not.toBe(0);
        const res = await executeQuery(db, "INSERT INTO `printstickets` (`i_idUser`, `i_projecttype`, `i_priority`) VALUES (?, ?, ?)", [userData, idProjectType, idPriority]);

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
        const response = await require("../../../api/tickets/ticket").getTicketAllFromUser(data);

        //Tests
        expect(response.code).toBe(200);
        expect(response.type).toBe("json");
        expect(response.json.length).not.toBe(0);
        expect(typeof response.json[0].id).toBe("number");
        expect(typeof response.json[0].userName).toBe("string");
        expect(Object.prototype.toString.call(response.json[0].creationDate) === '[object Date]').toBe(true);
        expect(Object.prototype.toString.call(response.json[0].modificationDate) === '[object Date]').toBe(true);
        expect(typeof response.json[0].priorityName).toBe("string");
        expect(typeof response.json[0].priorityColor).toBe("string");
    })

    test('401_noUser', async () => {
        //Prepare
        const user = "ticketGetAllMe401noUser";
        const userData = await require('../../createNewUserAndLog').createNewUserAndLog(db, executeQuery, user);
        expect(userData, "User '" + user + "' already exist").not.toBe(0);

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
            }
        }
        const response = await require("../../../api/tickets/ticket").getTicketAllFromUser(data);

        //Tests
        expect(response.code).toBe(401);
        expect(response.type).toBe("code");
    })
})

describe('GET /api/ticket/', () => {
    test('200', async () => {
        //Prepare
        const user = "ticketGetAll200";
        const userData = await require('../../createNewUserAndLog').createNewUserAndLog(db, executeQuery, user);
        expect(userData, "User '" + user + "' already exist").not.toBe(0);
        const userTicket = "ticketGetAllTicket200";
        const userDataTicket = await require('../../createNewUserAndLog').createNewUserAndLog(db, executeQuery, userTicket);
        expect(userDataTicket, "User '" + userTicket + "' already exist").not.toBe(0);
        const res = await executeQuery(db, "INSERT INTO `printstickets` (`i_idUser`, `i_projecttype`, `i_priority`) VALUES (?, ?, ?)", [userDataTicket, idProjectType, idPriority]);

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
        const response = await require("../../../api/tickets/ticket").getTicketAll(data);

        //Tests
        expect(response.code).toBe(200);
        expect(response.type).toBe("json");
        expect(response.json.length).not.toBe(0);
        expect(typeof response.json[0].id).toBe("number");
        expect(typeof response.json[0].userName).toBe("string");
        expect(Object.prototype.toString.call(response.json[0].creationDate) === '[object Date]').toBe(true);
        expect(Object.prototype.toString.call(response.json[0].modificationDate) === '[object Date]').toBe(true);
        expect(typeof response.json[0].priorityName).toBe("string");
        expect(typeof response.json[0].priorityColor).toBe("string");
    })

    test('401noUser', async () => {
        //Prepare
        const user = "ticketGetAll401noUser";
        const userData = await require('../../createNewUserAndLog').createNewUserAndLog(db, executeQuery, user);
        expect(userData, "User '" + user + "' already exist").not.toBe(0);

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
            }
        }
        const response = await require("../../../api/tickets/ticket").getTicketAll(data);

        //Tests
        expect(response.code).toBe(401);
        expect(response.type).toBe("code");
    })

    test('403noRoleMyFabAgent', async () => {
        //Prepare
        const user = "ticketGetAll401noRoleMyFabAgent";
        const userData = await require('../../createNewUserAndLog').createNewUserAndLog(db, executeQuery, user);
        expect(userData, "User '" + user + "' already exist").not.toBe(0);

        //Execute
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
        const response = await require("../../../api/tickets/ticket").getTicketAll(data);

        //Tests
        expect(response.code).toBe(403);
        expect(response.type).toBe("code");
    })
})

describe('GET /api/ticket/:id/', () => {
    test('200userAgent', async () => {
        //Prepare
        const user = "ticketGetById200userAgent";
        const userData = await require('../../createNewUserAndLog').createNewUserAndLog(db, executeQuery, user);
        expect(userData, "User '" + user + "' already exist").not.toBe(0);
        const userOwner = "ticketGetById200userOwner";
        const userDataOwner = await require('../../createNewUserAndLog').createNewUserAndLog(db, executeQuery, userOwner);
        expect(userDataOwner, "User '" + userOwner + "' already exist").not.toBe(0);
        await executeQuery(db, "INSERT INTO `printstickets` (`i_idUser`, `i_projecttype`, `i_priority`) VALUES (?, ?, ?)", [userDataOwner, idProjectType, idPriority]);
        const idTicket = (await executeQuery(db, "SELECT i_id AS 'id' FROM printstickets WHERE i_idUser = ?", [userDataOwner]))[1][0].id;

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
        const response = await require("../../../api/tickets/ticket").getTicketById(data);

        //Tests
        expect(response.code).toBe(200);
        expect(response.type).toBe("json");
        expect(typeof response.json.id).toBe("number");
        expect(typeof response.json.userName).toBe("string");
        expect(typeof response.json.email).toBe("string");
        expect(Object.prototype.toString.call(response.json.creationDate) === '[object Date]').toBe(true);
        expect(Object.prototype.toString.call(response.json.modificationDate) === '[object Date]').toBe(true);
        expect(typeof response.json.priorityName).toBe("string");
        expect(typeof response.json.priorityColor).toBe("string");
    })

    test('200userOwner', async () => {
        //Prepare
        const user = "ticketGetById200userOwner2";
        const userData = await require('../../createNewUserAndLog').createNewUserAndLog(db, executeQuery, user);
        expect(userData, "User '" + user + "' already exist").not.toBe(0);
        await executeQuery(db, "INSERT INTO `printstickets` (`i_idUser`, `i_projecttype`, `i_priority`) VALUES (?, ?, ?)", [userData, idProjectType, idPriority]);
        const idTicket = (await executeQuery(db, "SELECT i_id AS 'id' FROM printstickets WHERE i_idUser = ?", [userData]))[1][0].id;

        //Execute
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
            },
            params: {
                id: idTicket
            }
        }
        const response = await require("../../../api/tickets/ticket").getTicketById(data);

        //Tests
        expect(response.code).toBe(200);
        expect(response.type).toBe("json");
        expect(typeof response.json.id).toBe("number");
        expect(typeof response.json.userName).toBe("string");
        expect(typeof response.json.email).toBe("string");
        expect(Object.prototype.toString.call(response.json.creationDate) === '[object Date]').toBe(true);
        expect(Object.prototype.toString.call(response.json.modificationDate) === '[object Date]').toBe(true);
        expect(typeof response.json.priorityName).toBe("string");
        expect(typeof response.json.priorityColor).toBe("string");
    })

    test('400noParams', async () => {
        //Prepare
        const user = "ticketGetById400noParams";
        const userData = await require('../../createNewUserAndLog').createNewUserAndLog(db, executeQuery, user);
        expect(userData, "User '" + user + "' already exist").not.toBe(0);

        //Execute
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
        const response = await require("../../../api/tickets/ticket").getTicketById(data);

        //Tests
        expect(response.code).toBe(400);
        expect(response.type).toBe("code");
    })

    test('400noParamsId', async () => {
        //Prepare
        const user = "ticketGetById400noParamsId";
        const userData = await require('../../createNewUserAndLog').createNewUserAndLog(db, executeQuery, user);
        expect(userData, "User '" + user + "' already exist").not.toBe(0);

        //Execute
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
            },
            params: {}
        }
        const response = await require("../../../api/tickets/ticket").getTicketById(data);

        //Tests
        expect(response.code).toBe(400);
        expect(response.type).toBe("code");
    })

    test('400noParamsIdIsNan', async () => {
        //Prepare
        const user = "ticketGetById400noParamsIdIsNan";
        const userData = await require('../../createNewUserAndLog').createNewUserAndLog(db, executeQuery, user);
        expect(userData, "User '" + user + "' already exist").not.toBe(0);

        //Execute
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
            },
            params: {
                id: "NaN"
            }
        }
        const response = await require("../../../api/tickets/ticket").getTicketById(data);

        //Tests
        expect(response.code).toBe(400);
        expect(response.type).toBe("code");
    })

    test('401noUser', async () => {
        //Prepare
        const user = "ticketGetById401noUser";
        const userData = await require('../../createNewUserAndLog').createNewUserAndLog(db, executeQuery, user);
        expect(userData, "User '" + user + "' already exist").not.toBe(0);
        await executeQuery(db, "INSERT INTO `printstickets` (`i_idUser`, `i_projecttype`, `i_priority`) VALUES (?, ?, ?)", [userData, idProjectType, idPriority]);
        const idTicket = (await executeQuery(db, "SELECT i_id AS 'id' FROM printstickets WHERE i_idUser = ?", [userData]))[1][0].id;

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
        const response = await require("../../../api/tickets/ticket").getTicketById(data);

        //Tests
        expect(response.code).toBe(401);
        expect(response.type).toBe("code");
    })

    test('204ticketNotFound', async () => {
        //Prepare
        const user = "ticketGetById204ticketNotFound";
        const userData = await require('../../createNewUserAndLog').createNewUserAndLog(db, executeQuery, user);
        expect(userData, "User '" + user + "' already exist").not.toBe(0);

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
                id: 100000000
            }
        }
        const response = await require("../../../api/tickets/ticket").getTicketById(data);

        //Tests
        expect(response.code).toBe(204);
        expect(response.type).toBe("code");
    })

    test('403userNotAlowed', async () => {
        //Prepare
        const user = "ticketGetById403userNotAlowed";
        const userData = await require('../../createNewUserAndLog').createNewUserAndLog(db, executeQuery, user);
        expect(userData, "User '" + user + "' already exist").not.toBe(0);
        const userOther = "ticketGetById200userOther";
        const userDataOther = await require('../../createNewUserAndLog').createNewUserAndLog(db, executeQuery, userOther);
        expect(userDataOther, "User '" + userOther + "' already exist").not.toBe(0);
        await executeQuery(db, "INSERT INTO `printstickets` (`i_idUser`, `i_projecttype`, `i_priority`) VALUES (?, ?, ?)", [userData, idProjectType, idPriority]);
        const idTicket = (await executeQuery(db, "SELECT i_id AS 'id' FROM printstickets WHERE i_idUser = ?", [userData]))[1][0].id;

        //Execute
        const data = {
            userId: userDataOther,
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
        const response = await require("../../../api/tickets/ticket").getTicketById(data);

        //Tests
        expect(response.code).toBe(403);
        expect(response.type).toBe("code");
    })
})