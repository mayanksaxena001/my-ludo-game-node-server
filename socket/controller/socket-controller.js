'use strict';
var LudoGame = require('./ludo.game');
var io;
var socket;
var sCache;
var ludoGame;
exports.initSocket = async (sio, gameSocket, socketCache) => {
    // constructor(io ,socket,socketCache) {
    //     console.log('constructing socket controller...');
    //     if(socket){
    //         ludoGame = null; 
    //         socket = socket;
    //         configureSocket();
    //     }
    //     socketCache=socketCache;
    //     //TODO updated games cache
    // }
    io = sio;
    socket = gameSocket;
    sCache = socketCache;

    console.log('Socket connected..');
    console.log("User connected with  %s...Socket Id: %s", socket.client.conn.remoteAddress, socket.id);
    socket.emit("received_message", { "connected": true });

    socket.on("send_message", onSendMessage);
    socket.on("join_room", joinRoom);
    socket.on('disconnect', onDisconnection);
    socket.on('start_game', startGame);
    socket.on('dice_roll', diceRoll);
    socket.on('time_out', timeOut);
    socket.on('selected_token', selectedToken);
    socket.on('send_chat_message', sendChatMessage);
}

let sendChatMessage = async (data) => {
    console.log('sending message...', data);
    if (data) {
        if (socket) socket.to(data.room).emit("chat_message_recieved", data.message);
        // socket.emit("chat_message_recieved", data.message);
    }
};

let selectedToken = async (data) => {
    console.log('selected token...', data);
    if (data) {
        if (!ludoGame) await createLudoGame(data.gameId, data.userId);
        //TODO ; updated position
        await ludoGame.setDiceCastComplete(false);
        let retainPos = await ludoGame.moveToken(data.tokenId, data.userId);
        if (!retainPos) await ludoGame.setPlayerTurn();
        await sendUpdatedData(data);
    }
};

let diceRoll = async (data) => {
    console.log('dice value received...', data);
    if (data) {
        if (!ludoGame) await createLudoGame(data.gameId, data.userId);
        await ludoGame.setDiceValue(data.diceValue);
        let obj = await ludoGame.enableTokens(data);
        if (obj["retainPos"] === true && obj["movedToken"] === false) await ludoGame.setDiceCastComplete(true);
        else {
            await ludoGame.setDiceCastComplete(false);
            if (obj["retainPos"] === false || (obj["retainPos"] === true && obj["movedToken"] === true) === false) {
                await ludoGame.setPlayerTurn();
            }
        }
        await sendUpdatedData(data);
    }
};

let startGame = async (data) => {
    console.log('starting game..', data);
    if (!ludoGame) await createLudoGame(data.gameId, data.userId);
    const hasStarted = await ludoGame.startGame();
    const playerTurn = await ludoGame.getPlayerTurn();
    if (hasStarted) {
        console.log('game has started..');
        let started = { has_started: hasStarted, player_turn: playerTurn };
        socket.to(data.room).emit("received_message", started);
        socket.emit("received_message", started);
        // await sendUpdatedData(data);
        if (data.gameId) {
            let gameData = await ludoGame.getGameData();
            sCache.setCache(data.gameId, gameData);
        }
    }
};

let timeOut = async (data) => {
    console.log('time out..', data);
    if (data) {
        await ludoGame.timeOut();
        await sendUpdatedData(data);
    }

};

let onDisconnection = async (data) => {
    console.log('Socket disconnected..', data);
    // socket = null;
    // if (ludoGame) ludoGame.reset();
    try {
        if (ludoGame !== null) {
            let playerId = await ludoGame.getCurrentPlayer();
            let gameData = await ludoGame.getGameData();
            console.log("disconected userId : ", playerId);
            //set inactive 
            if (playerId && gameData.game.id) {
                console.log("disconnected from gameId : ", gameData.game.id);
                await sCache.setInactive(playerId, gameData.game.id);
            }
        }
        ludoGame = null;
    } catch (error) {
        console.error(error);
    }
};

let onSendMessage = async (data) => {
    console.log("Data Received at Server : ", data);
    if (data.game.room && socket) socket.to(data.game.room).emit("received_message", data);
};

let joinRoom = async (data) => {
    console.log("Joining room request ..", data);
    if (data.room) {
        try {
            await createLudoGame(data.gameId, data.userId);
            let gameData = await ludoGame.getGameData();
            // sCache.setCache(data.gameId, gameData);
            //join the socket
            if (socket) {
                socket.join(data.room);
                socket.emit("received_message", gameData);//{ 'type': 'UPDATED_GAME_DATA', 'gameData': gameData }
                if (gameData.has_started) {
                    socket.to(data.room).emit("player_joined", data.userId);
                }
                else {
                    socket.to(data.room).emit("received_message", gameData);
                }
                //emit the message
                // socket.to(data.room).emit("received_message", gameData);
            }
        } catch (err) { console.log(err); }
        // console.log(games);
    }
};

let sendUpdatedData = async (data) => {
    let gameData = await ludoGame.getGameData();
    if (socket) {
        socket.to(data.room).emit("received_message", gameData);
        socket.emit("received_message", gameData);
    }
    //save to cache db;
    if (data.gameId) sCache.setCache(data.gameId, gameData);
};

let createLudoGame = async (gameId, userId) => {
    if (!gameId) return;
    let gameData = await sCache.getCacheValue(gameId);
    ludoGame = new LudoGame(userId);
    if (gameData !== undefined) {
        //updated gamedata
        if (gameData.has_started) {
            console.log("gamedata data from cache present");
            ludoGame.setGameData(gameData);
        }
        else {
            console.log("gamedata data from cache presnet ..updating ..");
            await ludoGame.initialize(gameId);
            await ludoGame.setActive(userId, true);
            let data = await ludoGame.getGameData();
            if (data.players) {
                for (let playerId in gameData.players) {
                    if (playerId !== userId) {
                        let player = gameData.players[playerId];
                        if (player) {
                            await ludoGame.setActive(playerId, player.active);
                        }
                    }
                }
            }
            ludoGame.setGameData(data);
            sCache.setCache(gameId, data);
        }
    } else {
        console.log("gamedata data from cache absent..creating new ..");
        await ludoGame.initialize(gameId);
        await ludoGame.setActive(userId, true);
        gameData = await ludoGame.getGameData();
        sCache.setCache(gameId, gameData);
    }
}