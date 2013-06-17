/**
 * This module contains the implementation of the class PassiveRouter which is
 * a child of the abstract base class Router.
 *
 * @module persia.routing.passive
 */
Condotti.add('persia.routing.passive', function (C) {
    
    /**
     * This PassiveRouter class is a child of its abstract base Router, and 
     * designed to route the message to the targets that connect directly to it.
     * For those targets that are not connected, they are ignored.
     *
     * @class PassiveRouter
     * @constructor
     * @extends Router
     * @param {String} id the identifier of this router
     * @param {ServerChannel} server the underlying server channel to accept
     *                               the client channel connections
     */
    function PassiveRouter (id, server) {
        /* inheritance */
        this.super(id);
        
        /**
         * The underlying server channel to accept the client channel
         * connections
         * 
         * @property server_
         * @type ServerChannel
         */
        this.server_ = server;
        
        /**
         * The client channel registration table as the routing table
         * 
         * @property table_
         * @type Object
         * @deafult {}
         */
        this.table_ = {};
        
        /* initialize */
        this.server_.on('channel', this.onChannelConnected_.bind(this));
    }
    
    C.lang.inherit(PassiveRouter, C.persia.routing.Router);
    
    /**
     * Event handler used when new client channel connects to the underlying
     * server channel. The first message the client channel is expected to send
     * is an auth message, whose structure is as following:
     * {
     *     type: "registration",
     *     content: { id: "xxx", auth: "" }
     * }
     *
     * @method onChannelConnected_
     * @param {Channel} channel the connected client channel
     */
    PassiveRouter.prototype.onChannelConnected_ = function (channel) {
        var self = this,
            logger = C.logging.getStepLogger(this.logger_);
        
        this.logger_.debug('A new client channel ' + 
                           C.lang.reflect.inspect(channel) + ' connected.');
                           
        channel.once('message', function (message) {
            self.logger_.debug('An auth message ' +
                               C.lang.reflect.inspect(message) + 
                               ' is received from channel ' +
                               C.lang.reflect.inspect(channel));
            // message.type === 'registration'
            channel.peer = message.content.id;
            self.table_[channel.peer] = channel;
            
            channel.on('message', self.onChannelMessage_.bind(self, channel));
            // send back the ack
            // TODO: refactor the "ack" message structure
            // TODO: add "protocol"/"session" support?
            channel.write({ type: 'ack' });
        });
        
        // Handle the disconnection of the channel
        channel.on('end', function () {
            if (channel.peer) {
                delete self.table_[channel.peer];
            }
            
            channel.close();
        });
        
        channel.on('error', function (error) {
            self.logger_.error('Error occurs on the connected client channel ' +
                               C.lang.reflect.inspect(channel) + '. Details: ' +
                               C.lang.reflect.inspect(error));
            //
            if (channel.peer) {
                delete self.table_[channel.peer];
            }
            
            channel.close();
        });
    };
    
    /**
     * The "message" event handler for the connected client channel
     *
     * @method onChannelMessage_
     * @param {Channel} channel the connected client channel
     * @param {Object} message the received message from the channel
     */
    PassiveRouter.prototype.onChannelMessage_ = function (channel, message) {
        this.emit('message', message);
    };
    
    /**
     * Route the provided message to its specified targets. The data structure
     * of the message to be routed is expected to be as following:
     * {
     *     targets: ["ip A", "ip B"], // an array of target IDs, normally ip 
     *                                // addresses
     *     type: "message",
     *     path: ["ip C", "ip D"],    // an array of IDs that this message has 
     *                                // gone through
     *     content: ${arbitary content, could be a buffer or a string}
     * }
     *
     * @method route
     * @param {Object} message the message to be routed
     * @param {Function} callback the callback function to be invoked after the
     *                            message has been successfully routed to its
     *                            targets, or some error occurs. The signature
     *                            of the callback is 
     *                            'function (error, targets) {}'
     */
    PassiveRouter.prototype.route = function (message, callback) {
        var targets = null,
            self = this,
            logger = C.logging.getStepLogger(this.logger_);
        
        callback = callback || function () {};
        
        targets = message.targets.filter(function (target) {
            return target in self.table_;
        });
        
        message.path = message.path || [];
        message.path.push(this.id_);
        
        logger.start('Routing the provided message ' + 
                     C.lang.reflect.inspect(message) + 
                     ' to its targets ' + targets.toString() + 
                     ' in parallel');
                           
        C.async.filter(targets, function (target, next) {
            var logger = C.logging.getStepLogger(self.logger_);
            logger.start('Routing the provided message to target ' + target);
            self.table_[target].write(message, function (error) {
                if (error) {
                    logger.error(error);
                } else {
                    logger.done();
                }
                next(!error);
            });
        }, function (result) {
            logger.done(result);
            callback(null, result);
        });
    };
    
    C.namespace('persia.routing').PassiveRouter = PassiveRouter;
    
}, '0.0.1', { requires: ['persia.routing.router'] });