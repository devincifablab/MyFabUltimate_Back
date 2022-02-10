describe('GET /api/cookie/', () => {
    test('200', async () => {
        const data = {
            specialcode: "testCode",
            userAuthorization: {
                getSpecialCode: async () => {
                    return "testCode"
                }
            },
            app: {}
        };
        const response = await require("../../api/cookie.js").cookieTestSpecialCode(data);

        expect(response.code).toBe(200);
        expect(response.type).toBe("code");
    })

    test('404-noSpecialCode', async () => {
        const data = {
            specialcode: "testCode",
            userAuthorization: {
                getSpecialCode: async () => {
                    return null
                }
            },
            app: {}
        };
        const response = await require("../../api/cookie.js").cookieTestSpecialCode(data);

        expect(response.code).toBe(404);
        expect(response.type).toBe("code");
    })

    test('404-noSpecialCodeUser', async () => {
        const data = {
            specialcode: null,
            userAuthorization: {
                getSpecialCode: async () => {
                    return "testCode"
                }
            },
            app: {}
        };
        const response = await require("../../api/cookie.js").cookieTestSpecialCode(data);

        expect(response.code).toBe(404);
        expect(response.type).toBe("code");
    })

    test('404-specialCodesAreDifferents', async () => {
        const data = {
            specialcode: "testCode",
            userAuthorization: {
                getSpecialCode: async () => {
                    return "otherTestCode"
                }
            },
            app: {}
        };
        const response = await require("../../api/cookie.js").cookieTestSpecialCode(data);

        expect(response.code).toBe(404);
        expect(response.type).toBe("code");
    })
})

describe('DELETE /api/cookie/', () => {
    test('200', async () => {
        const data = {
            specialcode: "testCode",
            userAuthorization: {
                getSpecialCode: async () => {
                    return "testCode"
                }
            },
            app: {
                cookiesList: {
                    value: "test"
                }
            }
        };
        const response = await require("../../api/cookie.js").cookieDeleteAll(data);

        expect(response.code).toBe(200);
        expect(response.type).toBe("code");
        expect(Array.from(data.app.cookiesList).length).toBe(0);
    })

    test('404-noSpecialCode', async () => {
        const data = {
            specialcode: "testCode",
            userAuthorization: {
                getSpecialCode: async () => {
                    return null
                }
            },
            app: {
                cookiesList: {
                    value: "test"
                }
            }
        };
        const response = await require("../../api/cookie.js").cookieDeleteAll(data);

        expect(response.code).toBe(404);
        expect(response.type).toBe("code");
    })

    test('404-noSpecialCodeUser', async () => {
        const data = {
            specialcode: null,
            userAuthorization: {
                getSpecialCode: async () => {
                    return "testCode"
                }
            },
            app: {
                cookiesList: {
                    value: "test"
                }
            }
        };
        const response = await require("../../api/cookie.js").cookieDeleteAll(data);

        expect(response.code).toBe(404);
        expect(response.type).toBe("code");
    })

    test('404-specialCodesAreDifferents', async () => {
        const data = {
            specialcode: "testCode",
            userAuthorization: {
                getSpecialCode: async () => {
                    return "otherTestCode"
                }
            },
            app: {
                cookiesList: {
                    value: "test"
                }
            }
        };
        const response = await require("../../api/cookie.js").cookieDeleteAll(data);

        expect(response.code).toBe(404);
        expect(response.type).toBe("code");
    })
})