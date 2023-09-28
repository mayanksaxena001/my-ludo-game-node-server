const { Server } = require("socket.io");
const { fetchGameData, joinRoom, onConnection, onDisconnection, onSendMessage } = require('./controller/game-controller');
var cors = require('cors');
var SocketRepository = require('../mysql/db/socket.repository');
const socketRepository = new SocketRepository();
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
  io.on("connection", async (socket) => {
    if (socket) {
      await onConnection(socket);

      socket.on("send_message", async (data) => {
        await onSendMessage(socket, data);
      })

      socket.on("join_room", async (data) => {
        await joinRoom(socket, data);
      });

      socket.on('disconnect', async (data) => {
        await onDisconnection(socket);
      })
    }
    // ...
  });
  io.on('error', (err) => { console.error(err) });
  //   io.listen(port);
  // io.listen(server);
  // io.emit('socket server created ..');
  // io.on('connect', () => 'connected....')
  return io;
}