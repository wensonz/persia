var natives = require('natives'),
    condotti = require('condotti'),
    C = null,
    server = null,
    logger = null,
    router = null;


C = condotti.Condotti({
    loader: { paths: {
        persia: natives.path.resolve(__dirname, '../src')
    }},
    'condotti.server.logging': { 'log4js': { 
        'levels': {
            'FixedLengthFrameHandler': 'INFO',
            'TcpTransport': 'INFO',
            'PipelineChannel': 'INFO',
            'Condotti': 'INFO',
            'PipelineServerChannel': 'INFO',
            'TcpServerTransport': 'INFO'
        },
        'appenders': [
            {
                'type': 'console',
                'layout': { 'type': 'colored' }
            }
        ]
    }}
});

logger = C.logging.getStepLogger(C.logging.getLogger(natives.path.basename(__filename)));

C.async.waterfall([
    function (next) { // load tcp module
        logger.start('Loading necessary modules');
        C.use(
            'persia.transports.tcp', 
            'persia.channels.pipeline',
            'persia.pipeline.fixed-length-frame',
            'persia.pipeline.json-codec',
            'persia.routing.passive',
            next
        );
    },
    function (C, next) { // start server transport
        logger.done();
        
        logger.start('Starting the server channel on 8000');
        server = new C.persia.transports.tcp.TcpServerTransport(); // listen on 
                                                                   // 8000
        server = new C.persia.channels.PipelineServerChannel(
            server, 
            [
                new C.persia.pipeline.FixedLengthFrameHandler(),
                new C.persia.pipeline.JsonCodecHandler()
            ]
        );
        
        router = new C.persia.routing.PassiveRouter('127.0.0.1:8000', server);
        
        router.on('message', function (message) {
            router.route(message);
        });
        server.listen(next);
    },
    function (next) { // start the client transport
        logger.done();
        
        logger.start('Starting the client channels on ' +
                     '{ "host": "127.0.0.1", "port": 8000 } with id: A and B');
        C.async.forEachSeries(['A', 'B'], function (id, next) {
            var client = null;
            
            client = new C.persia.transports.tcp.TcpTransport({ 
                host: '127.0.0.1', port: 8000
            });
        
            client = new C.persia.channels.PipelineChannel(
                client, 
                [
                    new C.persia.pipeline.FixedLengthFrameHandler(),
                    new C.persia.pipeline.JsonCodecHandler()
                ]
            );
            
            client.once('message', function (message) {
                console.log('Client ' + id + ' is authenticated. ');
                client.on('message', function (message) {
                    console.log('client ' + id + ' receive a message');
                    setTimeout(function () {
                        client.write({ 
                            targets: [message.path[0]],
                            path: [id],
                            type: 'message',
                            content: 'Hello from ' + id 
                        });
                    }, 1000);
                });
                
                if (id === 'B') {
                    setTimeout(function () {
                        client.write({ 
                            targets: ['A'],
                            path: ['B'],
                            type: 'message',
                            content: 'Hello from ' + id 
                        });
                    }, 1000);
                }
            });
            
            client.connect(function () {
                console.log('Client ' + id + ' connected.');
                client.write({
                    type: 'registration',
                    content: { id: id }
                }, next);
            });
        }, function (error) {
            next();
        });
    }
], function (error) {
    if (error) {
        logger.error(error);
        process.exit(1);
        return;
    }
    
    logger.done();
});