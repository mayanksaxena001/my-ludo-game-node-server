 class UserController {
    async getuserInfo(req) {
        try {
            return res.json({ name: 'X' });
        } catch (err) {
            console.log(err);
            return err;
        }
    }
//TODO
    async saveUserInfo(req) {
        try {
            return res.json(req);
        } catch (err) {
            console.log(err);
            return err;
        }
    }
}

export default new UserController();