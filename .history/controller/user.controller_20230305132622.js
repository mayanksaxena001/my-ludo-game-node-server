export default class UserController {
    async getuserInfo(req) {
        try {
            return res.json({ name: 'X' });
        } catch (err) {
            console.log(err);
            return res.status(500).send(err);
        }
    }

    async saveUserInfo(req) {
        try {
            var orders = await _Bot.getAllOrders(req.params.pair);
            return res.json(orders);
        } catch (err) {
            console.log(err);
            return res.status(500).send(err);
        }
    }
}