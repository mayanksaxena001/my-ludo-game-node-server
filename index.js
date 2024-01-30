var express = require('express');
var bodyParser = require('body-parser');
var dotenv = require('dotenv');
var morgan = require('morgan');
dotenv.config();
var expressConfig = require('./config/express');
var router = require('./routes/router');
const http = require('http');
var SocketServerOrchestrator = require('./socket/socket');

class LudoServer {
    constructor() {
        this.app = express();
        this.env = process.env;
        this.server = http.createServer(this.app);
        this.init();
    }

    init() {
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(bodyParser.json({ strict: false }));
        this.app.use(morgan('dev'));

        this.server.on('error', (err) => { console.error(err) });
        this.server.on('listening', () => {
            var addr = this.server.address();
            var bind = typeof addr === 'string'
                ? 'pipe ' + addr
                : 'port ' + addr.port;
            console.log('Listening on ' + bind);
        });
        //start http server
        this.server.listen(this.env.SERVER_PORT, this.env.SERVER_HOST);
        // express settings
        //for now views are integrated in express only
        expressConfig(this.app);
        //router settings
        router(this.app);
        // start server
        SocketServerOrchestrator(this.server);
        // this.app.listen(this.env.SERVER_PORT, this.env.SERVER_HOST, () => {
        //     console.log(`[Server] listening on  ${this.env.SERVER_HOST} : ${this.env.SERVER_PORT}`);
        // });
    }
}
module.exports = new LudoServer().app;
