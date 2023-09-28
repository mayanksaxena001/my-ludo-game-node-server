var { socket } = require('../models/models');
module.exports = class GameRepository {
    constructor() { }

    async update(data, id) {
        data.updatedAt = new Date();
        return await socket.findOne({ where: { id: id } }).then(u => u.update(data));
    };
    async remove(id) {
        return await socket.destroy({ where: { id: id } });
    };
    async getById(id) {
        return await socket.findOne({ where: { id: id } });
    };
    async getAll() {
        return await socket.findAll().then(u => { return u; });
    };
    async create(data) {
        return await socket.create(data);
    };

}