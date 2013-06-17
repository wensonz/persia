/**
 * This module contains the definition of the class Router which is designed to
 * route the specified message to its targets
 *
 * @module persia.routing.router
 */
Condotti.add('persia.routing.router', function (C) {
    
    /**
     * This Router class is the abstract base class of all concrete router
     * implementations and is designed to define the basic behaviours a router
     * is supposed to have
     *
     * @class Router
     * @constructor
     * @extends EventEmitter
     * @param {String} id the identifier of this router
     */
    function Router (id) {
        /* inheritance */
        this.super();
        
        /**
         * The identifier of this router
         * 
         * @property id_
         * @type String
         */
        this.id_ = id;
        
        /**
         * The logger instance for this router
         *
         * @property logger_
         * @type Logger
         */
        this.logger_ = C.logging.getObjectLogger(this);
    }
    
    C.lang.inherit(Router, C.events.EventEmitter);
    
    /**
     * Route the provided message to its specified targets
     *
     * @method route
     * @param {Object} message the message to be routed
     * @param {Function} callback the callback function to be invoked after the
     *                            message has been successfully routed to its
     *                            targets, or some error occurs. The signature
     *                            of the callback is 
     *                            'function (error, targets) {}', while the
     *                            param "targets" is an array that contains the
     *                            id of the targets confirm the reception of the
     *                            message
     */
    Router.prototype.route = function (message, callback) {
        callback(new C.errors.NotImplementedError('This route method is not' +
                                                  ' implemented in this class' +
                                                  ' and expected to be ' +
                                                  'overwritten in the child ' +
                                                  'classes.'));
    };
    
    C.namespace('persia.routing').Router = Router;
    
}, '0.0.1', { requires: [] });