var Sequelize = require('sequelize');
var SequelizeModel = require('./SequelizeModel');
module.exports = class GameInfo extends SequelizeModel {
    constructor(sequelize) {
        super(sequelize);
        this.init();
    }

    init() {
        this.gameinfo = this.sequelize.define('game_info', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
            },
            game_id: {
                type: Sequelize.UUID,
                allowNull: false,
                validate: {
                    isUUID: 4
                }
            },
            user_id: {
                type: Sequelize.UUID,
                allowNull: false,
                validate: {
                    isUUID: 4
                }
            },
            color: {
                type: Sequelize.STRING,
            },
            active: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true
            }
        });
    }
}