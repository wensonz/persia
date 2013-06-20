/**
 * This module contains the implementation of class JsonCodecHandler, which is
 * a child of the abstract base class Handler and designed to encode/decode the
 * outbound/inbound data into/from JSON string.
 * 
 * @module persia.handlers.json-codec
 */
Condotti.add('persia.handlers.json-codec', function (C) {
    
    /**
     * This JsonCodecHandler is a child class of the abstract base class
     * Handler, and designed to encode/decode the outbound/inbound message
     * into/from JSON string in a buffer.
     * 
     * @class JsonCodecHandler
     * @constructor
     * @extends Handler
     */
    function JsonCodecHandler () {
        /* inheritance */
        this.super();
    }
    
    C.lang.inherit(JsonCodecHandler, C.persia.handlers.Handler);
    
    /**
     * Decode the inbound data as JSON string into message object
     * 
     * @method handleInbound
     * @param {Object} context the context object for the pipeline
     * @param {Buffer} data the data to be decoded
     */
    JsonCodecHandler.prototype.handleInbound = function (context, data) {
        
        try {
            this.fireInbound_(context, JSON.parse(data.toString()));
        } catch (e) {
            // TODO: wrap e
            this.fireCaughtError_(context, e);
        }
    };
    
    /**
     * Encode the outbound message into JSON string
     * 
     * @method handleOutbound
     * @param {Object} context the context object for the pipeline
     * @param {Object} data the message to be encoded
     */
    JsonCodecHandler.prototype.handleOutbound = function (context, data) {
        this.fireOutbound_(context, new Buffer(JSON.stringify(data)));
    };
    
    C.namespace('persia.handlers').JsonCodecHandler = JsonCodecHandler;

}, '0.0.1', { requires: ['persia.handlers.base'] });