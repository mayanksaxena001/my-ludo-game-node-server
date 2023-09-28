var game = require('../controller/game.controller');
var express = require('express');
const router = express.Router();
router.use('/', auth.default_req);
router.param('username', auth.validation_req);

router.post('/signup', auth.register);
router.post('/login', auth.login);

module.exports = router;