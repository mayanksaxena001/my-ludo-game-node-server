'use strict';
const { GameData, Player, Game, House, Token, Colors } = require('./game.data');
var GameRepository = require('../../mysql/db/game.repository');
var GameInfoRepository = require('../../mysql/db/gameinfo.repository');
var UserRepository = require('../../mysql/db/user.repository');
var LudoGame = require('./ludo.game');
const gameRepository = new GameRepository();
const gameInfoRepository = new GameInfoRepository();
const userRepository = new UserRepository();
let gameData = GameData;

const ludoGame = new LudoGame();
module.exports = class SocketController {
    constructor() {
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
        }
    };
    fetchGameData = async (data) => {
        return this.ludoGame.getGameData();
    };
    onConnection = async () => {
        //initialise state
        await ludoGame.initialize();
        console.log("User connected with  %s...Socket Id: %s", this.socket.client.conn.remoteAddress, this.socket.id);
        this.socket.emit("received_message", { "connected": true });
    };
    onDisconnection = async (data) => {
        console.log('Socket disconnected..', data);
        gameData = null;
        this.socket = null;

        //set inactive 
        this.ludoGame.setActive(data);
    };
    onSendMessage = async (data) => {
        console.log("Data Received at Server : ", data);
        if (data.game.room) this.socket.to(data.game.room).emit("received_message", data);
    };
    joinRoom = async (data) => {
        console.log("Joining room request ..", data);
        if (data.room) {
            //set active 
            this.ludoGame.setActive(data);

            //join the socket
            this.socket.join(data.room);
            this.socket.to(data.room).emit("player_joined", data.userId);
            //emit the message
            try {
                console.log('fetching game data...');
                let gameData = await this.ludoGame.getGameData();
                this.socket.emit("received_message", gameData);//{ 'type': 'UPDATED_GAME_DATA', 'gameData': gameData }
            } catch (err) { console.log(err); }
        }
    }
} 