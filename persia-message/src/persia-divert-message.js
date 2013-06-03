/**
 * This module contains the abstract base class DivertMessage, which is
 * also the child class of Message, and is designed to represent the messages
 * used for both  persia clients and servers to divertnowledgement received message
 * to the other side.
 *
 * @module persia-divert-message
 */
Condotti.add('persia-divert-message', function (C) {

    /**
     * The DivertMessage class is designed to represent a divertnowledgement
     *
     * @class DivertMessage
     * @constructor
     * @param {String} cursor the cursor from where the messages are expected
     *                        to be delivered
     */
    function DivertMessage(owner) {
        /**
         * The cursor of message to be diverted.
         *
         * @property cursor
         * @type String
         * @default cursor
         */
        this.owner = owner;

    }
    
    C.lang.inherit(DivertMessage, C.persia.messages.Message);
    
    C.namespace('persia.messages').DivertMessage = DivertMessage;

}, '0.0.1', { requires: ['persia-message']});