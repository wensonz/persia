/**
 * This module contains a child class of the DivertMessage, which implements
 * the serialization/deserialization of the divert messages into/from
 * JSON strings.
 *
 * @module persia-json-divert-message-nodejs
 */
Condotti.add('persia-json-divert-message-nodejs', function (C) {

    /**
     * This JsonDivertMessage is a child class of its abstract base 
     * DivertMessage , which is designed to implement the 
     * serialization/deserialization of the divert messages 
     * into/from JSON strings.
     *
     * @class JsonDivertMessage
     * @constructor
     * @param {String} owner the owner to be redirected to 
     */
    function JsonDivertMessage(owner) {
        /* inheritance */
        this.super(owner);
        
        /**
         * The logger instance
         *
         * @property logger_
         * @type Logger
         */
        this.logger_ = C.logging.getObjectLogger(this);
    }
    
    C.lang.inherit(JsonDivertMessage, C.persia.messages.DivertMessage);
    
    /**
     * Serialize this divert message to buffer
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
    JsonDivertMessage.prototype.serialize = function(callback) {
        var json = null,
            result = null;
        
        json = JSON.stringify({
            'o': this.owner,
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
    JsonDivertMessage.prototype.deserialize = function(data, callback) {
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
        
        this.owner = message.o;
        
        callback(null, this);
    };
    
    
    C.namespace('persia.messages.json').JsonDivertMessage = JsonDivertMessage;

}, '0.0.1', { requires: ['persia-divert-message']});
