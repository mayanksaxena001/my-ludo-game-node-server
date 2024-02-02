const NodeCache = require("node-cache");
let socketCache;
const { House, Player, Token, Colors, Game, GameData, getRoute } = require("./game.data");
var GameRepository = require('../../mysql/db/game.repository');
var GameInfoRepository = require('../../mysql/db/gameinfo.repository');
var UserRepository = require('../../mysql/db/user.repository');
var LudoTokenRepository = require('../../mysql/db/ludotoken.repository');
const gameRepository = new GameRepository();
const gameInfoRepository = new GameInfoRepository();
const userRepository = new UserRepository();
const ludoTokenRepository = new LudoTokenRepository();
class SocketCache {

    constructor() {
        this.myCache = new NodeCache({ checkperiod: 120 });
        this.initCache();
    }

    async initCache() {
        this.myCache.flushAll();
        var games = await gameRepository.getAll();
        for (let i = 0; i < games.length; i++) {
            const game = games[i];
            if (game !== undefined) {
                const gameData = await this.initializeGameDAta(game);
                this.setCache(game.id, gameData);
                // if (!this.getCacheValue(game.id)) {
                // }
            }
        }
        console.log(this.myCache.keys());
    }

    setInactive = async (playerId, gameId) => {
        if (playerId === undefined) return;
        if (gameId === undefined) return;
        let gameData = await this.getCacheValue(gameId);
        console.log('setting incactive player in cache..', playerId);
        if (gameData && gameData.players) {
            console.log('setting incactive player in game..', gameId);
            let player = gameData.players[playerId];
            if (player) {
                console.log('setting incactive player in cache..', playerId);
                player.active = false;
                player.disabled = true;
                gameData.players[playerId] = player;
            }
        }
        this.setCache(gameId, gameData);
    }

    async initializeGameDAta(game) {
        if (game === undefined) return null;
        const gameId = game.id;
        console.log('initializing game data...' + gameId);
        let gameData = Object.assign({}, GameData);
        // console.log(gameInfos);
        gameData.home = [];
        let _game = await this.extractGame(game);
        gameData.game = _game;
        gameData.player_count = game.player_count;
        gameData.token_count = game.token_count;
        gameData.player_turn = game.player_turn;
        gameData.dice_value = game.dice_value;
        gameData.time_out = game.time_out;
        const gameInfos = await gameInfoRepository.findByGameId(gameId);

        const obj = await this.extractPlayers(gameInfos);
        if (obj.players) gameData.players = obj.players;
        if (obj.turns) gameData.turns = obj.turns;
        // console.log(this.myCache);
        console.log("data initialization finished...")
        return gameData;
    }

    async extractPlayers(gameInfos) {
        let obj = { players: {}, turns: {} };
        let gameInfosCount = gameInfos.length;
        console.log(gameInfosCount);
        for (var key = 0; key < gameInfosCount; key++) {
            const index = key + 1;
            const gameInfo = gameInfos[key];
            const color = Colors[key];
            if (gameInfo) {
                let player = Object.assign({}, Player);
                const userId = gameInfo.user_id;
                const user = await userRepository.getById(userId);
                player.id = userId;
                player.username = user.username;
                player.color = color;
                player.disabled = false;
                player.active = false;
                // if (data.userId === userId) player.active = true;
                let house = Object.assign({}, House);
                house.id = userId;
                house.disabled = false;
                house.color = color;
                house.tokens = [];
                const tokens = await ludoTokenRepository.findByHouseId(gameInfo.id);
                if (tokens && tokens.length > 0) {
                    for (var i = 0; i <= tokens.length; i++) {
                        if (tokens[i]) {
                            let token = await this.extractToken(tokens[i]);
                            token.token_id = index + ':' + (i + 1); //TODO
                            token.color = color;
                            token.house_id = userId;
                            token.disabled = false;
                            token.active = false;
                            // token.position=index+'-12';
                            house.tokens.push(token);
                        }
                    }
                }
                player.player_turn = index;
                //TODO ; temp hardcoded,create logic
                house.route = getRoute(index);

                player.house = house;
                obj.players[userId] = player;
                obj.turns[index] = userId;

            }
        }
        return obj;
    }

    extractGame = async (game) => {
        if (game) {
            let _game = Object.assign({}, Game);
            if (game.id) _game.id = game.id;
            if (game.room) _game.room = game.room;
            if (game.created_by) _game.created_by = game.created_by;
            if (game.active) _game.active = game.active;
            if (game.createdAt) _game.createdAt = game.createdAt;
            if (game.updatedAt) _game.updatedAt = game.updatedAt;
            return _game;
        }
        return {};
    }

    extractToken = async (token) => {
        if (token) {
            let _token = Object.assign({}, Token);
            if (token.id) _token.id = token.id;
            if (token.house_id) _token.house_id = token.house_id;
            if (token.token_id) _token.token_id = token.token_id;
            if (token.color) _token.color = token.color;
            if (token.active) _token.active = token.active;
            if (token.disabled) _token.disabled = token.disabled;
            if (token.classname) _token.classname = token.classname;
            if (token.safe) _token.safe = token.safe;
            if (token.position) _token.position = token.position;
            return _token;
        }
        return {};
    }

    async setCache(key, value) {
        // console.log("setting cache..", key, value);
        this.myCache.set(key, value, [300000]);//5 min ttl
    }

    //key is gameId
    async getCacheValue(key) {
        let value = await this.myCache.get(key);
        // console.log("getting cache..", key, value);
        return value;
    }

    async flush() {
        this.myCache.flushAll();
    }
}
socketCache = Object.freeze(new SocketCache());
module.exports = socketCache;