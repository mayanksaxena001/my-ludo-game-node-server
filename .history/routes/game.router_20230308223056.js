var game = require('../controller/game.controller');
var auth = require('../controller/auth.controller');
var express = require('express');
const router = express.Router();
router.use('/', auth.checkToken, game.default_req);
router.param('id', game.validation_req);

router.get('/', game.getGame);
router.post('/', game.createNewGame);
router.put('/', game.updateGame);
router.post('/join', game.joinGame);

module.exports = router;