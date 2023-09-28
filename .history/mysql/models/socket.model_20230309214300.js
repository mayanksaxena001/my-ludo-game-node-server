var Sequelize = require('sequelize');
var SequelizeModel = require('./SequelizeModel');
module.exports = class Socket extends SequelizeModel {
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
            created_by: {
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