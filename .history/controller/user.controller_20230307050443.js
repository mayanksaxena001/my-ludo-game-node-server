var Util = require('./Util');
var UserRepository = require('../mysql/db/user.repository');
const repo = new UserRepository();
module.exports = {
    async getUser(req, res) {
        try {
            var user = await repo.getById(req.decoded.id);
            if (!user) return res.status(404).send("No user found.");
            //TODO remove password from user object
            user.password = '';
            // user.account = '';
            res.status(200).send({ user });
        } catch (err) {
            console.error(err);
            res.status(500).send(err.message);
        }
    },


    async updateUser(req, res) {
        try {
            if (!req.body || !req.body.id  ) throw new Error('Insufficient Info')
            let user = await repo.getById(req.decoded.id)
            // var passwordIsValid = Util.verifyPassword(user.username, req.body.password);
            // if (!passwordIsValid) throw new Error('Password do not match!');
            await repo.update(req.body, req.body.id);
            res.status(200).send({
                succes: true
            });
        } catch (err) {
            console.error(err);
            res.status(500).send(err.message);
        };
    }
}