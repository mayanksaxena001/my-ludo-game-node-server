 class UserController {
    async getuserInfo(req) {
        try {
            return res.json({ name: 'X' });
        } catch (err) {
            console.log(err);
            return res.status(500).send(err);
        }
    }
//TODO
    async saveUserInfo(req) {
        try {
            return res.json(req);
        } catch (err) {
            console.log(err);
            return res.status(500).send(err);
        }
    }
}

export default new UserController();