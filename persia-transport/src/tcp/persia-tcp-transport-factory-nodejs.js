/**
 * This module implements the TCP version of the abstract TransportFactory 
 * under the node.js context, to provide the management functionalities of 
 * the TcpTransport and TcpTransportServer, etc.
 *
 * @module persia-tcp-transport-factory-nodejs
 */

Condotti.add('persia-tcp-transport-factory-nodejs', function (C) {

    /**
     * The TCP version of the abstract TransportFactory
     *
     * @class TcpTransportFactory
     * @constructor
     * @param {Object} config the config object to intialize this factory
     */
    function TcpTransportFactory(config) {
        /* inheritance */
        this.super();
        /**
         * The config object obtained during initialization
         *
         * @property config_
         * @type Object
         * @default config
         */
        this.config_ = config;
    }
    
    C.lang.inherit(TcpTransportFactory, C.persia.transports.TransportFactory);
    
    /**
     * The TCP version of createTransport, which actually create a client 
     * socket to the remote endpoint according to the configuration.
     *
     * @method createTransport
     * @return {Socket} the client socket created
     */
    TcpTransportFactory.prototype.createTransport = function(callback) {
        var socket = new C.natives.net.Socket(this.config_),
            handler = null,
            self = this;
        
        // TODO: move the socket creation to class TcpTransport?
        // the error handler for connecting only
        handler = function (error) {
            if (error) {
                self.logger_.debug('Underlying TCP socket fails to connect to ' + 
                                   self.config_.address + ':' + self.config_.port + 
                                   '. Error: ' + C.lang.inspect(error));
            }
            callback(error, null);
        };
        socket.once('error', handler);
        
        this.logger_.debug('Connecting the underlying TCP transport to ' + 
                           this.config_.address + ':' + this.config_.port +
                           ' ...');
        socket.connect(this.config_.port, this.config_.address, function () {
            var transport = null;
            // socket connects successfully, remove the error handler
            socket.removeListener('error', handler);
            self.logger_.debug('Underlying TCP socket connects to ' + 
                               self.config_.address + ':' + self.config_.port + 
                               ' successfully.');
            transport = new C.persia.transports.tcp.TcpTransport(socket);
            callback(null, transport);
        });
    };
    
    /**
     * The TCP version of createTransportServer, which actually invoke the
     * createServer method of node.js module net with the config object got
     * when initialized.
     *
     * @method createTransportServer
     * @param {Function} callback the callback function to be invoked after
     *                            the server is created successfully, or
     *                            some error occurs.
     */
    TcpTransportFactory.prototype.createTransportServer = function(callback) {
        callback(null, 
                 new C.persia.transports.tcp.TcpTransportServer(this.config_));
    };
    
    C.namespace('persia.transports.tcp').TcpTransportFactory = TcpTransportFactory;

}, '0.0.1', { requires: ['condotti-lang', 'condotti-nodejs', 
                         'condotti-events-nodejs', 'persia-transport-factory', 
                         'persia-tcp-transport-nodejs', 
                         'persia-tcp-transport-server-nodejs'] });