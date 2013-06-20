var natives = require('natives'),
    condotti = require('condotti'),
    config = null,
    C = null,
    logger = null,
    name = null,
    step = null,
    client = null,
    pipeline = null;

//============  PROGRAM START HERE  ===============
config = {
    "condotti": {
        "loader": {
            "paths": {
                "persia": "../src"
            }
        },
        "condotti.server.logging": { "log4js": {
            "levels": {
                "Condotti": "INFO",
                "FixedLengthFrameHandler": "INFO"
            },
            "appenders": [
                { "type": "console" }
            ],
            "replaceConsole": false
        }}
    },
    "modules": [
        "persia.transports.tcp",
        "persia.handlers.fixed-length-frame",
        "persia.handlers.json-codec",
        "persia.handlers.transport",
        "persia.pipeline"
    ]
};

C = condotti.Condotti(config.condotti);

name = natives.path.basename(__filename, '.js');
name = name.charAt(0).toUpperCase() + name.substring(1);

logger = C.logging.getLogger(name);
logger.info('[ BOOT ] Program ' + name + ' is being bootstrapped ...');

step = C.logging.getStepLogger(logger);

C.async.waterfall([
    function (next) { // loading modules
        step.start('Loading necessary modules ' + config.modules.toString());
        C.use(config.modules, next);
    }, 
    function (unused, next) { // initializing compoennts
        var factory = null,
            handlers = [];
        
        step.done();
        step.start('Initializing program components');
        factory = new C.persia.transports.tcp.TcpTransportFactory({
            host: '127.0.0.1', port: 8000
        });
        
        client = factory.createTransport();
        handlers.push(new C.persia.handlers.FixedLengthFrameHandler());
        handlers.push(new C.persia.handlers.JsonCodecHandler());
        
        //============  DATA HANDLER  ===========
        function DataHandler() {
            this.super();
        }

        C.lang.inherit(DataHandler, C.persia.handlers.Handler);

        DataHandler.prototype.handleInbound = function (context, data) {
            console.log('New message received: ' + C.lang.reflect.inspect(data));
        };
        //============ END OF DATA HANDLER ==========
        
        handlers.push(new DataHandler());
        
        pipeline = new C.persia.Pipeline({
            transport: client, 
            handlers: handlers
        });
        step.done();
        
        step.start('Connecting to the server on 0.0.0.0:8000');
        client.once('connect', next);
        client.connect();
    },
    function (next) {
        step.done();
        step.start('Sending the initial data');
        pipeline.write({
            type: 'SUBSCRIPTION',
            topic: process.argv[2]
        });
        
        pipeline.write({
            type: 'PUBLISHING', 
            topic: process.argv[3],
            data: JSON.parse(process.argv[4])
        });
        step.done();
    }
], function (error) {
    if (error) {
        step.error(error);
        logger.error('[ TERM ] Program ' + name + ' terminates abnormally.');
        process.exit(1);
        return;
    }
    
    step.done();
    logger.info('[ EXIT ] Program ' + name + ' exits normally.');
    process.exit(0);
});