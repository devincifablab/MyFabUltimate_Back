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