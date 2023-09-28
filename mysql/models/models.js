var User = require('./user.model');
var Game = require('./game.model');
var GameInfo = require('./game_info.model');
var ApiToken = require('./apitoken.model');
var LudoToken = require('./ludo_token.model');
var Socket = require('./socket.model');
// var Transaction  = require( './transaction.model');
var sequelize = require('../../config/database.seq.config');

const user = new User(sequelize).user;
const apiToken = new ApiToken(sequelize).apitoken;
const game = new Game(sequelize).game;
const gameInfo = new GameInfo(sequelize).gameinfo;
const ludotoken = new LudoToken(sequelize).ludo_token;
const socket = new Socket(sequelize).socket;
// const transaction = new Transaction(sequelize).transaction;
sequelize.sync({ force: false });
apiToken.belongsTo(user, { foreignKey: 'user_id', targetKey: 'id', onDelete: 'CASCADE' });
gameInfo.belongsTo(user, { foreignKey: 'user_id', targetKey: 'id', onDelete: 'CASCADE' });
gameInfo.belongsTo(game, { foreignKey: 'game_id', targetKey: 'id', onDelete: 'CASCADE' });
ludotoken.belongsTo(gameInfo, { foreignKey: 'house_id', targetKey: 'id', onDelete: 'CASCADE' });
// user.hasMany(todo,{foreignKey: 'user_id',sourceKey: 'id',onDelete:'CASCADE'});
module.exports = { user, game, apiToken, gameInfo,socket,ludotoken };