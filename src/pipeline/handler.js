/**
 * This module contains the definition of the abstract base Handler, 
 * which is the simulation of the ChannelHandler of the JAVA framework Netty.
 * 
 * @module persia.pipeline.handler
 */
Condotti.add('persia.pipeline.handler', function (C) {

    /**
     * This Handler class is the abstract base of all handlers for the channel
     * messages. It's the simulation of the class ChannelHandler of the JAVA
     * framework Netty.
     * 
     * @class Handler
     * @constructor
     */
    function Handler() {
        /**
         * The logger instance for this handler
         * 
         * @property logger_
         * @type Logger
         */
        this.logger_ = C.logging.getObjectLogger(this);
    }
    
    /**
     * Handle the inbound data/message and invoke the specified callback
     * 
     * @method handleInbound
     * @param {Object|Buffer} data the data/message to be handled
     * @param {Function} callback the callback function to be invoked after the
     *                            passed-in data/message has been successfully
     *                            handled, or some error occurs. The signature
     *                            of the callback is 
     *                            'function (error, result) {}'
     */
    Handler.prototype.handleInbound = function (data, callback) {
        callback(new C.errors.NotImplementedError('This handleInbound method ' +
                                                  'is not' +
                                                  ' implemented in this class' +
                                                  ' and is expected to be ' +
                                                  'overwritten in the child ' +
                                                  'classes.'));
    };
    
    /**
     * Handle the outbound data/message and invoke the specified callback
     * 
     * @method handleOutbound
     * @param {Object|Buffer} data the data/message to be handled
     * @param {Function} callback the callback function to be invoked after the
     *                            passed-in data/message has been successfully
     *                            handled, or some error occurs. The signature
     *                            of the callback is 
     *                            'function (error, result) {}'
     */
    Handler.prototype.handleOutbound = function (data, callback) {
        callback(new C.errors.NotImplementedError('This handleOutbound method ' +
                                                  'is not' +
                                                  ' implemented in this class' +
                                                  ' and is expected to be ' +
                                                  'overwritten in the child ' +
                                                  'classes.'));
    };
    
    C.namespace('persia.pipeline').Handler = Handler;

}, '0.0.1', { requires: [] });