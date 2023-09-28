var Sequelize = require('sequelize');
var SequelizeModel = require('./SequelizeModel');
module.exports = class Game extends SequelizeModel {
    constructor(sequelize) {
        super(sequelize);
        this.init();
    }

    init() {
        this.game = this.sequelize.define('game', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
            },
            room: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            player_count: {
                type: Sequelize.INTEGER,
                default: 2,
            },
            token_count: {
                type: Sequelize.INTEGER,
                default: 2,
            },
            time_out: {
                type: Sequelize.INTEGER,
                default: 30,
            },
            created_by: {
                type: Sequelize.UUID,
                allowNull: false,
                validate: {
                    isUUID: 4
                }
            },
            active: {//game start
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true
            }
        });
    }
}