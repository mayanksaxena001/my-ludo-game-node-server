var {
    ludotoken
} = require('../models/models');
module.exports = class LudoTokenRepository {
    constructor() { }

    async update(data, id) {
        data.updatedAt = new Date();
        return await ludotoken.findOne({ where: { id: id } }).then(u => u.update(data));
    };
    async remove(id) {
        return await ludotoken.destroy({ where: { id: id } });
    };
    async getById(id) {
        return await ludotoken.findOne({ where: { id: id } });
    };
    async findByHouseId( houseId) {//houseId :gameInfoId
        return await ludotoken.findAll({ where: { house_id: houseId } });
    };
    async getAll() {
        return await ludotoken.findAll().then(u => { return u; });
    };
    async create(data) {
        return await ludotoken.create(data);
    };
    async findByTokenId(id) {
        return await ludotoken.findAll({ where: { token_id: id } });
    }
}