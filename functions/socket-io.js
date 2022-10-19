module.exports.connection = async (app) => {
  app.io.on("connection", (socket) => {
    socket.on("disconnect", (reason) => {});
  });
};
