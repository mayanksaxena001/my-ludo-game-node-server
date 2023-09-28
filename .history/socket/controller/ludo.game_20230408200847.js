class LudoGame {
    constructor() {
        this.players = {};
        this.board = new LudoBoard();
        this.currentPlayer = null;
        this.diceRoll = null;
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
}  