/**
 * This module contains the implementation of the class PacketTransportServer,
 * which is a child class of the abstract base TransportServer, and is the
 * corresponding server implementation for the PacketTransport.
 *
 * @module persia-packet-transport-server-nodejs
 */
Condotti.add('persia-packet-transport-server-nodejs', function (C) {

    /**
     * This class PacketTransportServer is the implementation of the abstract
     * base TransportServer, and is the corresponding server implementation for
     * the PacketTransport.
     *
     * @class PacketTransportServer
     * @constructor
     * @param {TransportServer} server the underlying transport server for the
     *                                 actual client acceptance, and data 
     *                                 transportation
     */
    function PacketTransportServer(server) {
        
        /* inheritance */
        this.super('packet@' + server.id);
        
        /**
         * The underlying transport server instance
         *
         * @property server_
         * @type TransportServer
         * @default server
         */
        this.server_ = server;
        
        /**
         * The logger instance
         *
         * @property logger_
         * @type Logger
         */
        this.logger_ = C.logging.getObjectLogger(this);
        
        
        /* initialization */
        this.server_.on('transport', C.lang.bind(this.onServerTransport_, 
                                                 this));
    }
    
    C.lang.inherit(PacketTransportServer, 
                   C.persia.transports.TransportServer);
    
    
    /**
     * Start this transport server.
     *
     * @method start
     * @param {Function} callback the callback function to be invoked when
     *                            the server is started successfully, or
     *                            some error occurs. The signature of the
     *                            callback is 'function (error) {}'.
     */
    PacketTransportServer.prototype.start = function(callback) {
        var self = this;
        
        this.server_.start(function (error) {
            if (error) {
                self.logger_.debug('Starting underlying transport server ' + 
                                   this.server_.id + ' failed. Error: ' +
                                   C.lang.inspect(error));
            }
            callback(error);
        });
    };
    
    
    /**
     * Stop the transport server.
     *
     * @method stop
     * @param {Function} callback the callback function to be invoked after the
     *                            server is closed successfully, or some error
     *                            occurs. The signature of the callback is 
     *                            'function (error) {}'.
     */
    PacketTransportServer.prototype.stop = function(callback) {
        var self = this;
        this.server_.stop(function (error) {
            if (error) {
                self.logger_.debug('Stopping underlying transport server ' + 
                                   this.server_.id + ' failed. Error: ' +
                                   C.lang.inspect(error));
            } else {
                self.logger_.debug('Stopping underlying transport server ' + 
                                   this.server_.id + ' succeed.');
            }
            callback(error);
        });
    };
    
    /**
     * 'transport' event handler for the underlying server
     *
     * @method onServerTransport_
     * @param {Transport} transport the new accepted client transport
     */
    PacketTransportServer.prototype.onServerTransport_ = function(transport) {
        this.logger_.debug('New underlying client transport ' + transport.id + 
                           ' is accepted.');
        this.emit('transport', 
                  new C.persia.transports.packet.PacketTransport(transport));
    };
    
    
    C.namespace('persia.transports.packet').
        PacketTransportServer = PacketTransportServer;

}, '0.0.1', { requires: ['condotti-nodejs', 'persia-transport-server', 
                         'persia-packet-transport-nodejs']});