var game = require('../controller/game.controller');
var auth = require('../controller/auth.controller');
var express = require('express');
const router = express.Router();
router.use('/', game.default_req);
router.param('id', game.validation_req);

router.get('/:id', game.getGame);
router.post('/', game.createNewGame);
router.put('/', game.updateGame);

module.exports = router;