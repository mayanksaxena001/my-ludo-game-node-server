const { GameData, House, Player, Token, Colors } = require("./game.data");
var GameRepository = require('../../mysql/db/game.repository');
var GameInfoRepository = require('../../mysql/db/gameinfo.repository');
var UserRepository = require('../../mysql/db/user.repository');
var LudoGame = require('./ludo.game');
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
            const gameInfo = gameInfos[key];
            if (gameInfo) {
                var player = Object.assign({}, Player);
                const userId = gameInfo.user_id;
                let user = await userRepository.getById(userId);
                player.id = userId;
                player.username = user.username;
                player.color = Colors[key];
                player.disabled = false;
                player.active = false;
                if (data.userId === userId) player.active = true;

                var house = Object.assign({}, House);
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

    rollDice(player) {
        if (player !== this.currentPlayer) {
            return;
        }

        this.diceRoll = Math.floor(Math.random() * 6) + 1;
        if (this.diceRoll === 6 && player.pieces.some((p) => p.position === null)) {
            // If a piece is at home and a 6 is rolled, move that piece out
            const homePieceIndex = player.pieces.findIndex((p) => p.position === null);
            player.pieces[homePieceIndex].position = 0;
        }

        if (player.canMove(this.diceRoll)) {
            // If the player can move, switch to move mode
            this.board.setState('move');
        } else {
            // If the player can't move, switch to next player
            this.switchPlayer();
        }
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
    reset() {
        this.initialState();
        console.log('distructing a ludo game...');
    }
}  