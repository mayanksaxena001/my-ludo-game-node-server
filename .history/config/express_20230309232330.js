var cors = require('cors');
var sequelize = require('./database.seq.config');
module.exports = (app) => {
    console.log('Setting cors options in server');
    const whitelist = ['http://localhost:3000','http://129.168.0.105:3000'];
    const allowedheaders = ["Origin, X-Requested-With", "Content-Type", "Accept", "x-access-token"];
    const exposedheaders = ["x-access-token"];
    const methods = ['POST', 'GET', 'PUT', 'DELETE', 'OPTIONS'];
    var corsOptions = {
        origin: whitelist,
        methods: methods,
        allowedHeaders: allowedheaders,
        exposedHeaders: exposedheaders,
        credentials: false,
        redirect: false,
        maxAge: 84000,
        // preflightContinue: true,
        optionsSuccessStatus: 200
    }
    app.use('*', cors(corsOptions)); // preflight OPTIONS; put before other routes
    app.use((req, res, next) => {
        /Reason: Multiple CORS header 'Access-Control-Allow-Origin' not allowed
        if (whitelist.indexOf(req.headers.origin) !== -1) {
            res.header('Access-Control-Allow-Origin', req.headers.origin);
        }
        // res.header("Access-Control-Allow-Origin", whitelist);
        res.header("Access-Control-Allow-Headers", allowedheaders);
        res.header("Access-Control-Expose-Headers", exposedheaders);
        res.header('Access-Control-Allow-Methods', methods);
        res.header('Content-Type', 'application/json');
        res.header('x-timestamp', Date.now())
        next();
    });
    // app.get('/', function (req, res) {
    //     res.render('main');
    // });
    // Handlebars.registerHelper('json', function (context) {
    //     return JSON.stringify(context);
    // });
    // app.set('views', __dirname + '/../views')
    // app.engine('html', exphbs);
    // app.set('view engine', '.html');
};