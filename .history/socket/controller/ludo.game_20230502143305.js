const { GameData, House, Player, Token, Colors, Game } = require("./game.data");
var GameRepository = require('../../mysql/db/game.repository');
var GameInfoRepository = require('../../mysql/db/gameinfo.repository');
var UserRepository = require('../../mysql/db/user.repository');
var LudoTokenRepository = require('../../mysql/db/ludotoken.repository');
const { user } = require("../../mysql/models/models");
const gameRepository = new GameRepository();
const gameInfoRepository = new GameInfoRepository();
const userRepository = new UserRepository();
const ludoTokenRepository = new LudoTokenRepository();
module.exports = class LudoGame {
    constructor() {
        console.log('constructing a ludo game...');
        this.initialState();
    }

    initialState() {
        this.players = {};
        this.board = {};
        this.currentPlayer = null;
        this.diceRoll = null;
        this.gameData = Object.assign({}, GameData);
    }

    async initialize(data) {
        console.log('initializing game data...');
        console.log('===============>>>>>>>>>');
        const gameId = data.gameId;
        const game = await gameRepository.getById(gameId);
        if (!game) return null;
        const gameInfos = await gameInfoRepository.findByGameId(gameId);

        // console.log(gameInfos);
        this.gameData.home = [];
        this.gameData.game = Object.assign(Game, game);
        this.gameData.player_count = game.player_count;
        this.gameData.token_count = game.token_count;
        this.gameData.player_turn = game.player_turn;
        this.gameData.dice_value = game.dice_value;
        this.gameData.time_out = game.time_out;

        let count = 0;
        for (let key in gameInfos) {
            const index = count + 1;
            const gameInfo = gameInfos[key];
            if (gameInfo) {
                const tokens = await ludoTokenRepository.findByHouseId(gameInfo.id);
                let player = Object.assign({}, Player);
                const userId = gameInfo.user_id;
                let user = await userRepository.getById(userId);
                player.id = userId;
                player.username = user.username;
                player.color = Colors[key];
                player.disabled = false;
                player.active = false;
                // if (data.userId === userId) player.active = true;

                let house = Object.assign({}, House);
                house.id = userId;
                house.disabled = false;
                house.color = Colors[key];
                house.tokens = [];
                if (tokens.length > 0) {
                    for (let i = 0; i <= this.tokens.length; i++) {
                        let token = Object.assign(tokens[i], Token);
                        token.token_id = index + ':' + i;//TODO
                        token.color = Colors[key];
                        token.disabled = false;
                        token.active = false;
                        token.house_id = userId;
                        house.tokens.push(token);
                    }
                }

                player.player_turn = index;
                //TODO ; temp hardcoded,create logic
                house.route = this.getRoute(index);
                player.house = house;

                this.gameData.players[userId] = player;
                this.gameData.turns[index] = userId;
                count = count + 1;

            }
        }
        // this.gameData.player_count = count;
        // console.log(gameData);
    }

    getRoute = (index) => {
        let route = [];
        if (index === 1) {
            route = ['1-17', '1-16', '1-15', '1-14', '1-13'
                , '2-1', '2-2', '2-3', '2-4', '2-5', '2-6', '2-7', '2-18', '2-17', '2-16', '2-15', '2-14', '2-13'
                , '3-1', '3-2', '3-3', '3-4', '3-5', '3-6', '3-7', '3-18', '3-17', '3-16', '3-15', '3-14', '3-13'
                , '4-1', '4-2', '4-3', '4-4', '4-5', '4-6', '4-7', '4-18', '4-17', '4-16', '4-15', '4-14', '4-13'
                , '1-1', '1-2', '1-3', '1-4', '1-5', '1-6', '1-7', '1-8', '1-9', '1-10', '1-11', '1-12', 'home'];
        }
        else if (index === 2) {
            route = ['2-17', '2-16', '2-15', '2-14', '2-13'
                , '3-1', '3-2', '3-3', '3-4', '3-5', '3-6', '3-7', '3-18', '3-17', '3-16', '3-15', '3-14', '3-13'
                , '4-1', '4-2', '4-3', '4-4', '4-5', '4-6', '4-7', '4-18', '4-17', '4-16', '4-15', '4-14', '4-13'
                , '1-1', '1-2', '1-3', '1-4', '1-5', '1-6', '1-7', '1-18', '1-17', '1-16', '1-15', '1-14', '1-13'
                , '2-1', '2-2', '2-3', '2-4', '2-5', '2-6', '2-7', '2-8', '2-9', '2-10', '2-11', '2-12', 'home'];
        }
        else if (index === 3) {
            route = ['3-17', '3-16', '3-15', '3-14', '3-13'
                , '4-1', '4-2', '4-3', '4-4', '4-5', '4-6', '4-7', '4-18', '4-17', '4-16', '4-15', '4-14', '4-13'
                , '1-1', '1-2', '1-3', '1-4', '1-5', '1-6', '1-7', '1-18', '1-17', '1-16', '1-15', '1-14', '1-13'
                , '2-1', '2-2', '2-3', '2-4', '2-5', '2-6', '2-7', '2-18', '2-17', '2-16', '2-15', '2-14', '2-13'
                , '3-1', '3-2', '3-3', '3-4', '3-5', '3-6', '3-7', '3-8', '3-9', '3-10', '3-11', '3-12', 'home'];
        }
        else if (index === 4) {
            route = ['4-17', '4-16', '4-15', '4-14', '4-13'
                , '1-1', '1-2', '1-3', '1-4', '1-5', '1-6', '1-7', '1-18', '1-17', '1-16', '1-15', '1-14', '1-13'
                , '2-1', '2-2', '2-3', '2-4', '2-5', '2-6', '2-7', '2-18', '2-17', '2-16', '2-15', '2-14', '2-13'
                , '3-1', '3-2', '3-3', '3-4', '3-5', '3-6', '3-7', '3-18', '3-17', '3-16', '3-15', '3-14', '3-13'
                , '4-1', '4-2', '4-3', '4-4', '4-5', '4-6', '4-7', '4-8', '4-9', '4-10', '4-11', '4-12', 'home'];
        }
        return route;
    }

    getGameData = async () => {
        return this.gameData;
    }

    startGame = async () => {
        if (this.gameData && !this.gameData.has_started) this.gameData.has_started = true;
        return this.gameData.has_started;
    }

    async setActive(data, value) {
        const userId = data.userId;
        const gameId = data.gameId;
        if (!value) return;

        if (this.gameData && this.gameData.players) {
            for (let key in this.gameData.players) {
                let player = this.gameData.players[userId];
                if (player) {
                    player.setActive(value);
                    player.setDisabled(!value);
                }
            }
        }
        ///set active
    }

    addPlayer(id) {
        const player = new LudoPlayer(id);
        this.players[id] = player;
        return player;
    }

    removePlayer(player) {
        delete this.players[player.id];
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
        this.gameData.player_turn = player_turn;
    }

    reset = async () => {
        console.log('reset a ludo game...');
        this.initialState();
    }
}  