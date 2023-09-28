var User = require('./user.router');
var express = require('express');
const router = express.Router();
module.exports = (app) => {
    app.use('/api/user', Bot);
}