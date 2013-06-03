var condotti = require('condotti');


new condotti.Condotti({
    loader: {
        paths: [__dirname + '/../../src', __dirname + '/../../src/tcp']
    },
    requires: [
        'condotti-events-nodejs',
        'persia-tcp-transport-factory-nodejs', 
        'persia-tcp-transport-nodejs', 
        'persia-tcp-transport-server-nodejs'
    ]
}, function (error, C) {
    C.info('Modules are attached successfully.');
    C.info('Creating TCP transport server ...');
    var factory = new C.persia.transports.tcp.TcpTransportFactory({
        allowHalfOpen: false,
        port: 8080
    });
    factory.createTransportServer(function (error, server) {
        C.info('Starting TCP transport server ...');
        server.on('transport', function (transport) {
            transport.close();
            C.info('Stopping TCP transport server ...');
            server.stop(function (error) {
                if (error) {
                    C.error('TCP transport server fails to stop. Error: ' + C.lang.inspect(error));
                } else {
                    C.info('TCP server is stopped successfully');
                }
                C.process.exit(0);
            });
        });
        server.start(function (error) {
            if (error) {
                C.error('TCP transport server fails to start. Error: ' + C.lang.inspect(error));
                return;
            }
            C.info('TCP transport server is running at 8080');
        });
    });
});