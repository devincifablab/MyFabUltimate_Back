const axios = require('axios');
const config = require('../../config.json');


module.exports.get = {
    testPingGet: async (db, executeQuery) => {
        res = new Promise((resolve, reject) => {
            axios({
                method: 'get',
                url: config.url + config.port + '/api/ping'
            }).then(function (response) {
                if (response.status !== 200) return resolve(false);
                if (Object.keys(response.data).length !== 1) return resolve(false);
                if (response.data.result !== "pong") return resolve(false);
                return resolve(true);
            });
        });
        if (!res) return false;

        return true;
    }
}

module.exports.post = {
    testPingPost: async (db, executeQuery) => {
        res = new Promise((resolve, reject) => {
            axios({
                method: 'post',
                url: config.url + config.port + '/api/ping'
            }).then(function (response) {
                if (response.status !== 200) return resolve(false);
                if (Object.keys(response.data).length !== 1) return resolve(false);
                if (response.data.result !== "pong") return resolve(false);
                return resolve(true);
            });
        });
        if (!res) return false;

        return true;
    }
}

module.exports.put = {
    testPingPut: async (db, executeQuery) => {
        res = new Promise((resolve, reject) => {
            axios({
                method: 'put',
                url: config.url + config.port + '/api/ping'
            }).then(function (response) {
                if (response.status !== 200) return resolve(false);
                if (Object.keys(response.data).length !== 1) return resolve(false);
                if (response.data.result !== "pong") return resolve(false);
                return resolve(true);
            });
        });
        if (!res) return false;

        return true;
    }
}

module.exports.delete = {
    testPingDelete: async (db, executeQuery) => {
        res = new Promise((resolve, reject) => {
            axios({
                method: 'delete',
                url: config.url + config.port + '/api/ping'
            }).then(function (response) {
                if (response.status !== 200) return resolve(false);
                if (Object.keys(response.data).length !== 1) return resolve(false);
                if (response.data.result !== "pong") return resolve(false);
                return resolve(true);
            });
        });
        if (!res) return false;

        return true;
    }
}