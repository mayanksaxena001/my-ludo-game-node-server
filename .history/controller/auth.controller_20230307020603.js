'use strict';
var bcrypt = require('bcryptjs');
var UserRepository = require('../mysql/db/user.repository');
const repo = new UserRepository();
var Promise = require('bluebird');

module.exports = {

  default_req(req, res, callback) {
    console.log('default gateway | Auth : ', req.method, req.url);
    callback();
  },

  validation_req(req, res, callback, username) {
    console.log('Doing username validations on ' + username);
    res.username = username;
    callback();
  },

  get_req(req, res) {
    res.render('index');
  },

  async register(req, res) {
    try {
      if (!req.body || !req.body.name || !req.body.password || !req.body.username || !req.body.email) throw new Error('Insufficient Info')
      var hashedPassword = bcrypt.hashSync(req.body.password, 8);
      let _user = await repo.create({
        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
        account: _account,
        type: req.body.type,
        active: true,
        balance: _balance,
        mnemonic: _mnemonic
      });
      res.status(200).send({_user});
      // console.log(res);

    } catch (err) {
      console.error(err);
      res.status(500).send(err.message);
    };

  },

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
  },

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
  },

  async login(req, res) {
    try {
      var user = await repo.findByUserName(req.body.username);
      if (!user) return res.status(404).send('User Not Found');;
      var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
      if (!passwordIsValid) return res.status(401).send({
        'auth': false,
        'x-access-token': null
      });
      try {
        if (contractConfig.isWeb3Connected()) {
          var _balance = await _contract.balanceOf(user.account);
          //TODO : do not update balance while login
          await repo.update({
            active: true,
            balance: _balance.toNumber()
          }, user.id);
        }
      } catch (err) {
        console.error(err)
      }
      let token = await module.exports.generateToken(user.id, user.account, user.type, user.username);
      await module.exports.saveApiToken(
        'TOKEN_GENERATED',
        user.id,
        true,
        token,
        req.originalUrl,
        req.method
      );

      res.status(200).send({
        'auth': true,
        'x-access-token': token,
        'token': token
      });
    } catch (err) {
      console.error(err);
      res.status(500).send(err.message);
    }
  },

  //TODO
  // async logout(req, res) {
  //   try {
  //     // TODO
  //     // var id = req.decoded.id;
  //     // await repo.update({
  //     //   active: false
  //     // }, id);
  //     // await apiTokenRepo.update();
  //     res.status(200).send({
  //       'auth': false,
  //       'x-access-token': null
  //     });
  //   } catch (err) {
  //     console.error(err);
  //     return res.status(500).send(err.message);
  //   }
  // },
}