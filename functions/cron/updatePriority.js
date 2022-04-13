const CronJob = require('cron').CronJob;


module.exports.run = async (app) => {
    new CronJob('00 00 08 * * *', async function () {
        const queryOneWeek = `UPDATE printstickets
                        SET i_priority = '2'
                        WHERE NOW() > DATE_ADD(dt_creationdate, INTERVAL 1 WEEK);`;
        const dbResOneWeek = await app.executeQuery(app.db, queryOneWeek, []);
        if (dbResOneWeek[0]) console.log(dbResOneWeek[0]);

        const queryTwoWeek = `UPDATE printstickets
                        SET i_priority = '3'
                        WHERE NOW() > DATE_ADD(dt_creationdate, INTERVAL 2 WEEK);`;
        const dbResTwoWeek = await app.executeQuery(app.db, queryTwoWeek, []);
        if (dbResTwoWeek[0]) console.log(dbResTwoWeek[0]);
    }, null, true);
}