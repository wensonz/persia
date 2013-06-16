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
     * @param {ServerChannel} server the server channel for the client
     *                               channels to connect to
     */
    function UnicastEngine (server) {
        /* inheritance */
        this.super();
        
        /**
         * The server channel for the client channels to connect to
         * 
         * @property server_
         * @type ServerChannel
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
        this.server_.on('channel', this.onChannelConnected_.bind(this));
    }
    
    C.lang.inherit(UnicastEngine, C.persia.routing.Engine);
    
    /**
     * Event handler called when client channel connects to the internal
     * server channel
     * 
     * @method onChannelConnected_
     * @param {Channel} channel the connected client channel
     */
    UnicastEngine.prototype.onChannelConnected_ = function (channel) {
        this.logger_.debug('Client channel ' + C.lang.reflect.inspect(channel) +
                           ' connected.');
        channel.once('message', this.onChannelRegistration_.bind(this, channel));
    };
    
    /**
     * Handle the first message after a client channel connects to this server
     * channel, which is expected to be a registration message with necessary
     * authentication info. The structure of the registration message is defined
     * as follow:
     *
     * {
     *     "type": "registration",
     *     "content": { "identifier": "xxx", {other auth info} }
     * }
     *
     * @method onChannelRegistration_
     * @param {Channel} channel the connected client channel
     * @param {Object} message the registration message received
     */
    UnicastEngine.prototype.onChannelRegistration_ = function (channel, message) {
        
        this.logger_.debug('Channel registration message ' + 
                           C.lang.reflect.inspect(message) + 
                           ' is received from connected client channel ' +
                           C.lang.reflect.inspect(channel));
        // subscribe message/hello message
        // message.type === 'registration'
        // message.content === { identifier: "", token: "" }
        // self.table_[identifier] = transport;
        this.table_[message.content.identifier] = channel;
        
        channel.on('message', this.onChannelMessage_.bind(this, channel));
    };
    
    /**
     * The "message" event handler for the connected client channel
     *
     * @method onChannelMessage_
     * @param {Object} message the received client message
     */
    UnicastEngine.prototype.onChannelMessage_ = function (channel, message) {
        this.logger_.debug('Message ' + C.lang.reflect.inspect(message) + 
                           ' is received from client channel ' +
                           C.lang.reflect.inspect(channel));
                           
        // TODO: add channel to "sources"?
        this.emit('message', channel, message);
    };
    
    
    /**
     * Route the passed-in message and invoke the callback when the message has
     * been successfully sent to the its destinations. The data structure of the
     * message is expected to be like the following:
     *
     * {
     *     "target": ["ip A", "ip B"],
     *     "type": "message",
     *     "content": {an instance of Buffer}
     * }
     * 
     * @method route
     * @param {Message} message the message to be routed
     * @param {Function} callback the callback function to be invoked when the
     *                            message has been successfully routed to its
     *                            destinations, or some error occurs. The 
     *                            signature of the callback is
     *                            'function (error, targets) {}', while the
     *                            "targets" is an array contains the 
     *                            identifier of the targets that confirm
     *                            receiving the message.
     */
    UnicastEngine.prototype.route = function (message, callback) {
        var targets = null,
            self = this;
            
        
        // verify the message
        targets = message.targets.filter(function (target) {
            return target in self.table_;
        });
        
        this.logger_.debug('Targets ' + targets.toString() + ' are found ' +
                           'connected to this engine');
        
        C.async.forEach(targets, function (target, next) {
            var logger = C.logging.getStepLogger(self.logger_);
            logger.start('Routing the message ' + 
                         C.lang.reflect.inspect(message) +
                         ' to target ' + target);
                         
            self.table_[target].write(message, function (error) {
                if (error) {
                    logger.error(error);
                } else {
                    logger.done();
                }
                
                next(error);
            });
        }, function (error) {
            callback(error);
        });
    };
    
    C.namespace('persia.routing').UnicastEngine = UnicastEngine;
    
}, '0.0.1', { requires: ['persia.routing.engine'] });