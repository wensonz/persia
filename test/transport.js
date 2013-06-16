var condotti = require('condotti'),
    natives = require('natives'),
    C = null,
    logger = null,
    server = null,
    client = null;

C = condotti.Condotti({
    loader: { paths: {
        persia: natives.path.resolve(__dirname, '../src')
    }}
});

logger = C.logging.getStepLogger(C.logging.getLogger(__filename));

C.async.waterfall([
    function (next) { // load tcp module
        logger.start('Loading persia.transports.tcp');
        C.use('persia.transports.tcp', next);
    },
    function (C, next) { // start server transport
        logger.done();
        
        logger.start('Starting the server transport on 8000');
        server = new C.persia.transports.tcp.TcpServerTransport(); // listen on 
                                                                   // 8000
        server.on('transport', function (transport) {
            transport.on('data', function (data) {
                console.log('>>> Message from client: ');
                console.log('  * ' + data.toString());
                transport.write(data, function () {});
            });
            transport.on('end', function () {
                transport.close(function (error) {
                    process.exit(error ? 1 : 0);
                });
            })
        });
        server.listen(next);
    },
    function (next) { // start the client transport
        logger.done();
        
        logger.start('Starting the client transport on ' +
                     '{ "host": "127.0.0.1", "port": 8000}');
        client = new C.persia.transports.tcp.TcpTransport({ 
            host: '127.0.0.1', port: 8000
        });
        
        client.on('data', function (data) {
            console.log('>>> Message from server: ');
            console.log('  * ' + data.toString());
            client.close();
        });
        client.connect(next);
    },
    function (next) {
        logger.done();
        logger.start('Sending "Hello world!" to the server transport');
        client.write('Hello world!', next);
    }
], function (error) {
    if (error) {
        logger.error(error);
        process.exit(1);
        return;
    }
    
    logger.done();
});