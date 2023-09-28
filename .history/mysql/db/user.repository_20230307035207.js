var {user} = require( '../models/models');
module.exports = class UserRepository {
    constructor() { }

    update(data, id) {
        data.updatedAt = new Date();
        return user.findOne({ where: { id: id } }).then(u => u.update(data));
    };
    remove(id) {
        return user.destroy({ where: { id: id } });
    };
    async getById(id) {
        return await user.findOne({ where: { id: id } });
    };
    getAll() {
        return user.find().then(u => {return u;});
    };
     create(data) {
        return user.create(data);
    };
    findByUserName(username) {
        return user.findOne({
            where: {
                username: username
            }
        })
    }
    
}