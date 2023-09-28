const { GameData, House, Player, Token, Colors } = require("./game.data");
var GameRepository = require('../../mysql/db/game.repository');
var GameInfoRepository = require('../../mysql/db/gameinfo.repository');
var UserRepository = require('../../mysql/db/user.repository');
const { user } = require("../../mysql/models/models");
const gameRepository = new GameRepository();
const gameInfoRepository = new GameInfoRepository();
const userRepository = new UserRepository();
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
        this.gameData.game = Object.assign({}, game);
        let count = 0;
        for (let key in gameInfos) {
            const index = count + 1;
            const gameInfo = gameInfos[key];
            if (gameInfo) {
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
                for (let i = 1; i <= this.gameData.token_count; i++) {
                    let token = Object.assign({}, Token);
                    token.id = index + ':' + i;//TODO : not working
                    token.color = Colors[key];
                    token.disabled = false;
                    token.active = false;
                    house.tokens.push(token);
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
        this.gameData.player_count = count;
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
        if (data) {
            this.gameData.diceCastComplete = data;
        }
    }

    async enableTokens(userId) {
        if (userId) {
            for (let key in this.gameData.players) {
                let player = this.gameData.players[userId];
                if (player) {
                    let house = player.house;
                    let tokens = house.tokens;
                    for (let i = 1; i <= tokens.length; i++) {
                        let token = Object.assign({}, tokens[i]);
                        if (token) {
                            token.active = true;
                            this.gameData.players[userId].house.tokens[i] = token;
                        }
                    }
                }
            }
        }
    }

    async timeOut(data) {
        if (data) {
            const randomNum = Math.floor(Math.random() * 6) + 1;
            this.gameData.dice_value = randomNum;
            await this.setPlayerTurn(data);
        }
    }

    async setPlayerTurn(data) {
        let player_turn = this.gameData.player_turn;
        if (data !== 6) {
            player_turn = player_turn + 1;
            if (player_turn > this.gameData.player_count)
                player_turn = 1; //rolling turns
        }
        this.gameData.player_turn = player_turn;
    }

    movePiece(player, pieceIndex, steps) {
        if (player !== this.currentPlayer) {
            return;
        }

        const piece = player.pieces[pieceIndex];
        if (piece.position === null) {
            // Can't move a piece that is at home
            return;
        }

        const newPosition = piece.position + steps;
        if (newPosition > 56) {
            // Can't move beyond the end of the board
            return;
        }

        if (!this.board.canMove(player.color, piece.position, newPosition)) {
            // Can't move
        }
    }
    reset = async () => {
        console.log('reset a ludo game...');
        this.initialState();
    }
}  