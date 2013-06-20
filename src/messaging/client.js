/**
 * This module contains the implementation of the client side messaging handler,
 * which is designed to provide client side functionalities for the messaging
 * system
 *
 * @module persia.messaging.client
 */
Condotti.add('persia.messaging.client', function (C) {
    
    /**
     * This MessagingHandler class is a child of the abstract base class
     * Handler and is designed to provide the client side functionalities for
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
     * @class MessagingHandler
     * @constructor
     * @extends Handler
     * @param {String} name the name of the handler
     */
    function MessagingHandler (name) {
        /* inheritance */
        this.super(name);
    }
    
    C.lang.inherit(MessagingHandler, C.persia.handlers.Handler);
    
    /**
     * Handle the inbound data and invoke the next handler in the chain
     * 
     * @method handleInbound
     * @param {Object} context the context object for the pipeline
     * @param {Object} data the data to be handled
     */
    MessagingHandler.prototype.handleInbound = function (context, data) {
        
        this.logger_.info('New message received: ' + 
                          C.lang.reflect.inspect(data));
        
        switch (data.type) {
        case 'DATA':
            this.onDataMessage_(context, data);
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
     * Handle the inbound DATA message
     *
     * @method onPublishingMessage_
     * @param {Object} context the context object for this handler
     * @param {Object} message the subscription message to be handled
     */
    MessagingHandler.prototype.onDataMessage_ = function (context, message) {
        //
        this.logger_.info('Data message received');
    };
    
    
    /**
     * Handle the caught error and invoke the next handler in the chain
     * 
     * @method handleCaughtError
     * @param {Object} context the context object for the pipeline
     * @param {Error} error the error caught
     */
    MessagingHandler.prototype.handleCaughtError = function (context, error) {
        var self = this;
        
        this.logger_.error('Error occurs in pipeline ' + 
                           context.pipeline.toString() + '. Detail: ' +
                           C.lang.reflect.inspect(error));
        
        context.transport.close();
    };
    
    C.namespace('persia.handlers').MessagingHandler = MessagingHandler;
    
}, '0.0.1', { requires: ['persia.handlers.base'] });