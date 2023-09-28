var Bot = require('./bot.router');
var express = require('express');
const router = express.Router();
module.exports = (app) => {
    app.use('/api/bot', Bot);
}