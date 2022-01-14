const config = require('../config.json');

module.exports.likes = async (app) => {
    app.get("/api/article/:idArticle/likes/", async function (req, res) {
        try {

            const like = await app.executeQuery(app.db, "SELECT `likes` as `likes` FROM `articles` WHERE `article` = ?;", [req.params.idArticle]);

            if (like[0]) {
                console.log(like[0]);
                res.json(0);
                return;
            }
            if (like[1].length > 0) {
                res.json(like[1][0].likes)
            } else {
                res.json(0);
            }


        } catch (error) {
            console.log("ERROR: GET /article/:idArticle/likes/");
            console.log(error);
            res.sendStatus(500);
        }
    })
}

module.exports.update = async (app) => {
    app.post("/api/article/:idArticle/likes/update", async function (req, res) {
        try {
            var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress

            //Faire la vérification que l'article existe
            const getArticle = await app.executeQuery(app.db, "SELECT `likes` as `likes` FROM `articles` WHERE `article` = ?;", [req.params.idArticle]);

            if (getArticle[0]) {
                console.log(getArticle[0]);
                res.sendStatus(500);
                return;
            } else {
                if (getArticle[1].length > 0) {
                    const like = getArticle[1][0].likes;
                    const dbQuery = await app.executeQuery(app.db, "SELECT `id` as `id` FROM `likes` WHERE (`ip` = ? AND `article` = ?);", [ip, req.params.idArticle]);
                    if (dbQuery[0]) {
                        console.log(dbQuery[0]);
                        res.sendStatus(500);
                        return;
                    } else {
                        if (dbQuery[1].length > 0) {
                            //Il a liké;
                            const dbQuery = await app.executeQuery(app.db, "DELETE FROM `likes` WHERE (`ip` = ? AND `article` = ?);", [ip, req.params.idArticle]);
                            const dbQueryAddLike = await app.executeQuery(app.db, "UPDATE `articles` SET `likes` = ? WHERE `article` = ?;", [like-1, req.params.idArticle]);
                        } else {
                            //Il n'a jamais liké;
                            const dbQuery = await app.executeQuery(app.db, "INSERT INTO `likes` (`id`, `ip`, `article`) VALUES (NULL, ?, ?);", [ip, req.params.idArticle]);
                            const dbQueryAddLike = await app.executeQuery(app.db, "UPDATE `articles` SET `likes` = ? WHERE `article` = ?;", [like+1, req.params.idArticle]);

                        }
                        res.sendStatus(200);
                    }
                } else {
                    res.sendStatus(500);
                    return;
                }
            }




        } catch (error) {
            console.log("ERROR: GET /article/:idArticle/likes/");
            console.log(error);
            res.sendStatus(500);
        }
    })
}

module.exports.getUpdate = async (app) => {
    app.get("/api/article/:idArticle/likes/update", async function (req, res) {
        try {

            var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress

            //Faire la vérification que l'article existe
            const getArticle = await app.executeQuery(app.db, "SELECT `likes` as `likes` FROM `articles` WHERE `article` = ?;", [req.params.idArticle]);

            if (getArticle[0]) {
                console.log(getArticle[0]);
                res.sendStatus(500);
                return;
            } else {
                if (getArticle[1].length > 0) {
                    const like = getArticle[1][0].likes;
                    const dbQuery = await app.executeQuery(app.db, "SELECT `id` as `id` FROM `likes` WHERE (`ip` = ? AND `article` = ?);", [ip, req.params.idArticle]);
                    if (dbQuery[0]) {
                        console.log(dbQuery[0]);
                        res.sendStatus(500);
                        return;
                    } else {
                        if (dbQuery[1].length > 0) {
                            //Il a liké;
                            res.json(true);
                        } else {
                            //Il n'a jamais liké;
                            res.json(false);

                        }
                    }
                } else {
                    res.sendStatus(500);
                    return;
                }
            }




        } catch (error) {
            console.log("ERROR: GET /article/:idArticle/likes/");
            console.log(error);
            res.sendStatus(500);
        }
    })
}

module.exports.post = async (app) => {
    app.post("/api/article/:key", async function (req, res) {
        try {

            const id = req.body.post.current.id;
            const key = req.params.key;

            if (key == config.ghost_key) {
                const dbQuery = await app.executeQuery(app.db, "INSERT INTO `articles` (`id`, `article`, `likes`) VALUES (NULL, ?, '0');", [id]);

                if (dbQuery[0]) {
                    console.log(dbQuery[0]);
                    res.sendStatus(500);
                    return;
                }
            } else {
                res.sendStatus(401);
            }
            console.log(id, key);
            res.sendStatus(200);


        } catch (error) {
            console.log("ERROR: POST /article/:key/");
            console.log(error);
            res.sendStatus(500);
        }
    })
}