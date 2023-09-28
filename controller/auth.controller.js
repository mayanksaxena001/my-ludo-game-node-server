'use strict';
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var UserRepository = require('../mysql/db/user.repository');
const userRepository = new UserRepository();
var ApiTokenRepository = require('../mysql/db/apitoken.repository');
const apiTokenRepo = new ApiTokenRepository();
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


  async register(req, res) {
    try {
      if (!req.body || !req.body.name || !req.body.username || !req.body.password) throw new Error('Insufficient Info')
      // const username = req.body.name + '-' + Math.floor(Math.random() * 11);;
      const username = req.body.username;
      var hashedPassword = bcrypt.hashSync(req.body.password, 8);
      let _user = await userRepository.create({
        name: req.body.name,
        username: username,
        password: hashedPassword,
        active: true,
      });
      // create a token
      let token = await module.exports.generateToken(_user.id, _user.username);
      await module.exports.saveApiToken(
        'TOKEN_GENERATED',
        _user.id,
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

      // _user.password = '';
      // res.status(200).send({ _user });
      // console.log(res);

    } catch (err) {
      console.error(err);
      res.status(500).send(err.message);
    };

  },

  async login(req, res) {
    try {
      if (!req.body || !req.body.username || !req.body.password) throw new Error('Insufficient Info')
      var user = await userRepository.findByUserName(req.body.username);
      if (!user) return res.status(404).send('User Not Found');;
      var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
      if (!passwordIsValid) return res.status(401).send("Failed Login attempt");

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
  async logout(req, res) {
    try {
      // TODO
      // var id = req.decoded.id;
      // await repo.update({
      //   active: false
      // }, id);
      // await apiTokenRepo.update();
      res.status(200).send({
        'auth': false,
        'x-access-token': null
      });
    } catch (err) {
      console.error(err);
      return res.status(500).send(err.message);
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
      });
      var decoded = null;
      try {
        decoded = await jwtVerifyAsync(token, process.env.SECRET);
      } catch (error) {
        return res.status(401).send(error.message);
      }
      if (decoded) {
        var user = await userRepository.getById(decoded.id);
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
      return res.status(500).send(err.message);

    }
  },

  async saveApiToken(_type, _id, _status, _token, _url, _method) {
    try {
      await apiTokenRepo.create({
        type: _type,
        user_id: _id,
        status: _status,
        token: _token,
        url: _url,
        method: _method
      });
    } catch (err) {
      console.error(err)
    }
  },

  async generateToken(_id, _username) {
    // create a token
    return jwt.sign({
      //payload
      id: _id,
      username: _username
    }, process.env.SECRET, {
      // algorithm: "ES256",TODO : use some algo with jwt
      expiresIn: process.env.TOKEN_EXPIRE_TIME // just playing with it ,expires in 24h
    });
  }

}