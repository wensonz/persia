/**
 * This module contains a child class of the SubscribeMessage, which implements
 * the serialization/deserialization of the subscription messages into/from
 * JSON strings.
 *
 * @module persia-json-subscribe-message-nodejs
 */
Condotti.add('persia-json-subscribe-message-nodejs', function (C) {

    /**
     * This JsonSubscribeMessage is a child class of its abstract base 
     * SubscribeMessage , which is designed to implement the 
     * serialization/deserialization of the subscription messages 
     * into/from JSON strings.
     *
     * @class JsonSubscribeMessage
     * @constructor
     * @param {String} topic the topic to be subscribed
     * @param {String} cursor the cursor from where the messages are expected
     *                        to be delivered
     * @param {Boolean} ack whether ack is to be sent to the server to confirm
     *                      the reception
     */
    function JsonSubscribeMessage(topic, subscriber, cursor, ack, prefetch) {
        /* inheritance */
        this.super(topic, subscriber, cursor, ack, prefetch);
        
        /**
         * The logger instance
         *
         * @property logger_
         * @type Logger
         */
        this.logger_ = C.logging.getObjectLogger(this);
    }
    
    C.lang.inherit(JsonSubscribeMessage, C.persia.messages.SubscribeMessage);
    
    /**
     * Serialize this subscription message to buffer
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
    JsonSubscribeMessage.prototype.serialize = function(callback) {
        var json = null,
            result = null;
        
        json = JSON.stringify({
            't':this.topic, 
            'c': this.cursor,
			's': this.subscriber,
            'a':this.ack,
			'p': this.prefetch
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
    JsonSubscribeMessage.prototype.deserialize = function(data, callback) {
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
        this.cursor = message.c;
        this.ack = message.a;
		this.subscriber = message.s;
		this.prefetch = message.p;
        
        callback(null, this);
    };
    
    
    C.namespace('persia.messages.json').JsonSubscribeMessage = JsonSubscribeMessage;

}, '0.0.1', { requires: ['persia-subscribe-message']});