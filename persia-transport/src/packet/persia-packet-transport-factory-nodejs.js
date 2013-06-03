/**
 * This module contains the implementation of the class 
 * PacketTransportFactory, which is the child class of
 * the TransportFactory, and is designed to provide the
 * management facilities of the packet transport.
 *
 * @module persia-packet-transport-factory-nodejs
 */
Condotti.add('persia-packet-transport-factory-nodejs', function (C) {

    /**
     * This PacketTransportFactory is a child of the abstract base
     * TransportFactory, and is designed to provide the management
     * facilities of the packet transports and servers
     *
     * @class PacketTransportFactory
     * @constructor
     * @param {TransportFactory} transportFactory the underlying transport
     *                                            factory used to provide the 
     *                                            management of the working
     *                                            transports and servers
     */
    function PacketTransportFactory(transportFactory) {
        /* inheritance */
        this.super();
        
        /**
         * The underlying transport factory instance
         *
         * @property transportFactory_
         * @type TransportFactory
         * @default transportFactory
         */
        this.transportFactory_ = transportFactory;
        
    }
    
    C.lang.inherit(PacketTransportFactory, C.persia.transports.TransportFactory);
    
    /**
     * Create a packet transport.
     *
     * @method createTransport
     * @param {Function} callback the callback function to be invoked after the
     *                            transport has connected with the other point
     *                            successfully, or some error occurs. The 
     *                            signature of the callback is like 
     *                            'function (error, transport) {}'.
     */
    PacketTransportFactory.prototype.createTransport = function(callback) {
        var self = this;
        this.logger_.debug('Creating underlying transport ...');
        this.transportFactory_.createTransport(function (error, transport) {
            if (error) {
                self.logger_.debug('Creating underlying transport failed. ' +
                                   'Error: ' + C.lang.inspect(error));
                callback(error, null);
                return;
            }
            
            self.logger_.debug('Creating underlying transport succeed: ' +
                               C.lang.inspect(transport));
            callback(null, 
                     new C.persia.transports.packet.PacketTransport(transport));
        });
    };
    
    /**
     * Create a packet transport server.
     *
     * @method createTransportServer
     * @param {Function} callback the callback function to be invoked after the
     *                            server is created successfully, or some error
     *                            occurs. The signature of the callback is like
     *                            'function (error, server) {}'.
     */
    PacketTransportFactory.prototype.createTransportServer = function(callback) {
        var self = this;
        this.logger_.debug('Creating the underlying transport server ...');
        this.transportFactory_.createTransportServer(function (error, server) {
            if (error) {
                self.logger_.debug('Creating the underlying transport server ' +
                                   'failed. Error: ' + C.lang.inspect(error));
                callback(error, null);
                return;
            }
            
            self.logger_.debug('Creating the underlying transport server: ' +
                               C.lang.inspect(server) + ' succeed.');
            callback(null, 
                     new C.persia.transports.packet.PacketTransportServer(server));
        });
    };
    
    C.namespace('persia.transports.packet').
        PacketTransportFactory = PacketTransportFactory;

}, '0.0.1', { requires: ['condotti-nodejs', 'persia-transport-factory', 
                         'persia-packet-transport-nodejs', 
                         'persia-packet-transport-server-nodejs']});