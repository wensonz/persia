/**
 * This module contains the definition of the abstract base Handler, 
 * which is the simulation of the ChannelHandler of the JAVA framework Netty.
 * 
 * @module persia.handlers.base
 */
Condotti.add('persia.handlers.base', function (C) {

    /**
     * This Handler class is the abstract base of all handlers for the channel
     * messages. It's the simulation of the class ChannelHandler of the JAVA
     * framework Netty.
     * 
     * @class Handler
     * @constructor
     * @param {String} name the name of this handler
     */
    function Handler(name) {
        /**
         * The logger instance for this handler
         * 
         * @property logger_
         * @type Logger
         */
        this.logger_ = C.logging.getObjectLogger(this);
        
        /**
         * The name of this handler
         * 
         * @property name
         * @type String
         */
        this.name = name || C.lang.reflect.getFunctionName(this.constructor);
        
        /**
         * The next handler in the handler chain. The chain starts with the
         * most lowest one above the transport, say, inbound direction
         * 
         * @property next
         * @type Handler
         * @deafult null
         */
        this.next = null;
        
        /**
         * The previous handler in the handler chain
         * 
         * @property prev
         * @type Handler
         * @deafult null
         */
        this.prev = null;
    }
    
    /**
     * Handle the inbound data and invoke the specified callback
     * 
     * @method handleInbound
     * @param {Object} context the context object for the pipeline
     * @param {Object} data the data to be handled
     */
    Handler.prototype.handleInbound = function (context, data) {
        this.fireInbound_(context, data);
    };
    
    /**
     * Handle the outbound data and invoke the specified callback
     * 
     * @method handleOutbound
     * @param {Object} context the context object for the pipeline
     * @param {Object} data the data to be handled
     */
    Handler.prototype.handleOutbound = function (context, data) {
        this.fireOutbound_(context, data);
    };
    
    /**
     * Find the next outbound handler and invoke it
     * 
     * @method fireOutbound_
     * @param {Object} context the context object for the pipeline
     * @param {Object} data the data to be handled
     */
    Handler.prototype.fireOutbound_ = function (context, data) {
        var handler = this.prev;
        
        if (!handler) {
            return;
        }
        
        C.lang.nextTick(function () {
            handler.handleOutbound(context, data);
        });
    };
    
    /**
     * Find the next inbound handler and invoke it
     * 
     * @method fireInbound_
     * @param {Object} context the context object for the pipeline
     * @param {Object} data the data to be handled
     */
    Handler.prototype.fireInbound_ = function (context, data) {
        var handler = this.next;
        
        if (!handler) {
            return;
        }
        
        C.lang.nextTick(function () {
            handler.handleOutbound(context, data);
        });
    };
    
    C.namespace('persia.handlers').Handler = Handler;

}, '0.0.1', { requires: [] });