/**
 * This module contains the node.js implementation of the TCP version of the
 * abstract transport server
 *
 * @module persia-tcp-transport-server-nodejs
 */

Condotti.add('persia-tcp-transport-server-nodejs', function (C) {

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
        this.super('<' + config.address + ':' + config.port + '>');
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
        
        /**
         * The logger instance
         *
         * @property logger_
         * @type Logger
         */
        this.logger_ = C.logging.getObjectLogger(this);
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

}, '0.0.1', { requires: ['condotti-lang', 'condotti-events', 'condotti-nodejs',
                         'condotti-events-nodejs', 'persia-transport-server', 
                         'persia-tcp-transport-nodejs']});