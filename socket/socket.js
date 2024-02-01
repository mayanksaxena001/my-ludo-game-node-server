const { Server } = require("socket.io");
var cors = require('cors');
var auth = require('../controller/auth.controller');
var SocketController = require('./controller/socket-controller');
var socketCache = require('./controller/socket.cache.js');
module.exports = async (server) => {
  const whitelist = ['http://localhost:3000', 'http://129.168.0.105:3000', 'http://172.18.5.3:3000'];
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
  // .use((socket, next) => {
  //   let token = socket.handshake.query.token;
  //   let url = socket.handshake.headers.referer;
  //   if (socket.handshake.query && token) {
  //     auth.checkSocketToken(token, url);
  //     next();
  //     //
  //   }
  //   else {
  //     next(new Error('Authentication error'));
  //   }
  // })
  io.on("connection", socket => {
    console.log('socket connected ...');
    //TODO socket controller should have unique different objects
     SocketController.initSocket(io,socket,socketCache);
    // socketController.configureSocket(socket);
  });
  io.on("close", data => {
    console.log("closing connection with socket.. ", data);
    socketCache.flush();
  });
  io.on('error', (err) => {
    console.log("error in connecting socket.. ");
    console.error(err);
  });
  //   io.listen(port);
  // io.listen(server);
  // io.emit('socket server created ..');
  // io.on('connect', () => 'connected....')
  return io;
}
