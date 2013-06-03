/**
 * This module contains the JSON implementation of the PublishMessage, which
 * serialize/deserialize the publish message into/from JSON strings.
 *
 * @module persia-json-publish-message-nodejs
 */
Condotti.add('persia-json-publish-message-nodejs', function (C) {

    /**
     * This JsonPublishMessage is the JSON implementation of the PublishMessage,
     * which serializes/deserializes the publish message into/from JSON strings.
     *
     * @class JsonPublishMessage
     * @constructor
     * @param {String} topic the topic to be published to
     * @param {Boolean} ack if ack is required to confirm the publishing succeed
     * @param {Number} expire the lifespan of the published message in seconds
     * @param {Buffer} data the binary data to be published
     */
    function JsonPublishMessage(topic, ack, expire, data) {
        /* inheritance */
        this.super(topic, ack, expire, data);
        
        /**
         * The logger instance
         *
         * @property logger_
         * @type Logger
         */
        this.logger_ = C.logging.getObjectLogger(this);
    }
    
    C.lang.inherit(JsonPublishMessage, C.persia.messages.PublishMessage);
    
    /**
     * Serialize the message to JSON string
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
    JsonPublishMessage.prototype.serialize = function(callback) {
        var json = null,
            result = null;
        
        json = JSON.stringify({
            't':this.topic, 
            'a':this.ack, 
            'e':this.expire, 
            'd':this.data.toString('base64')
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
    JsonPublishMessage.prototype.deserialize = function(data, callback) {
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
        
        this.topic = message.t;
        this.ack = message.a;
        this.expire = message.e;
        this.data = new Buffer(Buffer.byteLength(message.d, 'base64'));
        this.data.write(message.d, 'base64');
        
        callback(null, this);
    };
    
    C.namespace('persia.messages.json').JsonPublishMessage = JsonPublishMessage;

}, '0.0.1', { requires: ['persia-publish-message']});