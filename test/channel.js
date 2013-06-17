var natives = require('natives'),
    condotti = require('condotti'),
    C = null,
    server = null,
    client = null,
    logger = null;


C = condotti.Condotti({
    loader: { paths: {
        persia: natives.path.resolve(__dirname, '../src')
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
        
        server.on('channel', function (channel) {
            channel.on('message', function (message) {
                console.log('>>> Message from client: ');
                console.log('  * greeting = ' + message.greeting);
                channel.write({'result': 0}, function () {});
            });
            channel.on('end', function () {
                channel.close(function (error) {
                    process.exit(error ? 1 : 0);
                });
            });
        });
        server.listen(next);
    },
    function (next) { // start the client transport
        logger.done();
        
        logger.start('Starting the client channel on ' +
                     '{ "host": "127.0.0.1", "port": 8000}');
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
        
        client.on('message', function (message) {
            console.log('>>> Message from server: ');
            console.log('  * result = ' + message.result);
            client.close();
        });
        client.connect(next);
    },
    function (next) {
        logger.done();
        logger.start('Sending greeting message to the server channel');
        client.write({greeting: 'hello'}, next);
    }
], function (error) {
    if (error) {
        logger.error(error);
        process.exit(1);
        return;
    }
    
    logger.done();
});