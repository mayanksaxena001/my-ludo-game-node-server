var Sequelize = require('sequelize');
var SequelizeModel = require('./SequelizeModel');
module.exports = class LudoToken extends SequelizeModel {
    constructor(sequelize) {
        super(sequelize);
        this.init();
    }

    init() {
        this.ludo_token = this.sequelize.define('ludo_token', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
            },
            token_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            dice_value: {
                type: Sequelize.INTEGER,
                default: -1,
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