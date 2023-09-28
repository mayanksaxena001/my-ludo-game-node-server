'use strict';
var bcrypt = require('bcryptjs');
var UserRepository = require('../mysql/db/user.repository');
const userRepository = new UserRepository();
var ApiTokenRepository = require('../mysql/db/apitoken.repository');
const apiTokenRepo = new ApiTokenRepository();
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


  async register(req, res) {
    try {
      if (!req.body || !req.body.name || !req.body.password) throw new Error('Insufficient Info')
      const username = req.body.name + '-' + Math.floor(Math.random() * 11);;
      var hashedPassword = bcrypt.hashSync(req.body.password, 8);
      let _user = await userRepository.create({
        name: req.body.name,
        username: username,
        password: hashedPassword,
        active: true,
      });
      _user.password = '';
      res.status(200).send({ _user });
      // console.log(res);

    } catch (err) {
      console.error(err);
      res.status(500).send(err.message);
    };

  },

  async login(req, res) {
    try {
      var user = await userRepository.findByUserName(req.body.username);
      if (!user) return res.status(404).send('User Not Found');;
      var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
      if (!passwordIsValid) return res.status(401).send("Failed Login attempt");

      res.status(200).send({
        'auth': true
      });
    } catch (err) {
      console.error(err);
      res.status(500).send(err.message);
    }
  },
  async checkToken(req, res, callback) {
    try {
      var token = req.headers['x-access-token'];
      if (!token) {
        console.log('No token present...')
        return res.status(401).send({
          auth: false,
          message: 'No token provided.'
        });
      }
      var jwtVerifyAsync = Promise.promisify(jwt.verify, {
        context: jwt
      })
      var decoded = await jwtVerifyAsync(token, process.env.SECRET);
      if (decoded) {
        var user = await repo.getById(decoded.id);
        if (!user) throw new Error("User is not registered or might not be active");

        await module.exports.saveApiToken(
          'CHECK_TOKEN',
          user.id,
          true,
          token,
          req.originalUrl,
          req.method
        );

        if (!user.active) return res.status(500).send("Invalid token , User is inactive");
        req.decoded = decoded;
        callback();
      } else {
        throw new Error('Invalid session');
      }
    } catch (err) {
      console.error(err);
      return res.status(500).send(err.message);

    }
  },

}