const { Server } = require("socket.io");
const fetchGameData = require('./controller/game-controller');
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
  let gameData = null;
  io.on("connection", async (socket) => {
    if (socket) {
      socket.emit("received_message", { "connected": true });
      // console.log('Saving socket id..')
      // await socketRepository.create({
      //   socket_id: socket.id,
      //   client: socket.client.id,
      //   remote_address: socket.client.conn.remoteAddress
      // });
      // var address = socket.handshake.address;
      // console.log('Address : %s  : %s', address.address, address.exports);
      console.log("User connected with  %s...Socket Id: %s", socket.client.conn.remoteAddress, socket.id);
      socket.on("send_message", (data) => {
        console.log("Data Received at Server : ", data);
        if (data.game.room) socket.to(data.game.room).emit("received_message", data);
      })

      socket.on("join_room", async (data) => {
        console.log("Joining room request ..", data);
        if (data.room) {
          //join the socket
          socket.join(data.room);
          socket.to(data.room).emit("player_joined", data.userId);
          //emit the message
          try {
            console.log('fetching game data...');
            if (!gameData) gameData = await fetchGameData(data);
            io.to(data.room).emit("received_message", gameData);//{ 'type': 'UPDATED_GAME_DATA', 'gameData': gameData }
          } catch (err) { console.log(err); }
        }
      });

      socket.on('disconnect', (data) => {
        console.log('Socket disconnected..');
        gameData = "";
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