/**
 * This module contains the abstract base class DataMessage, which is
 * also the child class of Message, and is designed to contain the message data
 * sent from server to client.
 *
 * @module persia-data-message-nodejs
 */
Condotti.add('persia-data-message', function (C) {

    /**
     * The DataMessage class is designed to represent the messages that contains
	 * data sent from server to client. This class is also an abstract base class, 
	 * and contains only the necessary information about the subscription. Its concrete
     * descendent classes are supposed to implement the serialization and
     * deserialization of the messages.
     *
     * @class DataMessage
     * @constructor
     * @param {String} cursor the cursor of the message
	 * @param {String} data holds real message data
     */
    function DataMessage(cursor, data) {
      
        /**
         * The cursor from where the messages are expected to be delivered
         *
         * @property cursor
         * @type String
         * @default cursor
         */
        this.cursor = cursor;

		
		/**
		 * Message data
		 *
		 * @property data
		 * @type String
		 */
		
		this.data = data;
		
		
    }
    
    C.lang.inherit(DataMessage, C.persia.messages.Message);
    
    C.namespace('persia.messages').DataMessage = DataMessage;

}, '0.0.1', { requires: ['persia-message']});
