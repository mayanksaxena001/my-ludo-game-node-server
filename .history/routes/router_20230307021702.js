var UserApi = require('./user.router');
var AuthApi = require('./auth.router');
var express = require('express');
const router = express.Router();
module.exports = (app) => {
    app.use('/api/auth', AuthApi);
    app.use('/api/user', UserApi);
}