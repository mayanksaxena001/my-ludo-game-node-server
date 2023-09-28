'use strict';
var LudoGame = require('./ludo.game');
module.exports = class SocketController {
    constructor() { console.log('constructing socket controller...');this.ludoGame = null; this.socket = null; }
    configureSocket = async (socket) => {
        if (socket) {
            this.socket = socket;
            await this.onConnection();

            this.socket.on("send_message", async (data) => {
                await this.onSendMessage(data);
            });

            this.socket.on("join_room", async (data) => {
                await this.joinRoom(data);
            });

            this.socket.on('disconnect', async (data) => {
                await this.onDisconnection(data);
            });
        }
    };
    fetchGameData = async (data) => {
        return this.ludoGame.getGameData();
    };
    onConnection = async () => {
        //initialise state
        if (!this.ludoGame) this.ludoGame = new LudoGame();
        console.log("User connected with  %s...Socket Id: %s", this.socket.client.conn.remoteAddress, this.socket.id);
        this.socket.emit("received_message", { "connected": true });
    };
    onDisconnection = async (data) => {
        console.log('Socket disconnected..', data);
        this.socket = null;
        this.ludoGame = null;
        //set inactive 
        // this.ludoGame.setActive(data,false);
    };
    onSendMessage = async (data) => {
        console.log("Data Received at Server : ", data);
        if (data.game.room) this.socket.to(data.game.room).emit("received_message", data);
    };
    joinRoom = async (data) => {
        console.log("Joining room request ..", data);
        if (data.room) {
            this.ludoGame.initialize(data);
            //set active 
            //join the socket
            this.socket.join(data.room);
            this.socket.to(data.room).emit("player_joined", data.userId);
            //emit the message
            try {
                console.log('fetching game data...');
                let gameData = await this.fetchGameData();
                console.log(gameData);
                this.socket.emit("received_message", gameData);//{ 'type': 'UPDATED_GAME_DATA', 'gameData': gameData }
            } catch (err) { console.log(err); }
        }
    }
} 