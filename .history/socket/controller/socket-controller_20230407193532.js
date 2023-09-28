'use strict';
const { GameData, Player, Game, House, Token, Colors } = require('./game.data');
var GameRepository = require('../../mysql/db/game.repository');
var GameInfoRepository = require('../../mysql/db/gameinfo.repository');
var UserRepository = require('../../mysql/db/user.repository');
const gameRepository = new GameRepository();
const gameInfoRepository = new GameInfoRepository();
const userRepository = new UserRepository();
let gameData = GameData;
module.exports = class SocketController {
    constructor() { }
    configureSocket = () => {
        return async (socket) => {
            if (socket) {
                await gameController.onConnection(socket);

                socket.on("send_message", async (data) => {
                    await gameController.onSendMessage(socket, data);
                });

                socket.on("join_room", async (data) => {
                    await gameController.joinRoom(socket, data);
                });

                socket.on('disconnect', async (data) => {
                    await gameController.onDisconnection(socket);
                });
            }
        };
    };
    fetchGameData = async (data) => {
        console.log('===============>>>>>>>>>');
        let gameId = data.gameId;
        let game = await gameRepository.getById(gameId);
        let gameInfos = await gameInfoRepository.findByGameId(gameId);

        if (!game) return null;
        // console.log(gameInfos);
        gameData = GameData;
        gameData.game = game;
        let count = 0;
        for (let key in gameInfos) {
            const gameInfo = gameInfos[key];
            if (gameInfo) {
                var player = {};
                let userId = gameInfo.user_id;
                let user = await userRepository.getById(userId);
                player.id = userId;
                player.username = user.username;
                player.color = Colors[key];
                player.disabled = false;
                player.active = false;
                if (data.userId === userId) player.active = true;

                var house = {};
                house.id = userId;
                house.disabled = false;
                house.color = Colors[key];
                house.tokens = [];
                for (let i = 1; i <= gameData.token_count; i++) {
                    let token = {};
                    token.id = i;//TODO : not working
                    token.color = Colors[key];
                    token.disabled = false;
                    token.active = false;
                    house.tokens.push(token);
                }

                player.house = house;
                gameData.players[userId] = player;
                let index = count + 1;
                gameData.turns[index] = userId;
                count = count + 1;
            }
        }
        gameData.player_count = count;
        // console.log(gameData);
        return gameData;
    };
    onConnection = async (socket) => {
        console.log("User connected with  %s...Socket Id: %s", socket.client.conn.remoteAddress, socket.id);
        socket.emit("received_message", { "connected": true });
    };
    onDisconnection = async (socket) => {
        console.log('Socket disconnected..');
        gameData = GameData;
    };
    onSendMessage = async (socket, data) => {
        console.log("Data Received at Server : ", data);
        if (data.game.room) socket.to(data.game.room).emit("received_message", data);
    };
    joinRoom = async (socket, data) => {
        console.log("Joining room request ..", data);
        if (data.room) {
            //join the socket
            socket.join(data.room);
            socket.to(data.room).emit("player_joined", data.userId);
            //emit the message
            try {
                console.log('fetching game data...');
                gameData = await module.exports.fetchGameData(data);
                socket.emit("received_message", gameData);//{ 'type': 'UPDATED_GAME_DATA', 'gameData': gameData }
            } catch (err) { console.log(err); }
        }
    }
} 