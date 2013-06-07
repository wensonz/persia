/**
 * This module contains the implementation of table-based unicast routing 
 * engine.
 * 
 * @module persia.routing.unicast
 */
Condotti.add('persia.routing.unicast', function (C) {
    
    /**
     * This UnicastEngine is a child of its abstract base Engine, and is 
     * designed to unicast the message based on the routing table.
     * 
     * @class UnicastEngine
     * @constructor
     * @extends Engine
     * @param {ServerTransport} server the server transport to accept client
     *                                 transport connections
     */
    function UnicastEngine (server) {
        /* inheritance */
        this.super();
        
        /**
         * The server transport to aaccept client transport connections
         * 
         * @property server_
         * @type ServerTransport
         */
        this.server_ = server;
        
        /**
         * The routing table
         * 
         * @property table_
         * @type Object
         * @default {}
         */
        this.table_ = {};
        
        /* initialize */
        this.server_.on('transport', this.onTransportConnected_.bind(this));
    }
    
    C.lang.inherit(UnicastEngine, C.persia.routing.Engine);
    
    /**
     * Event handler called when client transport connects to the internal
     * server transport
     * 
     * @method onTransportConnected_
     * @param {Transport} transport the connected client transport
     */
    UnicastEngine.prototype.onTransportConnected_ = function (transport) {
        var self = this,
            logger = C.logging.getStepLogger(this.logger_);
        
        transport.once('data', function (message) {
            // subscribe message/hello message
            // message.type === 'hello'
            // message.content === { identifier: "", token: "" }
            // self.table_[identifier] = transport;
            // transport.on('data', self.onTransportData_.bind(self));
        });
    };
    
    /**
     * Route the passed-in message and invoke the callback when the message has
     * been successfully sent to the its destinations.
     * 
     * @method route
     * @param {Message} message the message to be routed
     * @param {Function} callback the callback function to be invoked when the
     *                            message has been successfully routed to its
     *                            destinations, or some error occurs. The 
     *                            signature of the callback is
     *                            'function (error, destinations) {}', while the
     *                            "destinations" is an array contains the 
     *                            identifier of the destinations that confirm
     *                            receiving the message.
     */
    UnicastEngine.prototype.route = function (message, callback) {
        //
    };
    
    C.namespace('persia.routing').UnicastEngine = UnicastEngine;
    
}, '0.0.1', { requires: ['persia.routing.engine'] });