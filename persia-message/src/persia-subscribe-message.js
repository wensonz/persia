/**
 * This module contains the abstract base class SubscribeMessage, which is
 * also the child class of Message, and is designed to represent the messages
 * used for the persia clients to ask a subscription from persia server.
 *
 * @module persia-subscribe-message
 */
Condotti.add('persia-subscribe-message', function (C) {

    /**
     * The SubscribeMessage class is designed to represent the messages used
     * by the persia clients to ask for continous message deliveries from the
     * persia server. This class is also an abstract base class, and contains
     * only the necessary information about the subscription. Its concrete
     * descendent classes are supposed to implement the serialization and
     * deserialization of the messages.
     *
     * @class SubscribeMessage
     * @constructor
     * @param {String} topic the topic to be subscribed
     * @param {String} cursor the cursor from where the messages are expected
     *                        to be delivered
	 * @param {String} subscirber the subscriber to identify cursor between diffrent
	 *                      subscriptions
     * @param {Boolean} ack whether ack is to be sent to the server to confirm
     *                      the reception
     * @param {Number} prefetch the message number to be prefetched before ack
     *                          is sent back
     */
    function SubscribeMessage(topic, subscriber, cursor, ack, prefetch) {
        /**
         * The topic to be subscribed
         *
         * @property topic
         * @type String
         * @default topic
         */
        this.topic = topic;
        /**
         * The cursor from where the messages are expected to be delivered
         *
         * @property cursor
         * @type String
         * @default cursor
         */
        this.cursor = cursor;
        /**
         * Whether ACK is to be sent to the server to confirm the reception
         *
         * @property ack
         * @type Boolean
         * @default ack
         */
        this.ack = ack;
        /**
         * The message number to be prefetched
         *
         * @property prefetch
         * @type Number
         * @default prefetch
         */
        this.prefetch = prefetch;
		
        /**
         * The subscriber ID
         *
         * @property subscriber
         * @type String
         * @default subscriber
         */
		this.subscriber = subscriber;
        
    }
    
    C.lang.inherit(SubscribeMessage, C.persia.messages.Message);
    
    C.namespace('persia.messages').SubscribeMessage = SubscribeMessage;

}, '0.0.1', { requires: ['persia-message']});