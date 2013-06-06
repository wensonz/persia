/**
 * This module defines the basic behaviours a router is expected to have.
 * 
 * @module persia.routers.base
 */
Condotti.add('persia.routers.base', function (C) {
    
    /**
     * This Router class is the abstract base of all concrete router 
     * implementations, and defines the basic behaviours a router is expected to
     * have.
     * 
     * @class Router
     * @constructor
     * @param {Object} config the config for this router
     */
    function Router(config) {
        /**
         * The config object for this router
         * 
         * @property config_
         * @type Object
         */
        this.config_ = config;
        
        /**
         * The logger instance for this router
         * 
         * @property logger_
         * @type Logger
         */
        this.logger_ = C.logging.getObjectLogger(this);
        
        /**
         * The routing table
         * 
         * @property table_
         * @type Object
         * @default {}
         */
        this.table_ = {};
    }
    
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
    Router.prototype.route = function (message, callback) {
        callback(new C.errors.NotImplementedError('This route method is not' +
                                                  ' implemented in this base' +
                                                  'class, and is expected to ' +
                                                  'be overwritten in the ' +
                                                  'child classes'));
    };
    
    C.namespace('persia.routers').Router = Router;
    
}, '0.0.1', { requires: ['persia.messages.base'] });