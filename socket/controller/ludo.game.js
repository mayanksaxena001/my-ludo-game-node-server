const { GameData, House, Player, Token, Colors, Game, getRoute } = require("./game.data");
var GameRepository = require('../../mysql/db/game.repository');
var GameInfoRepository = require('../../mysql/db/gameinfo.repository');
var UserRepository = require('../../mysql/db/user.repository');
var LudoTokenRepository = require('../../mysql/db/ludotoken.repository');
const gameRepository = new GameRepository();
const gameInfoRepository = new GameInfoRepository();
const userRepository = new UserRepository();
const ludoTokenRepository = new LudoTokenRepository();
module.exports = class LudoGame {
    constructor() {
        console.log('constructing a ludo game...');
        this.initialState();
        // if (!gameData) {
        //     this.gameData = Object.assign({}, GameData);
        // } else
        //     this.gameData = gameData;
    }

    initialState() {
        this.players = {};
        this.board = {};
        this.currentPlayer = null;
        this.diceRoll = null;
        this.gameData = Object.assign({}, GameData);
    }

    async initialize(gameId) {
        console.log('initializing game data...');
        console.log('===============>>>>>>>>>');
        const game = await gameRepository.getById(gameId);
        if (!game) return null;
        this.gameData = Object.assign({}, GameData);
        // console.log(gameInfos);
        this.gameData.home = [];
        let _game = await this.extractGame(game);
        this.gameData.game = _game;
        this.gameData.player_count = game.player_count;
        this.gameData.token_count = game.token_count;
        this.gameData.player_turn = game.player_turn;
        this.gameData.dice_value = game.dice_value;
        this.gameData.time_out = game.time_out;

        const gameInfos = await gameInfoRepository.findByGameId(gameId);
        const obj = await this.extractPlayers(gameInfos);
        if (obj.players) this.gameData.players = obj.players;
        if (obj.turns) this.gameData.turns = obj.turns;
    }

    setGameData = async (gameData) => {
        this.gameData = gameData;
    }

    getGameData = async () => {
        return this.gameData;
    }

    getPlayerTurn = async () => {
        return this.gameData.player_turn;
    }

    startGame = async () => {
        let playerCount = 0;
        for (let key in this.gameData.players) {
            let player = this.gameData.players[key];
            if (player) {//only active players
                playerCount++;
            }
        }
        if (this.gameData && !this.gameData.has_started && playerCount === this.gameData.player_count) {
            this.gameData.player_turn = Math.floor(Math.random() * this.gameData.player_count) + 1;
            this.gameData.has_started = true;
            this.gameData.has_stopped = false;
        }
        //TODO to be removed
        // this.gameData.player_turn = Math.floor(Math.random() * this.gameData.player_count) + 1;
        // this.gameData.has_started = true;
        // this.gameData.has_stopped = false;
        return this.gameData.has_started;
    }

    setActive = async (data, value) => {
        const userId = data.userId;
        const gameId = data.gameId;
        if (!value) return;

        if (this.gameData && this.gameData.players) {
            let player = this.gameData.players[userId];
            if (player) {
                player.active = value;
                player.disabled = !value;
                this.gameData.players[userId] = player;
            }
        }
        ///set active
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

    async setDiceValue(dice_value) {
        if (dice_value) {
            this.gameData.dice_value = dice_value;
        }
    }

    async setDiceCastComplete(data) {
        this.gameData.diceCastComplete = data;
    }

    async enableTokens(data) {
        let tokensActive = [];
        let userId = data.userId;
        let diceValue = data.diceValue;

        if (this.gameData.players && userId) {
            let player = this.gameData.players[userId];
            if (player) {
                let house = player.house;
                if (house) {
                    const routes = house.route;
                    this.gameData.players[userId].house.tokens.map(token => {
                        if (token.position !== 'home') {
                            let newPosition = 0;
                            for (let i = 0; i < routes.length; i++) {
                                if (routes[i] === token.position) {
                                    newPosition = i + diceValue;
                                }
                            }
                            //TODO
                            if (diceValue === 6 && token.position === 'base') {
                                token.active = true;
                                tokensActive.push(token);
                            } else if (token.position !== 'base' && newPosition >= 0 && routes.length > newPosition) {
                                token.active = true;
                                tokensActive.push(token);
                            }
                        }
                    });

                }
            }
        }
        let retainPos = false;
        let movedToken = false;
        if (tokensActive.length === 1) {
            //move token;
            let token = tokensActive[0];
            if (token) {
                retainPos = await this.moveToken(token.id, userId);
                movedToken = true;
            }
        } else if (tokensActive.length > 0) {
            retainPos = true;
        }
        return { "retainPos": retainPos, "movedToken": movedToken };
    }

    async moveToken(tokenId, userId) {
        if (this.gameData.players && userId) {
            let tokens = Object.assign({}), route = [], playerToken = {};
            let dice_value = this.gameData.dice_value;
            let retainPos = false;
            for (let key in this.gameData.players) {
                //fetch all tokens
                let player = this.gameData.players[key];
                if (player && player.house) {
                    this.gameData.players[key].house.tokens.map(token => {
                        token.active = false;
                        if (token.id === tokenId) {
                            playerToken = token;
                        }
                        if (token && token.position) {
                            if (tokens[token.position]) {
                                tokens[token.position].push(token);
                            } else {
                                tokens[token.position] = [];
                                tokens[token.position].push(token);
                            }
                        }
                    });
                }
            }
            //just for check
            if (playerToken.house_id !== userId) return;
            route = this.gameData.players[playerToken.house_id].house.route;
            if (tokens && route.length > 0 && playerToken) {
                let position = null;
                if (dice_value === 6 && playerToken.position === 'base') {
                    //if token on base positon
                    position = 0;
                } else {
                    //fetch new position;
                    for (let i = 0; i < route.length; i++) {
                        if (route[i] === playerToken.position) {
                            position = i + dice_value;
                        }
                    }
                }

                //change token position,
                if (position >= 0 && route.length > position) {
                    playerToken.position = route[position];
                    let homecount = 0;
                    this.gameData.players[userId].house.tokens.map(token => {
                        if (playerToken.id === token.id) {
                            token.position = route[position];
                            if (token.position === 'home') {
                                //TODO : retain player turn
                                this.gameData.players[userId].house.home.push(token.id);
                                retainPos = true;
                            }
                        }
                        if (token.position === 'home') {
                            homecount++;
                        }
                    });
                    if (homecount === this.gameData.token_count) {
                        this.gameData.home.push(userId);
                    }

                    this.finishGame();
                }
                //kill a token ,if any
                if (playerToken.position !== 'base') {
                    let _tokens = tokens[playerToken.position];
                    if (_tokens) {
                        _tokens.map(token => {
                            if (token.position !== 'home' && token.house_id !== playerToken.house_id) {
                                this.gameData.players[token.house_id].house.tokens.map(key => {
                                    if (key.id === token.id) {
                                        key.position = 'base';
                                        retainPos = true;
                                    }
                                });;
                            }
                        });
                    }
                }

            }

            return retainPos;
        }
    }

    finishGame() {
        if (this.gameData.home.length === (this.gameData.player_count - 1)) {
            console.log("finishing game...");
            this.gameData.has_stopped = true;
            this.gameData.has_started = false;
        }
    }

    async timeOut(data) {
        if (data) {
            const randomNum = Math.floor(Math.random() * 6) + 1;
            this.gameData.dice_value = randomNum;
            await this.setPlayerTurn();
        }
    }

    async setPlayerTurn() {
        console.log('setting player turn');
        let dice_value = this.gameData.dice_value;
        let player_turn = this.gameData.player_turn;
        if (dice_value !== 6) {
            player_turn = player_turn + 1;
            if (player_turn > this.gameData.player_count)
                player_turn = 1; //rolling turns
        }
        let userId = this.gameData.turns[player_turn];
        let player = this.gameData.players[userId];
        if(!player.active){
            player_turn = player_turn + 1;
            if (player_turn > this.gameData.player_count)
                player_turn = 1; //rolling turns
        }
        this.gameData.player_turn = player_turn;
    }

    reset = async () => {
        console.log('resetting a ludo game...');
        this.initialState();
    }
}  