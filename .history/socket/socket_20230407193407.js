const { Server } = require("socket.io");
const { fetchGameData, joinRoom, onConnection, onDisconnection, onSendMessage } = require('./controller/game-controller');
var cors = require('cors');
var GameController = require('../socket/controller/game-controller');
const gameController = new GameController();
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
  io.on("connection", configureSocket());
  io.on('error', (err) => { console.error(err) });
  //   io.listen(port);
  // io.listen(server);
  // io.emit('socket server created ..');
  // io.on('connect', () => 'connected....')
  return io;
}
