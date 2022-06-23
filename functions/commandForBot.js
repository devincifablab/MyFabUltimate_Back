const axios = require("axios");
const config = require('../config.json');


module.exports.postTicket = async (id) => {
    return
    await axios({
        method: 'POST',
        url: config.url + config.portBot + "/api/ticket/" + id,
    }).then(async (response) => {
        if (response.status !== 200) {
            console.log(`ERROR : 'POST ${config.url + config.portBot}/api/ticket/${id}' get error ${response.status}`);
        }
    }).catch((err) => {
        console.log(`ERROR : 'POST ${config.url + config.portBot}/api/ticket/${id}' get error ${err.status}`);
    })
}