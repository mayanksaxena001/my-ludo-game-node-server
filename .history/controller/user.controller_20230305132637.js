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
            return res.json(req);
        } catch (err) {
            console.log(err);
            return res.status(500).send(err);
        }
    }
}