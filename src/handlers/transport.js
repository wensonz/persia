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
     */
    function TransportHandler (name) {
        /* inheritance */
        this.super(name);
    }
    
    C.lang.inherit(TransportHandler, C.persia.handlers.Handler);
    
    /**
     * Handle the outbound data/message and invoke the specified callback
     * 
     * @method handleOutbound
     * @param {Object} context the context object for the pipeline
     * @param {Buffer} data the data to be handled
     */
    TransportHandler.prototype.handleOutbound = function (context, data) {
        context.transport.write(data, context.callback);
    };
    
    C.namespace('persia.handlers').TransportHandler = TransportHandler;
    
}, '0.0.1', { requires: ['persia.handlers.base'] });