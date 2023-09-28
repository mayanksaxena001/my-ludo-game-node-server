var UserRepository = require('../mysql/db/user.repository');
const repo = new UserRepository();
module.exports = class UserController {
    async getuserInfo(req) {
        try {
            return ({ name: 'X' });
        } catch (err) {
            console.log(err);
            return err;
        }
    }
    //TODO
    async saveUserInfo(req) {
        try {
            return json(req);
        } catch (err) {
            console.log(err);
            return err;
        }

    }
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
    }


    async updateUser(req, res) {
        try {
            var passwordIsValid = Util.verifyPassword(req.decoded.username, req.body.password);
            if (!passwordIsValid) throw new Error('Password do not match!');
            await repo.update(req.body, req.decoded.id);
            res.status(200).send({
                succes: true
            });
        } catch (err) {
            console.error(err);
            res.status(500).send(err.message);
        };
    }
}