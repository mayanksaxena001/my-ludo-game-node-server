'use strict';
var GameRepository = require('../../mysql/db/game.repository');
var GameInfoRepository = require('../../mysql/db/gameinfo.repository');
const gameRepository = new GameRepository();
const gameInfoRepository = new GameInfoRepository();
export const fetchGameData = async (data) => {
    let gameId = data.game_id;
    let game = await gameRepository.getById({ id: gameId });
    let gameInfos = await gameInfoRepository.findByGameId({ game_id: gameId });

    for (var key in gameInfos) {
        const player = players[key];
        if (player.id === state.player.id) ispresent = true;
        playerCount++;
    }
}