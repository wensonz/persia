/**
 * This module contains the implementation of the class MessageFactory, which
 * is designed to provide the management functionalities of the serialization/
 * deserialization of supported types of the messages between the persia 
 * clients and servers.
 *
 * @module persia-message-factory
 */
Condotti.add('persia-message-factory', function (C) {

    /**
     * This MessageFactory class is designed to know all kinds of messages
     * in the system for the persia clients and servers to communicate with
     * each other. It provides the facilities to serialize all supported kinds
     * of the messages, and deserialize the received serialized data to the
     * corresponding message objects based on the configuration specified when
     * being initialized.
     *
     * @class MessageFactory
     * @constructor
     */
    function MessageFactory() {
        /**
         * The logger instance
         *
         * @property logger_
         * @type Logger
         */
        this.logger_ = C.logging.getObjectLogger(this);
        
        /**
         * The message type mappings from constant message type id to the
         * concrete message type constructor
         *
         * @property types_
         * @type Object
         * @default {}
         */
        this.types_ = {};
    }
    
    MessageFactory.messages = {
        PUBLISH: 'PUBLISH',
        SUBSCRIBE: 'SUBSCRIBE',
        DATA: 'DATA',
        ERROR: 'ERROR',
        DIVERT: 'DIVERT',
        ACK: 'ACK'
    };
    
    /**
     * Return the constant id of the type of the passed-in message
     *
     * @method getMessageTypeId
     * @param {Message} message the message whose type id is to be returned
     * @return {String} the constant id of the type of the message
     */
    MessageFactory.prototype.getMessageTypeId = function(message) {
        return C.lang.getObjectType(message).__id__;
    };
    
    
    /**
     * Serialize the passed-in message to buffer
     *
     * @method serialize
     * @param {Message} message the message to be serialized
     * @param {Function} callback the callback function to be invoked when the
     *                            message is successfully serialized, or some
     *                            error occurs. The signature of the callback
     *                            is 'function (error, data) {}'
     */
    MessageFactory.prototype.serialize = function(message, callback) {
        callback(new C.errors.NotImplementedError('This serialize method is ' +
                                                  'not implemented in this ' +
                                                  'abstract base class, and' +
                                                  ' is expected to be ' +
                                                  'overwritten in child classes'));
    };
    /**
     * There is an array of message type names, like ['PublishMessage', 'SubscribeMessage'],
     * When channel need to serialize a message, search the array and get the index of the
     * type name, such as 0 for PublishMessage, 
     */
    /**
     * Deserialize the passed-in buffer to its corresponding message isntance
     *
     * @method deserialize
     * @param {Buffer} data the binary data to be deserialized
     * @param {Function} callback the callback function to be invoked when the
     *                            binary data is successfully deserialized,
     *                            or some error occurs. The signature of the
     *                            callback is 'function (error, message) {}'
     */
    MessageFactory.prototype.deserialize = function(data, callback) {
        callback(new C.errors.NotImplementedError('This serialize method is ' +
                                                  'not implemented in this ' +
                                                  'abstract base class, and' +
                                                  ' is expected to be ' +
                                                  'overwritten in child classes'));
    };
    
    /**
     * Create a publish message
     *
     * @method createPublishMessage
     * @param {String} topic the topic to be published to
     * @param {Boolean} ack if ack is required to confirm the publishing succeed
     * @param {Number} expire the lifespan of the published message in seconds
     * @param {Binary} data the binary data to be published
     * @return {PublishMessage} the publish message created
     */
    MessageFactory.prototype.createPublishMessage = function(topic, ack, expire, data) {
        return new this.types_[MessageFactory.messages.PUBLISH](
            topic, ack, expire, data
        );
    };
    
    /**
     * Return true if the passed-in message is a publish message
     *
     * @method isPublishMessage
     * @param {Message} message the message to be verified
     * @return {Boolean} true if the passed in message is a publish message
     */
    MessageFactory.prototype.isPublishMessage = function(message) {
        return message instanceof this.types_[MessageFactory.messages.PUBLISH];
    };
    
    /**
     * Create an ack message
     *
     * @method createAckMessage
     * @param {String} cursor the cursor for the next message
     * @return {AckMessage} the ack message created
     */
    MessageFactory.prototype.createAckMessage = function(cursor) {
        return new this.types_[MessageFactory.messages.ACK](cursor);
    };
    
    /**
     * Return true if the passed-in message is an ack message
     *
     * @method isAckMessage
     * @param {Message} message the message to be verified
     * @return {Boolean} true if the passed in message is an ack message
     */
    MessageFactory.prototype.isAckMessage = function(message) {
        return message instanceof this.types_[MessageFactory.messages.ACK];
    };
    
    /**
     * Create a subscribe message
     *
     * @method createSubscribeMessage
     * @param {String} topic the topic to be subscribed
     * @param {String} subscriber the subscriber identification which is used
     *                            to be mapped to a cursor maintained on the
     *                            server-side. By specifying a subscriber id,
     *                            the client is not required to pass the cursor
     *                            when subscribing for the message delivery.
     *                            More over, when replicating messages across
     *                            persia clusters, the persia replicator works
     *                            as a persia client to subscribe to the 
     *                            desired topics of the remote persia clusters.
     *                            In this scenario, subscriber id is useful in
     *                            hiding the different cursors in different
     *                            persia clusters for the same subscriber.
     * @param {String} cursor the cursor from where the messages are expected
     *                        to be delivered
     * @param {Boolean} ack whether ack is to be sent to the server to confirm
     *                      the reception
     * @param {Number} prefetch the message number to be prefetched before ack
     *                          is sent back
     * @return {SubscribeMessage} the subscribe message created
     */
    MessageFactory.prototype.createSubscribeMessage = function(topic, 
                                                               subscriber, 
                                                               cursor, ack, 
                                                               prefetch) {
        return new this.types_[MessageFactory.messages.SUBSCRIBE](topic, 
                                                                  subscriber, 
                                                                  cursor, ack, 
                                                                  prefetch);
    };
    
    /**
     * Return true if the passed-in message is a subscribe message
     *
     * @method isSubscribeMessage
     * @param {Message} message the message to be verified
     * @return {Boolean} true if the passed in message is a subscribe message
     */
    MessageFactory.prototype.isSubscribeMessage = function(message) {
        return message instanceof this.types_[MessageFactory.messages.SUBSCRIBE];
    };
    
    /**
     * Create an error message
     *
     * @method createErrorMessage
     * @param {Number} code the error code
     * @param {String} reason the reason causes this error
     * @return {ErrorMessage} the publish message created
     */
    MessageFactory.prototype.createErrorMessage = function(code, reason) {
        return new this.types_[MessageFactory.messages.ERROR](code, reason);
    };
    
    /**
     * Return true if the passed-in message is an error message
     *
     * @method isErrorMessage
     * @param {Message} message the message to be verified
     * @return {Boolean} true if the passed in message is an error message
     */
    MessageFactory.prototype.isErrorMessage = function(message) {
        return message instanceof this.types_[MessageFactory.messages.ERROR];
    };
    
    /**
     * Create a divert message
     *
     * @method createDivertMessage
     * @param {Object} endpoint the endpoint of the persia server the client 
     *                          is expected to connect
     * @return {DivertMessage} the divert message created
     */
    MessageFactory.prototype.createDivertMessage = function(endpoint) {
        return new this.types_[MessageFactory.messages.DIVERT](endpoint);
    };
    
    /**
     * Return true if the passed-in message is a divert message
     *
     * @method isDivertMessage
     * @param {Message} message the message to be verified
     * @return {Boolean} true if the passed in message is a divert message
     */
    MessageFactory.prototype.isDivertMessage = function(message) {
        return message instanceof this.types_[MessageFactory.messages.DIVERT];
    };
    
    /**
     * Create a data message
     *
     * @method createDataMessage
     * @param {String} cursor the cursor where the next data message can be 
     *                        located
     * @param {Binary} data the binary data to be published
     * @return {DataMessage} the data message created
     */
    MessageFactory.prototype.createDataMessage = function(cursor, data) {
        return new this.types_[MessageFactory.messages.DATA](cursor, data);
    };
    
    /**
     * Return true if the passed-in message is a data message
     *
     * @method isDataMessage
     * @param {Message} message the message to be verified
     * @return {Boolean} true if the passed in message is a data message
     */
    MessageFactory.prototype.isDataMessage = function(message) {
        return message instanceof this.types_[MessageFactory.messages.DATA];
    };
    
    
    C.namespace('persia.messages').MessageFactory = MessageFactory;

}, '0.0.1', { requires: ['persia-message', 'persia-publish-message', 
                         'persia-subscribe-message', 'persia-ack-message',
                         'persia-data-message','persia-divert-message'
                         ]});
