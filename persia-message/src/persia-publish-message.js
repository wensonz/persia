/**
 * This module contains the abstract base class PublishMessage, which represents
 * the client request to publish a message to a persia topic.
 *
 * @module persia-publish-message
 */
Condotti.add('persia-publish-message', function (C) {

    /**
     * This PublishMessage class is designed to contain the required information
     * for a persia client to publish a message to a persia topic. However, this
     * class does not implement the serialize/deserialize methods inherited from
     * its parent class Message, and these two are supposed to be implemented in
     * the child classes, such as JsonPublishMessage, etc.
     *
     * @class PublishMessage
     * @constructor
     * @param {String} topic the topic to be published to
     * @param {Boolean} ack if ack is required to confirm the publishing succeed
     * @param {Number} expire the lifespan of the published message in seconds
     * @param {Binary} data the binary data to be published
     */
    function PublishMessage(topic, ack, expire, data) {
        /**
         * The topic name to be published to
         *
         * @property topic
         * @type String
         * @default topic
         */
        this.topic = topic;
        
        /**
         * Whether ACK is required to confirm the successful publishing
         *
         * @property ack
         * @type Boolean
         * @default ack
         */
        this.ack = ack;
        
        /**
         * The lifespan of the published message in seconds
         *
         * @property expire
         * @type Number
         * @default expire
         */
        this.expire = expire;
        
        /**
         * The binary data to be published into the topic
         *
         * @property data
         * @type Binary
         * @default data
         */
        this.data = data;
    }
    
    C.lang.inherit(PublishMessage, C.persia.messages.Message);
    
    
    C.namespace('persia.messages').PublishMessage = PublishMessage;

}, '0.0.1', { requires: ['persia-message']});