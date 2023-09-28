var UserController = require('../controller/user.controller');
const instance = new UserController();
module.exports = {

    async getuserInfo(req, res) {
        try {
            console.log("fetching user info ...");
            return instance.getuserInfo(req);
        } catch (err) {
            console.log(err);
            return res.status(500).send(err);
        }
    },

    async saveUserInfo(req, res) {
        try {
            return instance.saveUserInfo(req);
        } catch (err) {
            console.log(err);
            return res.status(500).send(err);
        }
    }
};