/**
 * This module defines the basic behaviours a routing engine is expected to 
 * have.
 * 
 * @module persia.routing.engine
 */
Condotti.add('persia.routing.engine', function (C) {
    
    /**
     * This Engine class is the abstract base of all concrete routing engine 
     * implementations, and defines the basic behaviours a routing engine is 
     * expected to have.
     * 
     * @class Engine
     * @constructor
     * @extends EventEmitter
     */
    function Engine() {
        /* inheritance */
        this.super();
        
        /**
         * The logger instance for this router
         * 
         * @property logger_
         * @type Logger
         */
        this.logger_ = C.logging.getObjectLogger(this);
    }
    
    C.lang.inherit(Engine, C.events.EventEmitter);
    
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
    Engine.prototype.route = function (message, callback) {
        callback(new C.errors.NotImplementedError('This route method is not' +
                                                  ' implemented in this base' +
                                                  'class, and is expected to ' +
                                                  'be overwritten in the ' +
                                                  'child classes'));
    };
    
    C.namespace('persia.routing').Engine = Engine;
    
}, '0.0.1', { requires: ['persia.messages.base'] });