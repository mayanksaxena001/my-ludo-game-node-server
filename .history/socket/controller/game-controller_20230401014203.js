'use strict';
var { GameData, Player, Game, House, Token } = require('./game.data');
var GameRepository = require('../../mysql/db/game.repository');
var GameInfoRepository = require('../../mysql/db/gameinfo.repository');
const gameRepository = new GameRepository();
const gameInfoRepository = new GameInfoRepository();
export const fetchGameData = async (data) => {
    let gameId = data.game_id;
    let game = await gameRepository.getById({ id: gameId });
    let gameInfos = await gameInfoRepository.findByGameId({ game_id: gameId });

    let gameData = GameData;

    for (var key in gameInfos) {
        const gameInfo = gameInfos[key];
        var player = Player;
        player.id = gameInfo.user_id;

    }
}