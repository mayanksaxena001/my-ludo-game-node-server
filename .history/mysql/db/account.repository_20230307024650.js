var {game} = require( '../models/models');
module.exports =  class GameRepository {
    constructor() { }

    async update(data, id) {
        data.updatedAt = new Date();
        return await game.find({ where: { id: id } }).then(u => u.update(data));
    };
    async remove(id) {
        return await game.destroy({ where: { id: id } });
    };
    async getById(id) {
        return await game.find({ where: { id: id } });
    };
    async getAll() {
        return await game.find().then(u => {return u;});
    };
    async create(data) {
        return await game.create(data);
    };
    
}