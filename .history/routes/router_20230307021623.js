var User = require('./user.router');
var AuthApi = require('./auth.router');
var express = require('express');
const router = express.Router();
module.exports = (app) => {
    app.use('/api/user', User);
}