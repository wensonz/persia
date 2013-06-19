/**
 * This module contains the implementation of the TCP transport client, server
 * and factory classes.
 * 
 * @module persia.transports.tcp
 */
Condotti.add('persia.transports.tcp', function (C) {

    /**
     * The TcpTransport class is the TCP implementation of the abstract
     * base Transport based on the node.js socket.
     *
     * @class TcpTransport
     * @constructor
     * @param {Object} config the config for this transport
     */
    function TcpTransport(config) {
        
        /* inheritance */
        this.super();
        
        /**
         * The host name or ip address this transport connects to. If this
         * transport is spawn from a server transport when a client transport
         * connects, this property indicates the client side address. Actually,
         * it's the socket.remoteAddress
         * 
         * @property host_
         * @type String
         */
        this.host_ = config.host;
        
        /**
         * The port number this tcp transport connects to. Like the host_
         * property, it's the socket.remotePort
         * 
         * @property port_
         * @type Number
         */
        this.port_ = config.port;
        
        /**
         * The internal TCP socket
         *
         * @property socket_
         * @type Socket
         * @default socket
         */
        this.socket_ = null;
    }
    
    C.lang.inherit(TcpTransport, C.persia.transports.Transport);
    
    /**
     * Create a new tcp transport from an established socket, which normally 
     * accepted by a socket server.
     *
     * @method createFromSocket
     * @param {Socket} socket the accepted socket
     * @return {Transport} the new created wrapper transport
     */
    TcpTransport.createFromSocket = function (socket) {
        var transport = null,
            config = {};
        
        config.host = socket.remoteAddress;
        config.port = socket.remotePort;
        
        transport = new TcpTransport(config);
        transport.socket_ = socket;
        transport.writable = true;
        transport.bindSocketEvents_();
        
        return transport;
    };
    
    /**
     * Return the id of the transport
     * 
     * @method getId_
     * @return {String} the identifier of this transport
     */
    TcpTransport.prototype.getId_ = function () {
        return 'tcp@' + this.host_ + ':' + this.port_;
    };
    
    /**
     * Bind the event handlers for the underlying socket
     * 
     * @method bindSocketEvents_
     */
    TcpTransport.prototype.bindSocketEvents_ = function (socket) {
        socket.on('data', this.onSocketData_.bind(this));
        socket.on('drain', this.onSocketDrain_.bind(this));
        socket.on('end', this.onSocketEnd_.bind(this));
        socket.on('error', this.onSocketError_.bind(this));
    };
    
    // TODO: unbind events
    
    /**
     * Connect this transport to the specified server
     * 
     * @method connect
     * @param {Function} callback the callback function to be invoked after the
     *                            transport has successfully connected to the
     *                            desired server, or some error occurs. The
     *                            signature of the callback is 
     *                            'function (error) {}'
     */
    TcpTransport.prototype.connect = function (callback) {
        var self = this,
            logger = C.logging.getStepLogger(this.logger_),
            socket = null;
        
        socket = new C.natives.net.Socket();
        this.bindSocketEvents_(socket);
        
        logger.start('Connecting to ' + this.host_ + ':' + this.port_);
        socket.connect({
            host: this.host_, port: this.port_ 
        }, function (error) {
            if (error) {
                logger.error(error);
                callback(error);
                return;
            }
            logger.done();
            self.socket_ = socket;
            self.writable = true;
            callback();
        });
    };
    
    /**
     * The data handler of the internal socket
     *
     * @method onSocketData_
     * @param {Buffer} data the data received
     */
    TcpTransport.prototype.onSocketData_ = function(data) {
        this.emit('data', data);
    };
    
    /**
     * The drain handler of the internal socket
     *
     * @method onSocketDrain_
     */
    TcpTransport.prototype.onSocketDrain_ = function() {
        this.logger_.debug('The underlying socket ' + this.id + 
                           ' is now writable.');
        this.writable = true;
        this.emit('drain');
    };
    
    /**
     * The end handler of the internal socket
     *
     * @method onSocketEnd_
     */
    TcpTransport.prototype.onSocketEnd_ = function() {
        this.logger_.debug('Peer ' + this.host_ + ':' + this.port_ + 
                           ' has closed the connection.');
        this.writable = false;
        this.socket_ = null;
        this.emit('end');
    };
    
    /**
     * The error handler of the internal socket
     *
     * @method onSocketError_
     * @param {Error} error the error occurs
     */
    TcpTransport.prototype.onSocketError_ = function(error) {
        this.logger_.debug('The underlying socket ' + this.id + 
                           ' fails. Error: ' + C.lang.reflect.inspect(error));
        this.socket_.destroy();
        this.writable = false;
        this.socket_ = null;
        this.emit('error', error);
    };
    
    /**
     * Write the data buffer to the socket
     *
     * @method write
     * @param {Buffer} data the data buffer to be written
     * @param {Function} callback the callback function to be invoked after the
     *                            data has been successfully written.
     */
    TcpTransport.prototype.write = function(data, callback) {
        var logger = null;
        
        if (!this.writable) {
            this.logger_.error('Underlying socket ' + this.id + 
                               ' is not writable');
            callback(new C.persia.errors.ShouldPauseError(this));
            return;
        }
        
        
        this.logger_.debug('Writing ' + data.length + 
                     ' bytes onto underlying socket ' + this.id + ' ...');
        this.writable = this.socket_.write(data, callback);
    };
    
    /**
     * Close this socket
     *
     * @method close
     * @param {Function} callback the callback function to be invoked after the
     *                   socket is closed. However, since net.Socket does not
     *                   provide a hook or callback to notify the caller when
     *                   the socket is closed, the passed-in callback is
     *                   triggered once the `net.Socket.end` returns.
     */
    TcpTransport.prototype.close = function(callback) {
        
        this.socket_.end();
        this.socket_ = null;
        this.writable = false;
        
        callback && callback();
    };
    
    C.namespace('persia.transports.tcp').TcpTransport = TcpTransport;
    
    
    /**
     * The TcpServerTransport is the TCP implementation of the abstract
     * server transport in node.js.
     *
     * @class TcpServerTransport
     * @constructor
     * @param {Object} config the config for this node.js implementation of TCP
     *                        transport server
     */
    function TcpServerTransport(config) {
        /* inheritance */
        this.super();
        
        /**
         * The config object for this server transport
         * 
         * @property config_
         * @type Object
         * @deafult {}
         */
        this.config_ = config || {};
        
        /**
         * The address this server transport is to listen on
         *
         * @property address_
         * @type String
         * @default null
         */
        this.address_ = this.config_.address;
        
        /**
         * The port this server transport is to listen on
         * 
         * @property port_
         * @type Number
         * @default 8080
         */
        this.port_ = this.config_.port || 8000;
        
        /**
         * The internal node.js TCP server socket instance
         *
         * @property server_
         * @type Server
         * @default null
         */
        this.server_ = null;
    }
    
    C.lang.inherit(TcpServerTransport, C.persia.transports.ServerTransport);
    
    /**
     * Return the id of the transport
     * 
     * @method getId_
     * @return {String} the identifier of this transport
     */
    TcpServerTransport.prototype.getId_ = function () {
        return 'tcp.server@' + this.address_ + ':' + this.port_;
    };
    
    /**
     * Start this TCP server by calling its listen method
     *
     * @method listen
     * @param {Function} callback the callback function to be invoked when the
     *                            server is listening on the desired port, or
     *                            some error occurs.
     */
    TcpServerTransport.prototype.listen = function(callback) {
        var logger = C.logging.getStepLogger(this.logger_),
            self = this,
            server = null,
            handler = null;
            
        if (null !== this.server_) {
            this.logger_.debug('The underlying tcp server ' + this.id + 
                               ' has already been running.');
            callback();
            return;
        }
        
        server = C.natives.net.createServer(this.onSocketConnected_.bind(this));
        handler = function (error) {
            logger.error(error);
            callback(error);
        };
        server.once('error', handler);
        
        logger.start('Starting the underlying TCP server @' + this.address_ + 
                     ':' + this.port_);
        
        server.listen(this.port_, this.address_, function () {
            logger.done();
            server.removeListener('error', handler);
            self.server_ = server;
            callback();
        });
    };
    
    /**
     * event handler to be called when client connects
     * 
     * @method onSocketConnected_
     * @param {Socket} socket the client socket connected
     */
    TcpServerTransport.prototype.onSocketConnected_ = function (socket) {
        var transport = null;
        
        transport = TcpTransport.createFromSocket(socket);
        this.logger_.debug('New client TCP transport ' + transport.id + 
                           ' is accepted.');
        this.emit('transport', transport);
    };
    
    /**
     * Close this TCP server transport.
     *
     * @method close
     * @param {Function} callback the callback function to be invoked after the
     *                            internal socket server is closed.
     */
    TcpServerTransport.prototype.close = function(callback) {
        var self = this,
            logger = C.logging.getStepLogger(this.logger_);
        
        logger.start('Stopping the underlying TCP server socket ' + this.id);
        this.server_.close(function () {
            self.server_ = null;
            logger.done();
            callback();
        });
    };
    
    C.namespace('persia.transports.tcp').TcpServerTransport = TcpServerTransport;
    
    /**
     * This TransportFactory class is the abstract base of all concrete
     * transport factory implementations and is a similar definition as the
     * SocketFactory in JAVA
     *
     * @class TransportFactory
     * @constructor
     */
    function TcpTransportFactory () {
        /**
         * The logger instance for this factory
         *
         * @property logger_
         * @type Logger
         */
        this.logger_ = C.logging.getObjectLogger(this);
    }
    
    /**
     * Create a client transport
     *
     * @method createTransport
     * @param {}  
     * @return {Transport} the new created client transport
     */
    TransportFactory.prototype.createTransport = function () {
        throw new C.errors.NotImplementedError('Method createTransport is not' +
                                               ' implemented in this class,' +
                                               ' and is expected to be ' +
                                               'overwritten in child ' +
                                               'classes');
    };
    
    /**
     * Create a server transport
     *
     * @method createServerTransport
     * @param {}  
     * @return {ServerTransport} the new created server transport
     */
    TransportFactory.prototype.createServerTransport = function () {
        throw new C.errors.NotImplementedError('Method createServerTransport ' +
                                               'is not implemented in this ' +
                                               'class, and is expected to be ' +
                                               'overwritten in child ' +
                                               'classes');
    };
    
}, '0.0.1', { requires: ['persia.transports.base'] });