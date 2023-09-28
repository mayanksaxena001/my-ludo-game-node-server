var { gameInfo } = require('../models/models');
module.exports = class GameRepository {
    constructor() { }

    async update(data, id) {
        data.updatedAt = new Date();
        return await gameInfo.findOne({ where: { id: id } }).then(u => u.update(data));
    };
    async remove(id) {
        return await gameInfo.destroy({ where: { id: id } });
    };
    async getById(id) {
        return await gameInfo.findOne({ where: { id: id } });
    };
    async findByGameAndUserId(gameId, userId) {
        return await gameInfo.findOne({ where: { game_id: gameId, user_id: userId } });
    };
    async getAll() {
        return await gameInfo.findAll().then(u => { return u; });
    };
    async create(data) {
        return await gameInfo.create(data);
    };
    async findByGameId(id) {
        return await gameInfo.findAll({ where: { game_id: id } });
    };
}