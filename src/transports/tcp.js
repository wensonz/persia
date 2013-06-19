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
     */
    TcpTransport.prototype.connect = function () {
        var self = this,
            logger = C.logging.getStepLogger(this.logger_),
            socket = null,
            events = ['connect', 'error'],
            handlers = {};
        
        socket = new C.natives.net.Socket();
        
        handlers.connect = function () {
            logger.done();
            
            events.forEach(function (event) {
                socket.removeListener(event, handlers[event]);
            });
            
            self.bindSocketEvents_(socket);
            self.socket_ = socket;
            self.writable = true;
            self.emit('connect');
        };
        
        handlers.error = function (error) {
            logger.error(error);
            
            events.forEach(function (event) {
                socket.removeListener(event, handlers[event]);
            });
            
            self.emit('error', error);
        };
        
        logger.start('Connecting to ' + this.host_ + ':' + this.port_);
        events.forEach(function (event) {
            socket.once(event, handlers[event]);
        });
        
        socket.connect({ host: this.host_, port: this.port_ });
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
        this.writable = true;
        this.emit('drain');
    };
    
    /**
     * The end handler of the internal socket
     *
     * @method onSocketEnd_
     */
    TcpTransport.prototype.onSocketEnd_ = function() {
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
     */
    TcpTransport.prototype.write = function(data) {
        var logger = null;
        
        if (!this.writable) {
            this.logger_.error('Underlying socket ' + this.id + 
                               ' is not writable');
            throw new C.persia.errors.ShouldPauseError(this);
        }
        
        
        this.logger_.debug('Writing ' + data.length + 
                     ' bytes onto underlying socket ' + this.id + ' ...');
        this.writable = this.socket_.write(data);
    };
    
    /**
     * Close this socket
     *
     * @method close
     */
    TcpTransport.prototype.close = function() {
        this.socket_.end();
        this.socket_ = null;
        this.writable = false;
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
     */
    TcpServerTransport.prototype.listen = function() {
        var logger = C.logging.getStepLogger(this.logger_),
            self = this,
            server = null,
            events = ['listening', 'error'],
            handlers = {};
            
        if (null !== this.server_) {
            this.logger_.debug('The underlying tcp server ' + this.id + 
                               ' has already been running.');
            return;
        }
        
        handlers.error = function (error) {
            logger.error(error);
            events.forEach(function (event) {
                server.removeListener(event, handlers[event]);
            });
            self.emit('error', error);
        };
        
        handlers.listening = function () {
            logger.done();
            events.forEach(function (event) {
                server.removeListener(event, handlers[event]);
            });
            self.server_ = server;
            self.emit('listening');
        };
        
        server = C.natives.net.createServer(this.onSocketConnected_.bind(this));
        events.forEach(function (event) {
            server.once(event, handlers[event]);
        });
        
        logger.start('Starting the underlying TCP server @' + this.address_ + 
                     ':' + this.port_);
        server.listen(this.port_, this.address_);
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
     */
    TcpServerTransport.prototype.close = function() {
        var self = this,
            logger = C.logging.getStepLogger(this.logger_),
            handler = null;
        
        logger.start('Stopping the underlying TCP server socket ' + this.id);
        handler = function () {
            self.server_.removeListener('close', handler);
            self.server_ = null;
            logger.done();
            self.emit('close');
        };
        this.server_.once('close', handler);
        
        this.server_.close();
    };
    
    C.namespace('persia.transports.tcp').TcpServerTransport = TcpServerTransport;
    
    /**
     * This TransportFactory class is the abstract base of all concrete
     * transport factory implementations and is a similar definition as the
     * SocketFactory in JAVA
     *
     * @class TransportFactory
     * @constructor
     * @extends TransportFactory
     * @param {Object} config the config object for this factory
     */
    function TcpTransportFactory (config) {
        /* inheritance */
        this.super();
        
        /**
         * The host for the transport to connect to, or for the server transport
         * to bind on
         * 
         * @property host_
         * @type String
         * @deafult null
         */
        this.host_ = config.host;
        
        /**
         * The port for the transport to connect to, or for the server transport
         * to bind on
         * 
         * @property port_
         * @type Number
         */
        this.port_ = config.port;
    }
    
    C.lang.inherit(TcpTransportFactory, C.persia.transports.TransportFactory);
    
    /**
     * Create a TCP client transport
     *
     * @method createTransport
     * @return {TcpTransport} the new created client transport
     */
    TcpTransportFactory.prototype.createTransport = function () {
        return new TcpTransport({ host: this.host_, port: this.port_ });
    };
    
    /**
     * Create a TCP server transport
     *
     * @method createServerTransport
     * @return {TcpServerTransport} the new created server transport
     */
    TransportFactory.prototype.createServerTransport = function () {
        return new TcpServerTransport({ 
            address: this.host_, port: this.port_ 
        });
    };
    
    C.namespace('persia.transports.tcp').TcpTransportFactory = TcpTransportFactory;
    
}, '0.0.1', { requires: ['persia.transports.base'] });