var game = require('../controller/game.controller');
var express = require('express');
const router = express.Router();
router.use('/', game.default_req);
router.param('id', game.validation_req);

router.get('/:id', game.getGame);
router.post('/login', auth.login);

module.exports = router;