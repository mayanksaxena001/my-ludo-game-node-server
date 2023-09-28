const { GameData, House, Player, Token, Colors } = require("./game.data");
var GameRepository = require('../../mysql/db/game.repository');
var GameInfoRepository = require('../../mysql/db/gameinfo.repository');
var UserRepository = require('../../mysql/db/user.repository');
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

        let route_path = [17, 16, 15, 14, 13, 1, 2, 3, 4, 5, 6, 7, 18];

        // console.log(gameInfos);
        this.gameData.game = Object.assign({}, game);
        let count = 0;
        for (let key in gameInfos) {
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
                    let token = Object.assign({}, Token);;
                    token.id = i;//TODO : not working
                    token.color = Colors[key];
                    token.disabled = false;
                    token.active = false;
                    house.tokens.push(token);
                }

                const index = count + 1;
                player.player_turn = index;

                let route = [], route_index = index;
                do {
                    if (route_index === 4) route_index = 1;
                    route_path.map(path => {
                        if (path === 1) route_index = route_index + 1;
                        let path_value = route_index + ':' + path;
                        route.push(path_value);
                    });
                } while (route_index != index);
                house.route = route;

                player.house = house;
                this.gameData.players[userId] = player;
                this.gameData.turns[index] = userId;
                count = count + 1;

            }
        }
        this.gameData.player_count = count;
        // console.log(gameData);
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

    async rollDice(data) {
        if (data) {
            this.gameData.dice_value = data;
            await this.setPlayerTurn(data);
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