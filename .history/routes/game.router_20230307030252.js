var game = require('../controller/game.controller');
var express = require('express');
const router = express.Router();
router.use('/', game.default_req);
router.param('username', auth.validation_req);

router.post('/signup', auth.register);
router.post('/login', auth.login);

module.exports = router;