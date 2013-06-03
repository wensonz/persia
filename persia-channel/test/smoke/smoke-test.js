var condotti = require('condotti');

new condotti.Condotti({
    loader: {
        paths: [
            __dirname + '/../../../persia-transport/src', 
            __dirname + '/../../../persia-transport/src/tcp', 
            __dirname + '/../../src', 
            __dirname + '/../../src/json'
        ]
    },
    requires: [
        'condotti-events-nodejs',
        'persia-tcp-transport-factory-nodejs',
        'persia-json-channel-factory-nodejs'
    ]
}, function (error, C) {
    if (error) {
        C.error('Initializing Condotti instance failed. Error: ' +
                C.lang.inspect(error));
        C.info('Condotti instance:');
        C.debug(C.lang.inspect(C.persia));
        C.process.exit(1);
        return;
    }
    
    C.info('Condotti instance initialized successfully.');
    var transportFactory = null,
        channelFactory = null,
        closeServer = null;
        
    transportFactory = new C.persia.transports.tcp.TcpTransportFactory({
        allowHalfOpen: false,
        port: 8080
    });
    
    channelFactory = new C.persia.channels.json.JsonChannelFactory(transportFactory);
    
    channelFactory.createChannelServer(function (error, server) {
        if (error) {
            C.error('Creating channel server failed. Error: ' + C.lang.inspect(error));
            C.process.exit(1);
            return;
        }
        
        server.on('channel', function (channel) {
            C.info('New client channel ' + channel.toString() + ' is accepted.');
            closeServer = function () {
                C.async.parallel([
                    function (next) {
                        channel.close(next);
                    },
                    function (next) {
                        server.stop(next);
                    }
                ], function (error, results) {
                    if (error) {
                        C.error('Cleaning up channels and server failed. Error:' +
                                C.lang.inspect(error));
                    }
                    C.process.exit(error? 1: 0);
                });
            };
            
            channel.write({'greeting': 'hello'}, function (error) {
                if (error) {
                    C.error('Sending message to client failed. Error: ' +
                            C.lang.inspect(error));
                }
            });
        });
        server.start(function (error) {
            if (error) {
                C.error('Starting server failed. Error: ' + C.lang.inspect(error));
                C.process.exit(1);
                return;
            }
            
            C.info('Channel server is running now ...');
            C.info('Creating client channel ...');
            channelFactory.createChannel(function (error, channel) {
                if (error) {
                    C.error('Creating client channel failed. Error: ' + 
                            C.lang.inspect(error));
                    closeServer();
                    return;
                }
                
                channel.on('message', function (message) {
                    C.info('Receiving message: ' + C.lang.inspect(message));
                    closeServer();
                });
            });
        });
    });
});