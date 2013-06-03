/**
 * This module contains the abstract base class AckMessage, which is
 * also the child class of Message, and is designed to represent the messages
 * used for both  persia clients and servers to acknowledgement received message
 * to the other side.
 *
 * @module persia-ack-message
 */
Condotti.add('persia-ack-message', function (C) {

    /**
     * The AckMessage class is designed to represent a acknowledgement
     *
     * @class AckMessage
     * @constructor
     * @param {String} cursor the cursor from where the messages are expected
     *                        to be delivered
     */
    function AckMessage(cursor) {
        /**
         * The cursor of message to be acked.
         *
         * @property cursor
         * @type String
         * @default cursor
         */
        this.cursor = cursor;

    }
    
    C.lang.inherit(AckMessage, C.persia.messages.Message);
    
    C.namespace('persia.messages').AckMessage = AckMessage;

}, '0.0.1', { requires: ['persia-message']});