var Sequelize = require('sequelize');
var SequelizeModel = require('./SequelizeModel');
module.exports = class Socket extends SequelizeModel {
    constructor(sequelize) {
        super(sequelize);
        this.init();
    }

    init() {
        this.game = this.sequelize.define('socket', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
            },
            socket_id: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            client: {
                type: Sequelize.STRING,
                allowNull: false,
            }
        });
    }
}