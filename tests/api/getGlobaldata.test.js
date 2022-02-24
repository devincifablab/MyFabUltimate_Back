const executeQuery = require("../../functions/dataBase/executeQuery").run;
let db;

beforeAll(async () => {
    db = await require("../../functions/dataBase/createConnection").open();
});

afterAll(() => {
    db.end();
})

describe('GET /api/status/', () => {
    test('200', async () => {
        const data = {
            app: {
                db: db,
                executeQuery: executeQuery
            }
        }
        const response = await require("../../api/getGlobaldata").getStatus(data);

        expect(response.code).toBe(200);
        expect(response.type).toBe("json");
        expect((response.json[0].id)!=null).toBe(true);
        expect((response.json[0].name)!=null).toBe(true);
        expect((response.json[0].color)!=null).toBe(true);
    })
})

describe('GET /api/projectType/', () => {
    test('200', async () => {
        const data = {
            app: {
                db: db,
                executeQuery: executeQuery
            }
        }
        const response = await require("../../api/getGlobaldata").getProjectType(data);

        expect(response.code).toBe(200);
        expect(response.type).toBe("json");
        expect((response.json[0].id)!=null).toBe(true);
        expect((response.json[0].name)!=null).toBe(true);
    })
})