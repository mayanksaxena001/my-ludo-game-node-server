const { Server } = require("socket.io");
var cors = require('cors');
var SocketController = require('./controller/socket-controller');
let socketController = null;
module.exports = async (server) => {
  const whitelist = ['http://localhost:3000', 'http://129.168.0.105:3000'];
  var corsOptions = {
    origin: whitelist,
    credentials: false,
    redirect: false,
    maxAge: 84000,
    // preflightContinue: true,
    optionsSuccessStatus: 200
  }
  const io = new Server(server, {
    cors: corsOptions
  });
  io.on("connection", socket => {
    if (!socketController) socketController = new SocketController();
    socketController.configureSocket(socket);
  });
  io.on("close", socket => {
    socketController = null;
  });
  io.on('error', (err) => {
    socketController = null;
    console.error(err)
  });
  //   io.listen(port);
  // io.listen(server);
  // io.emit('socket server created ..');
  // io.on('connect', () => 'connected....')
  return io;
}
