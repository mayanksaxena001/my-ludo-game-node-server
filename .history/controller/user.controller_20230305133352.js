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
}
