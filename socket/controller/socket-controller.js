'use strict';
var LudoGame = require('./ludo.game');
var GameRepository = require('../../mysql/db/game.repository');
const gameRepository = new GameRepository();
module.exports = class SocketController {
    constructor() {
        console.log('constructing socket controller...');
        this.ludoGame = null; this.socket = null;
        this.games = {};
        //TODO updated games cache
        this.updateGames();
    }
    updateGames = async () => {
        console.log("Updating games cache...");
        var games = await gameRepository.getAll();
        for (let game in games) {
            if (game) await this.createLudoGame(game.id);
        }
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

            this.socket.on('selected_token', async (data) => {
                await this.selectedToken(data);
            });

            this.socket.on('send_chat_message', async (data) => {
                await this.sendChatMessage(data);
            });

        }
    };

    sendChatMessage = async (data) => {
        console.log('sending message...', data);
        if (data) {
            if (this.socket) this.socket.to(data.room).emit("chat_message_recieved", data.message);
            // this.socket.emit("chat_message_recieved", data.message);
        }
    };

    selectedToken = async (data) => {
        console.log('selected token...', data);
        if (data) {
            if (!this.ludoGame) await this.createLudoGame(data.gameId);
            //TODO ; updated position
            await this.ludoGame.setDiceCastComplete(false);
            let retainPos = await this.ludoGame.moveToken(data.tokenId, data.userId);
            if (!retainPos) await this.ludoGame.setPlayerTurn();
            await this.sendUpdatedData(data);
        }
    };

    diceRoll = async (data) => {
        console.log('dice value received...', data);
        if (data) {
            if (!this.ludoGame) await this.createLudoGame(data.gameId);
            await this.ludoGame.setDiceValue(data.diceValue);
            let obj = await this.ludoGame.enableTokens(data);
            if (obj["retainPos"] === true && obj["movedToken"] === false) await this.ludoGame.setDiceCastComplete(true);
            else {
                await this.ludoGame.setDiceCastComplete(false);
                if (obj["retainPos"] === false || (obj["retainPos"] === true && obj["movedToken"] === true) === false) {
                    await this.ludoGame.setPlayerTurn();
                }
            }
            await this.sendUpdatedData(data);
        }
    };

    startGame = async (data) => {
        console.log('starting game..', data);
        if (!this.ludoGame) await this.createLudoGame(data.gameId);
        const hasStarted = await this.ludoGame.startGame();
        const playerTurn = await this.ludoGame.getPlayerTurn();
        if (hasStarted) {
            console.log('game has started..');
            let started = { has_started: hasStarted, player_turn: playerTurn };
            this.socket.to(data.room).emit("received_message", started);
            this.socket.emit("received_message", started);
            // await this.sendUpdatedData(data);
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
        console.log('Socket connected..');
        if (this.socket) {
            console.log("User connected with  %s...Socket Id: %s", this.socket.client.conn.remoteAddress, this.socket.id);
            this.socket.emit("received_message", { "connected": true });
        }
    };

    onDisconnection = async (data) => {
        console.log('Socket disconnected..', data);
        // this.socket = null;
        // if (this.ludoGame) this.ludoGame.reset();
        // this.ludoGame = null;
        //set inactive 
        // this.ludoGame.setActive(data,false);
    };

    onSendMessage = async (data) => {
        console.log("Data Received at Server : ", data);
        if (data.game.room && this.socket) this.socket.to(data.game.room).emit("received_message", data);
    };

    joinRoom = async (data) => {
        console.log("Joining room request ..", data);
        if (data.room) {
            try {
                await this.createLudoGame(data.gameId);
                let gameData = await this.ludoGame.getGameData();
                //set active 
                //join the socket
                if (this.socket) {
                    this.socket.join(data.room);
                    this.socket.to(data.room).emit("player_joined", data.userId);
                    //emit the message
                    // this.socket.to(data.room).emit("received_message", gameData);
                    this.socket.emit("received_message", gameData);//{ 'type': 'UPDATED_GAME_DATA', 'gameData': gameData }
                }
            } catch (err) { console.log(err); }
        }
    };

    sendUpdatedData = async (data) => {
        let gameData = await this.ludoGame.getGameData();
        if (this.socket) {
            this.socket.to(data.room).emit("received_message", gameData);
            this.socket.emit("received_message", gameData);
        }
        if (data.gameId) this.games[data.gameId] = this.ludoGame;
        //save to db;
    };

    async createLudoGame(gameId) {
        if (!gameId) return;
        if (!this.games[gameId]) {
            this.ludoGame = new LudoGame(gameId);
            await this.ludoGame.initialize(gameId);
            this.games[gameId] = this.ludoGame;
        } else {
            this.ludoGame = this.games[gameId];
        }
    }
} 