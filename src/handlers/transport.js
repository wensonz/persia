/**
 * This module contains the implementation of the class TransportHandler which
 * is designed to handle the outbound data via writing it down to the 
 * underlying transport
 *
 * @module persia.handlers.transport
 */
Condotti.add('persia.handlers.transport', function (C) {
    
    /**
     * This TransportHandler is a child class of the abstract base class 
     * Handler, and is designed to handle the outbound data via writing it down
     * to the underlying transport.
     *
     * @class TransportHandler
     * @constructor
     * @extends Handler
     * @param {String} name the name of the handler
     * @param {Transport} transport the underlying transport to write data to
     */
    function TransportHandler (name, transport) {
        /* inheritance */
        this.super(name);
        
        /**
         * The underlying transport to write to
         * 
         * @property transport_
         * @type Transport
         */
        this.transport_ = transport;
    }
    
    C.lang.inherit(TransportHandler, C.persia.handlers.Handler);
    
    /**
     * Handle the inbound data/message and invoke the specified callback
     * 
     * @method handleInbound
     * @param {Object|Buffer} data the data/message to be handled
     * @param {Function} callback the callback function to be invoked after the
     *                            passed-in data/message has been successfully
     *                            handled, or some error occurs. The signature
     *                            of the callback is 
     *                            'function (error, result) {}'
     */
    TransportHandler.prototype.handleInbound = function (data, callback) {
        callback(null, data);
    };
    
    /**
     * Handle the outbound data/message and invoke the specified callback
     * 
     * @method handleOutbound
     * @param {Object|Buffer} data the data/message to be handled
     * @param {Function} callback the callback function to be invoked after the
     *                            passed-in data/message has been successfully
     *                            handled, or some error occurs. The signature
     *                            of the callback is 
     *                            'function (error, result) {}'
     */
    TransportHandler.prototype.handleOutbound = function (data, callback) {
        this.transport_.write(data, callback);
    };
    
    C.namespace('persia.handlers').TransportHandler = TransportHandler;
    
}, '0.0.1', { requires: ['persia.handlers.base'] });