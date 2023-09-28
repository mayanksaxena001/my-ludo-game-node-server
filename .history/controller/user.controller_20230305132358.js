export default class UserController {
    async getuserInfo(req, res) {
        try {
            let balance = await _Bot.getBalances();
            return res.json(balance);
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
 }