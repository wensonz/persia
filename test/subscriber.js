var wormhole = require('wormhole'),
    condotti = require('condotti'),
    client = null,
    C = null,
    logger = null;

C = condotti.Condotti();
logger = C.logging.getLogger(C.natives.path.basename(__filename));

client = C.natives.net.createConnection(8000, function () {
    
    client.on('end', function () {
        
        logger.debug('Peer (' + client.remoteAddress + ':' + client.remotePort +
                     ') closes the connection');
        process.exit(1);
    });
    
    client.on('error', function (error) {
        
        logger.error('Connection from ' + client.remoteAddress + ':' +
                     client.remotePort + ' failed. Error: ' +
                     C.lang.reflect.inspect(error));
                     
        client.destroy();
        process.exit(1);
    });
    
    wormhole(client, 'data', function (message) {
        logger.info('Message received: ' + C.lang.reflect.inspect(message));
    });
    
    client.write('subscribe', { topic: process.argv[2] });
    logger.info('Subscriber is running ...');
});