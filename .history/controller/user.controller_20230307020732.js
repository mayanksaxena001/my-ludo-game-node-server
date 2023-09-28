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
            var user = {};
            user = await repo.getById(req.decoded.id);
            //TODO remove password from user object
            if (!user) return res.status(404).send("No user found.");
            user.password = '';
            // user.account = '';
            try {
                var _user = await _contract.getUserByAddress(user.account);
                user.balance = _user[2].toNumber(); //_balance
            } catch (err) {
                console.error(err);
                user.balance = 'NA';
            }
            res.status(200).send(user);
        } catch (err) {
            console.error(err);
            res.status(500).send(err.message);
        }
    }
}