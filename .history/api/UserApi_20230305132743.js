var { UserController } = require('../controller/user.controller');
const instance = new UserController();
module.exports = {

    async getuserInfo(req, res) {
        try {
            return UserController.getuserInfo(req);
        } catch (err) {
            console.log(err);
            return res.status(500).send(err);
        }
    },

    async saveUserInfo(req, res) {
        try {
            var orders = await _Bot.getAllOrders(req.params.pair);
            return res.json(orders);
        } catch (err) {
            console.log(err);
            return res.status(500).send(err);
        }
    }
};