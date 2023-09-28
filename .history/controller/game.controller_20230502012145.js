'use strict';
var GameRepository = require('../mysql/db/game.repository');
var GameInfoRepository = require('../mysql/db/gameinfo.repository');
var LudoTokenRepository = require('../mysql/db/ludotoken.repository');
const gameRepository = new GameRepository();
const gameInfoRepository = new GameInfoRepository();
const ludoTokenRepository = new LudoTokenRepository();
module.exports = {

  default_req(req, res, callback) {
    console.log('default gateway | Game : ', req.method, req.url);
    callback();
  },

  validation_req(req, res, callback, id) {
    console.log('Doing id validations on ' + id);
    res.id = id;
    callback();
  },

  async getGame(req, res) {
    try {
      var game = await gameRepository.getById(req.body.id);
      if (!game) return res.status(404).send("No game found with given id.");
      res.status(200).send({ game });
    } catch (err) {
      console.error(err);
      res.status(500).send(err.message);
    }
  },

  async getGameInfo(req, res) {
    try {
      const id = req.body.game_id;
      var gameInfo = await gameInfoRepository.findByGameId(id, req.decoded.id);
      if (!gameInfo) return res.status(404).send("No game info found with given id.");
      res.status(200).send({ gameInfo });
    } catch (err) {
      console.error(err);
      res.status(500).send(err.message);
    }
  },

  async joinGame(req, res) {
    try {
      const id = req.body.game_id;
      var game = await gameRepository.getById(id);
      if (!game) return res.status(404).send("No game found with given id.");
      let gameInfo = await gameInfoRepository.findByGameAndUserId(id, req.decoded.id);
      if (!gameInfo) {
        gameInfo = await gameInfoRepository.create({ game_id: id, user_id: req.decoded.id });
      }
      //TODO update game_info 
      return res.status(200).send({ gameInfo });
    } catch (err) {
      console.error(err);
      res.status(500).send(err.message);
    }
  },

  async createNewGame(req, res) {
    try {
      const id = req.decoded.id;
      const room = Math.random().toString().slice(2, 11);
      let game = await gameRepository.create({
        created_by: id,
        room: room
      });
      let gameInfo = await gameInfoRepository.create({ game_id: game.id, user_id: id });
      //TODO update game_info 
      return res.status(200).send({ game });
    } catch (err) {
      console.error(err);
      res.status(500).send(err.message);
    }
  },

  async updateGame(req, res) {
    try {
      //TODo update game info table
      var game = await gameRepository.getById(req.body.id);
      if (!game) return res.status(404).send("No game found with given id.");
      let updatedGame = await gameRepository.update(req.body, req.body.id);
      return res.status(200).send({ updatedGame });
    } catch (err) {
      console.error(err);
      res.status(500).send(err.message);
    }
  },
  async getAllActiveGames(req, res) {
    try {
      var games = await gameRepository.getAll();
      if (!games) return res.status(404).send("No active games found.");
      res.status(200).send({ games });
    } catch (err) {
      console.error(err);
      res.status(500).send(err.message);
    }
  }
}