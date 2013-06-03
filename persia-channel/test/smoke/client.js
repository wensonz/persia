var net = require('net');

var socket = net.createConnection(8080, function () {
    socket.on('data', function (data) {
        var length = data.readUInt32LE(0);
        var body = data.slice(4).toString('utf-8');
        var message = JSON.parse(body);
        console.log(message);
        process.exit(0);
    });
});