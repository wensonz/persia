/**
 * This module contains the abstract base class Message, which is designed
 * to be the ancestor of all supported message types in the system. The
 * primary goal of the series message types is to hide the implementation
 * details about the message serialization and deserialization, and make
 * it easy to cross different programming languages when developping 
 * clients.
 *
 * @module persia-message
 */
Condotti.add('persia-message', function (C) {

    /**
     * This Message class is designed to be the ancestor of all supported
     * message types for the persia clients and servers to communicate with
     * each other. The primary goal of encapsulating the message into 
     * different classes is to hide the implementation details on how the 
     * messages are serialized and deserialized, so that to make it easy
     * to develop persia clients in different programming languages.
     *
     * @class Message
     * @constructor
     */
    function Message() {
        //
    }
    
    /**
     * Serialize the message to buffer
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
    Message.prototype.serialize = function(callback) {
        callback(new C.errors.NotImplementedError('This serialize method is ' +
                                                  'not implemented in this ' +
                                                  'abstract base class, and ' +
                                                  'is expected to be ' +
                                                  'overwritten in its child ' +
                                                  'classes.'));
    };
    
    /**
     * Deserialize buffer to message
     *
     * @method deserialize
     * @param {Binary} data the binary data to be deserialized
     * @param {Function} callback the callback function to be invoked when the
     *                            binary data is successfully deserialized into
     *                            the message instance itself, or some 
     *                            unexpected error occurs. The signature of the
     *                            callback function is 
     *                            'function (error, message) {}' while message
     *                            is the normally the same one invokes this 
     *                            call.
     */
    Message.prototype.deserialize = function(data, callback) {
        callback(new C.errors.NotImplementedError('This deserialize method ' +
                                                  'is not implemented in this' +
                                                  ' abstract base class, and ' +
                                                  'is expected to be ' +
                                                  'overwritten in its child ' +
                                                  'classes.'));
    };
    
    C.namespace('persia.messages').Message = Message;

}, '0.0.1', { requires: ['condotti-nodejs']});