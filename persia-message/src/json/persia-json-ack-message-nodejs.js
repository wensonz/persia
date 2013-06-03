/**
 * This module contains a child class of the AckMessage, which implements
 * the serialization/deserialization of the ack messages into/from
 * JSON strings.
 *
 * @module persia-json-ack-message-nodejs
 */
Condotti.add('persia-json-ack-message-nodejs', function (C) {

    /**
     * This JsonAckMessage is a child class of its abstract base 
     * AckMessage , which is designed to implement the 
     * serialization/deserialization of the ack messages 
     * into/from JSON strings.
     *
     * @class JsonSubscribeMessage
     * @constructor
     * @param {String} topic the topic to be acked
     * @param {String} cursor the cursor of the message to be acked
     */
    function JsonAckMessage(cursor) {
        /* inheritance */
        this.super(cursor);
        
        /**
         * The logger instance
         *
         * @property logger_
         * @type Logger
         */
        this.logger_ = C.logging.getObjectLogger(this);
    }
    
    C.lang.inherit(JsonAckMessage, C.persia.messages.AckMessage);
    
    /**
     * Serialize this ack message to buffer
     *
     * @method serialize
     * @param {Function} callback the callback function to be invoked when the
     *                            message instance is successfully serialized,
     *                            or some unexpected error occurs. The signature
     *                            of the callback function is 
     *                            'function (error, data) {}' while data is the
     *                            Buffer instance contains the serialized binary
     *                            data.
     */
    JsonAckMessage.prototype.serialize = function(callback) {
        var json = null,
            result = null;
        
        json = JSON.stringify({
            'c': this.cursor,
        });
        
        result = new Buffer(Buffer.byteLength(json, 'utf-8'));
        result.write(json, 'utf-8');
        
        callback(null, result);
    };
    
    /**
     * Deserialize buffer to message
     *
     * @method deserialize
     * @param {Buffer} data the binary data to be deserialized
     * @param {Function} callback the callback function to be invoked when the
     *                            binary data is successfully deserialized into
     *                            the message instance itself, or some 
     *                            unexpected error occurs. The signature of the
     *                            callback function is 
     *                            'function (error, message) {}' while message
     *                            is the normally the same one invokes this 
     *                            call.
     */
    JsonAckMessage.prototype.deserialize = function(data, callback) {
        var json = null,
            message = null;
        
        json = data.toString('utf-8');
        
        try {
            message = JSON.parse(json);
        } catch (e) {
            this.logger_.debug('Parsing received JSON string to message ' +
                               'failed. JSON: ' + json + ', Error: ' + 
                               C.lang.inspect(e));
            callback(e, null);
            return;
        }
        
        this.cursor = message.c;
        
        callback(null, this);
    };
    
    
    C.namespace('persia.messages.json').JsonAckMessage = JsonAckMessage;

}, '0.0.1', { requires: ['persia-ack-message']});
