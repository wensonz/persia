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
    
    C.lang.inherit(JsonCodecHandler, C.persia.pipeline.Handler);
    
    /**
     * Decode the inbound data as JSON string into message object
     * 
     * @method handleInbound
     * @param {Buffer} data the data to be decoded
     * @param {Function} callback the callback function to be invoked after the
     *                            passed-in data/message has been successfully
     *                            handled, or some error occurs. The signature
     *                            of the callback is 
     *                            'function (error, result) {}'
     */
    JsonCodecHandler.prototype.handleInbound = function (data, callback) {
        try {
            callback(null, JSON.parse(data.toString()));
        } catch (e) {
            callback(e);
        }
    };
    
    /**
     * Encode the outbound message into JSON string
     * 
     * @method handleOutbound
     * @param {Object} data the message to be encoded
     * @param {Function} callback the callback function to be invoked after the
     *                            passed-in data/message has been successfully
     *                            handled, or some error occurs. The signature
     *                            of the callback is 
     *                            'function (error, result) {}'
     */
    JsonCodecHandler.prototype.handleOutbound = function (data, callback) {
        try {
            callback(null, new Buffer(JSON.stringify(data)));
        } catch (e) {
            callback(e);
        }
    };
    
    C.namespace('persia.handlers').JsonCodecHandler = JsonCodecHandler;

}, '0.0.1', { requires: ['persia.handlers.base'] });