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
        username: ''
    },
    House: {
        id: '',
        color: '',
        tokens: [],
        disabled: false,
        classname: '',
        route:[]
    },
    Token: {
        id: '',
        active: false,
        color: '',
        disabled: false,
        classname: '',
        current_path:'home-source' // home-source,{id-block_num},home-target
    },
    Colors: ['#ff0000', '#0000ff', '#008000', '#ffff00']
}
