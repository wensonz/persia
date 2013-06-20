/**
 * This module contains the implementation of the server side messaging handler,
 * which is designed to provide server side functionalities for the messaging
 * system
 *
 * @module persia.messaging.server
 */
Condotti.add('persia.messaging.server', function (C) {
    
    /**
     * This ServerMessagingHandler class is a child of the abstract base class
     * Handler and is designed to provide the server side functionalities for
     * the messaging system. The data structure of the messages used in this
     * system are as following:
     *
     * SUBSCRIPTION: 
     * {
     *    "type": "SUBSCRIPTION",
     *    "topic": "${topic name to be subscribed}"
     * }
     * 
     * PUBLISHING:
     * {
     *     "type": "PUBLISHING",
     *     "topic": "${topic name for the data to be published}",
     *     "data": ${arbitary binary data}
     * }
     *
     * DATA:
     * {
     *     "type": "DATA",
     *     "topic": "${topic name this data comes from}",
     *     "data": ${arbitary binary data}
     * }
     *
     * ERROR:
     * {
     *     "type": "ERROR",
     *     "code": ${error code in number},
     *     "message": ${error message}
     *     // "action": "${action name causing this error}" ?
     * }
     *
     *
     * @class ServerMessagingHandler
     * @constructor
     * @extends Handler
     * @param {String} name the name of the handler
     */
    function ServerMessagingHandler (name) {
        /* inheritance */
        this.super(name);
        
        /**
         * The subscription collection with the topic name as key and the 
         * corresponding handler as value
         * 
         * @property subscriptions_
         * @type Object
         * @deafult {}
         */
        this.subscriptions_ = {};
    }
    
    C.lang.inherit(ServerMessagingHandler, C.persia.handlers.Handler);
    
    /**
     * Handle the inbound data and invoke the next handler in the chain
     * 
     * @method handleInbound
     * @param {Object} context the context object for the pipeline
     * @param {Object} data the data to be handled
     */
    ServerMessagingHandler.prototype.handleInbound = function (context, data) {
        
        this.logger_.info('New message received: ' + 
                          C.lang.reflect.inspect(data));
        
        switch (data.type) {
        case 'SUBSCRIPTION':
            this.onSubscriptionMessage_(context, data);
            break;
        case 'PUBLISHING':
            this.onPublishingMessage_(context, data);
            break;
        default:
            this.logger_.error('Unsupported message type "' + data.type + 
                               '" is found.');
            this.handleOutbound(context, { 
                type: "ERROR", 
                code: 415, // Unsupported Media Type
                message: 'Message type "' + data.type + '" is not supported.' 
            });
        }
    };
    
    /**
     * Handle the inbound SUBSCRIPTION message
     *
     * @method onSubscriptionMessage_
     * @param {Object} context the context object for this handler
     * @param {Object} message the subscription message to be handled
     */
    ServerMessagingHandler.prototype.onSubscriptionMessage_ = function (context, 
                                                                        message) {
        //
        var factory = null,
            topic = null,
            handler = null,
            self = this;
        
        if (message.topic in this.subscriptions_) {
            this.logger_.warn('Topic ' + message.topic + 
                              ' has already been subscribed');
            return;
        }
        
        factory = context.factories.topic;
        topic = factory.get(message.topic);
        handler = function (data) {
            self.handleOutbound(context, {
                type: 'DATA',
                topic: message.topic,
                data: data
            });
        };
        
        this.subscriptions_[message.topic] = handler;
        topic.on('message', handler);
        
        // Add listener to 'end' and 'close' event
        if (Object.keys(this.subscriptions_).length > 1) {
            return;
        }
        
        // some tricky implementaion here
        // TODO: refactor and add handleConnected method?
        handler = function () {
            Object.keys(self.subscriptions_).forEach(function (topic) {
                factory.get(topic).removeListener(
                    'message', self.subscriptions_[topic]
                );
            })
        };
        
        context.transport.on('end', handler);
        context.transport.on('error', handler);
    };
    
    /**
     * Handle the inbound PUBLISHING message
     *
     * @method onPublishingMessage_
     * @param {Object} context the context object for this handler
     * @param {Object} message the subscription message to be handled
     */
    ServerMessagingHandler.prototype.onPublishingMessage_ = function (context,
                                                                      message) {
        //
        var factory = null,
            topic = null;
        
        factory = context.factories.topic;
        topic = factory.get(message.topic);
        topic.emit('message', message.data);
    };
    
    
    
    /**
     * Handle the caught error and invoke the next handler in the chain
     * 
     * @method handleCaughtError
     * @param {Object} context the context object for the pipeline
     * @param {Error} error the error caught
     */
    ServerMessagingHandler.prototype.handleCaughtError = function (context, error) {
        var self = this;
        
        this.logger_.error('Error occurs in pipeline ' + 
                           context.pipeline.toString() + '. Detail: ' +
                           C.lang.reflect.inspect(error));
        
        Object.keys(self.subscriptions_).forEach(function (topic) {
            factory.get(topic).removeListener(
                'message', self.subscriptions_[topic]
            );
        })
        
        context.transport.close();
    };
    
    C.namespace('persia.handlers').ServerMessagingHandler = ServerMessagingHandler;
    
}, '0.0.1', { requires: ['persia.handlers.base'] });