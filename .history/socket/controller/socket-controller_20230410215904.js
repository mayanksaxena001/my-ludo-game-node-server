'use strict';
var LudoGame = require('./ludo.game');
module.exports = class SocketController {
    constructor() {
        console.log('constructing socket controller...');
        this.ludoGame = null; this.socket = null;
    }
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

            this.socket.on('start_game', async (data) => {
                await this.startGame(data);
            });

            this.socket.on('dice_roll', async (data) => {
                await this.diceRoll(data);
            });

            this.socket.on('time_out', async (data) => {
                await this.timeOut(data);
            });
        }
    };

    diceRoll = async (data) => {
        console.log('dice value received...', data);
        if (data) {
            await this.ludoGame.rollDice(data.diceValue);
            await this.sendUpdatedData(data);
        }
    };

    startGame = async (data) => {
        const hasStarted = await this.ludoGame.startGame();
        console.log('starting game..', hasStarted);
        console.log(data);
        if (hasStarted) {
            let started = { has_started: hasStarted };
            this.socket.to(data.room).emit("received_message", started);
            this.socket.emit("received_message", started);
        }
    };

    timeOut = async (data) => {
        console.log('time out..', data);
        if (data) {
            await this.ludoGame.timeOut();
            await this.sendUpdatedData(data);
        }

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
        this.ludoGame.reset();
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
            try {
                console.log('fetching game data...');
                await this.ludoGame.initialize(data);
                let gameData = await this.ludoGame.getGameData();
                console.log(gameData);
                //set active 
                //join the socket
                this.socket.join(data.room);
                this.socket.to(data.room).emit("player_joined", data.userId);
                //emit the message
                // this.socket.to(data.room).emit("received_message", gameData);
                this.socket.emit("received_message", gameData);//{ 'type': 'UPDATED_GAME_DATA', 'gameData': gameData }
            } catch (err) { console.log(err); }
        }
    }

    async sendUpdatedData(data) {
        let gameData = await this.ludoGame.getGameData();
        this.socket.to(data.room).emit("received_message", gameData);
        this.socket.emit("received_message", gameData);
    }
} 