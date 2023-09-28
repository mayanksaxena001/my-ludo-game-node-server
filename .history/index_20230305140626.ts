import express from 'express';
var bodyParser = require('body-parser');
var dotenv = require('dotenv');
var morgan = require('morgan');
dotenv.config();
var expressConfig = require('./config/express');
var router = require('./routes/router');
const { Server } = require("socket.io");

class LudoServer {
    app: any;
    env: NodeJS.ProcessEnv;
    constructor() {
        this.app = express();
        this.env = process.env;
        this.init();
    }

    init() {
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(bodyParser.json({ strict: false }));
        this.app.use(morgan('dev'));
        // express settings
        //for now views are integrated in express only
        expressConfig(this.app);
        //router settings
        router(this.app);
        // start server
        this.app.listen(this.env.SERVER_PORT, this.env.SERVER_HOST, () => {
            // connect to database
            console.log(`[Server] listening on  ${this.env.SERVER_HOST} : ${this.env.SERVER_PORT}`);
        });
    }
}
module.exports = new LudoServer().app;
