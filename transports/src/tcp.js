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
     * @param {Socket} socket the internal TCP socket for this transport
     */
    function TcpTransport(socket) {
        /* inheritance */
        this.super(this.getId_(socket));
        
        /**
         * The internal TCP socket
         *
         * @property socket_
         * @type Socket
         * @default socket
         */
        this.socket_ = socket;
        
        /**
         * Whether the underlying socket is writable
         *
         * @property writable_
         * @type Boolean
         * @default true
         */
        this.writable_ = true;
        
        /* intialization */
        this.socket_.on('data', this.onSocketData_.bind(this));
        this.socket_.on('drain', this.onSocketDrain_.bind(this));
        this.socket_.on('end', this.onSocketEnd_.bind(this));
        this.socket_.on('error', this.onSocketError_.bind(this));
    }
    
    C.lang.inherit(TcpTransport, C.persia.transports.Transport);
    
    /**
     * Return the id of the passed-in socket
     * 
     * @method getId_
     * @param {Socket} socket the socket whose id is to be returned
     */
    TcpTransport.prototype.getId_ = function (socket) {
        var local = socket.address();
        return '(' + local.address + ':' + local.port + ' => ' + 
               socket.remoteAddress + ':' + socket.remotePort + ')';
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
                           'underlying socket ' + this.id);
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
        this.logger_.debug('The underlying socket ' + this.id + 
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
            this.logger_.error('Underlying socket ' + this.id + 
                               ' is not writable');
            callback(new C.persia.errors.ShouldPauseError(this));
            return;
        }
        
        logger.start('Writing ' + data.length + ' bytes to underlying TCP ' +
                     'socket ' + this.id);
                     
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
        callback && callback();
    };
    
    C.namespace('persia.transports.tcp').TcpTransport = TcpTransport;
    
    
    
    /**
     * The TcpTransportServer is the TCP implementation of the abstract
     * transport server in node.js.
     *
     * @class TcpTransportServer
     * @constructor
     * @param {Object} config the config for this node.js implementation of TCP
     *                        transport server
     */
    function TcpTransportServer(config) {
        /* inheritance */
        this.super('(@' + config.address + ':' + config.port + ')');
        
        /**
         * The config for this transport server
         *
         * @property config_
         * @type Object
         * @default config
         */
        this.config_ = config;
        
        /**
         * The internal node.js TCP socket server isntance
         *
         * @property server_
         * @type Server
         * @default null
         */
        this.server_ = null;
    }
    
    C.lang.inherit(TcpTransportServer, C.persia.transports.TransportServer);
    
    /**
     * Start this TCP server
     *
     * @method start
     * @param {Function} callback the callback function to be invoked when the
     *                            server is listening on the desired port, or
     *                            some error occurs.
     */
    TcpTransportServer.prototype.start = function(callback) {
        var self = this;
        if (null !== this.server_) {
            this.logger_.debug('The underlying tcp server is already running,' +
                               ' nothing is to be done.');
            C.lang.nextTick(callback);
            return;
        }
        
        this.server_ = C.natives.net.createServer(this.config_, 
                                                  function (socket) {
            var transport = new C.persia.transports.tcp.TcpTransport(socket);
            self.logger_.debug('New client TCP socket ' + socket.remoteAddress +
                               ':' + socket.remotePort + ' is accepted.');
            self.emit('transport', transport);
        });
        // Since current node.js implementation sets SO_REUSEADDR already,
        // 'error' events are not handled here
        this.server_.listen(this.config_.port, this.config_.address, function (error) {
            if (error) {
                self.logger_.debug('The underlying tcp server fails to listen' +
                                   ' on ' + self.config_.address + ':' + 
                                   self.config_.port + '. Error: ' + 
                                   C.lang.inspect(error));
            }
            
            callback(error);
        });
    };
    
    /**
     * Stop this TCP server.
     *
     * @method stop
     * @param {Function} callback the callback function to be invoked after the
     *                            internal socket server is closed.
     */
    TcpTransportServer.prototype.stop = function(callback) {
        var self = this;
        this.server_.close(function (error) {
            self.server_ = null;
            if (error) {
                self.logger_.debug('Stopping underlying tcp server failed. ' + 
                                   'Error: ' + C.lang.inspect(error));
            }
            callback(error);
        });
    };
    
    C.namespace('persia.transports.tcp').TcpTransportServer = TcpTransportServer;

}, '0.0.1', { requires: ['persia.transports.base'] });