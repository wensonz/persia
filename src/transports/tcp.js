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
        this.host_ = null;
        
        /**
         * The port number this tcp transport connects to. Like the host_
         * property, it's the socket.remotePort
         * 
         * @property port_
         * @type Number
         */
        this.port_ = null;
        
        /**
         * The internal TCP socket
         *
         * @property socket_
         * @type Socket
         * @default socket
         */
        this.socket_ = null;
        
        /**
         * Whether this transport is a client transport
         * 
         * @property client_
         * @type Boolean
         * @default true
         */
        this.client_ = true;
        
        /**
         * Whether the transport is writable now
         * 
         * @property writable_
         * @type Boolean
         * @default false
         */
        this.writable_ = false;
        
        /* intialization */
        if (C.lang.reflect.getObjectType(config) === C.natives.net.Socket) {
            this.socket_ = config;
            this.bindSocketEvents_(this.socket_);
            this.host_ = this.socket_.remoteAddress;
            this.port_ = this.socket_.remotePort;
            this.client_ = false;
            this.writable_ = true;
        } else {
            // TODO: validations
            this.host_ = config.host;
            this.port_ = config.port;
        }
    }
    
    C.lang.inherit(TcpTransport, C.persia.transports.Transport);
    
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
        // TODO: check if it's a client transport
        var self = this,
            logger = C.logging.getStepLogger(this.logger_),
            socket = null;
        
        socket = new C.natives.net.Socket();
        this.bindSocketEvents_(socket);
        
        logger.start('Connecting to ' + this.host_ + ':' + this.port_);
        socket.connect({ host: this.host_, port: this.port_ }, function (error) {
            if (error) {
                logger.error(error);
            } else {
                logger.done();
                self.socket_ = socket;
                self.writable_ = true;
            }
            callback(error);
        });
    };
    
    /**
     * The data handler of the internal socket
     *
     * @method onSocketData_
     * @param {Buffer} data the data received
     */
    TcpTransport.prototype.onSocketData_ = function(data) {
        this.logger_.debug(data.length + ' bytes binary data [' + 
                           data.toString('hex') + '] is received from ' +
                           'underlying socket ' + this.toString());
        this.emit('data', data);
    };
    
    /**
     * The drain handler of the internal socket
     *
     * @method onSocketDrain_
     */
    TcpTransport.prototype.onSocketDrain_ = function() {
        this.logger_.debug('The underlying socket ' + this.toString() +
                           ' is now writable.');
        this.writable_ = true;
        this.emit('drain');
    };
    
    /**
     * The end handler of the internal socket
     *
     * @method onSocketEnd_
     */
    TcpTransport.prototype.onSocketEnd_ = function() {
        this.logger_.debug('The other end socket has been closed.');
        this.emit('end');
    };
    
    /**
     * The error handler of the internal socket
     *
     * @method onSocketError_
     * @param {Error} error the error occurs
     */
    TcpTransport.prototype.onSocketError_ = function(error) {
        this.logger_.debug('The underlying socket ' + this.toString() + 
                           'fails. Error: ' + C.lang.reflect.inspect(error));
        
        this.emit('error', error);
    };
    
    /**
     * Write the data buffer to the socket
     *
     * @method write
     * @param {Buffer} data the data buffer to be written
     * @param {Function} callback the callback function to be invoked after the
     *                            data has been successfully written.
     * @return {Boolean} the same return as the one of `net.Socket.write`
     */
    TcpTransport.prototype.write = function(data, callback) {
        var logger = C.logging.getStepLogger(this.logger_);
        
        if (!this.writable_) {
            this.logger_.error('Underlying socket ' + this.toString() + 
                               ' is not writable');
            callback(new C.persia.errors.ShouldPauseError(this));
            return;
        }
        
        logger.start('Writing ' + data.length + ' bytes to underlying TCP ' +
                     'socket ' + this.toString());
                     
        this.writable_ = this.socket_.write(data, function (error) {
            if (error) {
                logger.error(error);
                callback(error);
                return;
            }
            logger.done();
            callback();
        });
        
        return this.writable_;
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
        this.writable_ = false;
        
        callback && callback();
    };
    
    /**
     * Return the string representation of this TCP transport
     * 
     * @method toString
     * @return {String} the string representation of this TCP transport
     */
    TcpTransport.prototype.toString = function () {
        return 'tcp(' + (this.client_ ? '>' : '<') + this.host_ + ':' + 
               this.port_ + ')';
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
            server = null;
            
        if (null !== this.server_) {
            this.logger_.debug('The underlying tcp server is already running,' +
                               ' nothing is to be done.');
            C.lang.nextTick(callback);
            return;
        }
        
        server = C.natives.net.createServer(this.onSocketConnected_.bind(this));
        
        logger.start('Starting the underlying TCP server @' + this.address_ + 
                     ':' + this.port_);
        // Since current node.js implementation sets SO_REUSEADDR already,
        // 'error' events are not handled here
        server.listen(this.port_, this.address_, function (error) {
            if (error) {
                logger.error(error);
            } else {
                logger.done();
                self.server_ = server;
            }
            
            callback(error);
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
        
        transport = new TcpTransport(socket);
        this.logger_.debug('New client TCP socket ' + socket.remoteAddress +
                           ':' + socket.remotePort + ' is accepted.');
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
        
        logger.start('Stopping the underlying TCP server @' + this.address_ + 
                     ':' + this.port_);
                     
        this.server_.close(function (error) {
            self.server_ = null;
            
            if (error) {
                logger.error(error);
            } else {
                logger.done();
            }
            
            callback(error);
        });
    };
    
    /**
     * Return the string representation of this TCP server transport
     * 
     * @method toString
     * @return {String} the string representation of this TCP server transport
     */
    TcpServerTransport.prototype.toString = function () {
        return 'tcp(=' + this.host_ + ':' + this.port_ + ')';
    };
    
    C.namespace('persia.transports.tcp').TcpServerTransport = TcpServerTransport;
    
}, '0.0.1', { requires: ['persia.transports.base'] });