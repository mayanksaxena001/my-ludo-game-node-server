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
            house_id: {
                type: Sequelize.UUID,
                allowNull: false,
                validate: {
                    isUUID: 4
                }
            },
            active: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true
            }
        });
    }
}