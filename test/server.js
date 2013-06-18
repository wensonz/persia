var wormhole = require('wormhole'),
    condotti = require('condotti'),
    server = null,
    C = null,
    logger = null,
    topics = {};

C = condotti.Condotti();
logger = C.logging.getLogger(C.natives.path.basename(__filename));

server = C.natives.net.createServer(function (socket) {
    
    socket.on('end', function () {
        var topic = null;
        
        logger.debug('Peer (' + socket.remoteAddress + ':' + socket.remotePort +
                     ' => ' + socket.localAddress + ':' + socket.localPort +
                     ') closes the connection');
                     
        for (topic in socket.topics) {
            topics[topic].removeListener('message', socket.topics[topic]);
        }
    });
    
    socket.on('error', function (error) {
        var topic = null;
        
        logger.error('Connection from ' + socket.remoteAddress + ':' +
                     socket.remotePort + ' failed. Error: ' +
                     C.lang.reflect.inspect(error));
                     
        for (topic in socket.topics) {
            topics[topic].removeListener('data', socket.topics[topic]);
        }
        socket.destroy();
    });
    
    wormhole(socket, 'subscribe', function (message) {
        var topic = null,
            handler = null;
            
        topic = topics[message.topic];
        if (!topic) {
            topic = new C.events.EventEmitter();
            topics[message.topic] = topic;
        }
        
        socket.topics = socket.topics || {};
        
        handler = function (message) {
            this.write('data', message);
        };
        handler = handler.bind(socket);
        
        socket.topics[message.topic] = handler;
        topic.on('data', handler);
    });
    
    wormhole(socket, 'publish', function (message) {
        var topic = null;
        topic = topics[message.topic];
        if (!topic) {
            topic = new C.events.EventEmitter();
            topics[message.topic] = topic;
        }
        
        topic.emit('data', message);
    });
}).listen(8000);

logger.info('Server is running on 8000');