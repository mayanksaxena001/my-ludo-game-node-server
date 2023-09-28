module.exports = {
    GameData: {
        game: {},
        has_started: false,
        has_stopped: false,
        player_count: 2,
        token_count: 2,
        time_out: 10,
        dice_value: 0,
        player_turn: 1,
        players: {},
        turns: {},
        diceCastComplete: false
    },
    Game: {
        id: '',
        room: 0,
        created_by: '',
        active: false,
        createdAt: '',
        updatedAt: ''
    },

    Player: {
        id: '',
        player_turn: 0,
        color: '',
        house: {},
        username: '',
        active: false,
        disabled: false
    },
    House: {
        id: '',
        color: '',
        tokens: [],
        active: false,
        disabled: false,
        classname: '',
        route:[] //{id-block_num}
    },
    Token: {
        id: '',
        color: '',
        active: false,
        disabled: false,
        classname: '',
        safe:false,
        position:'base' // base,{id-block_num},home
    },
    Colors: ['#ff0000', '#0000ff', '#008000', '#ffff00']
}
