const axios = require('axios');
const config = require('../config.json');


module.exports.createNewUserAndLog = async (db, executeQuery, userName) => {
    await executeQuery(db, "INSERT INTO `users` (`i_id`, `v_firstName`, `v_lastName`, `v_email`, `v_password`, `dt_creationdate`, `v_discordid`, `v_language`, `dt_ruleSignature`, `b_deleted`, `b_visible`, `b_mailValidated`) VALUES (NULL, 'firstNameTest', 'lastNameTest', ?, '473287f8298dba7163a897908958f7c0eae733e25d2e027992ea2edc9bed2fa8', current_timestamp(), NULL, 'fr', NULL, '0', '1', '1')", [userName + "@test.com"]);
    const lastIdentityRes = await executeQuery(db, "SELECT LAST_INSERT_ID() AS 'id';", []);
    const idUser = lastIdentityRes[1][0].id;
    return await new Promise((resolve, reject) => {
        axios({
            method: 'post',
            url: config.url + config.port + '/api/user/login/',
            data: {
                "email": userName + "@test.com",
                "password": "string"
            }
        }).then(function (response) {
            resolve([idUser, response.data.dvflCookie])
        }).catch(async function (err) {
            console.log(err.response.status);
            await executeQuery(db, "DROP DATABASE ??", [config.db.database]);
            reject();
        });
    })
}