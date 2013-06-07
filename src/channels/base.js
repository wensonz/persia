/**
 * This module defines the abstract base Channel of all concrete channel
 * implementations, and the basic behaviours a message channel is expected to
 * have.
 * 
 * @module persia.channels.base
 */
Condotti.add('persia.channels.base', function (C) {

    /**
     * This Channel class is the abstract base class for all descendent message
     * channels, and defines the basic behaviours a message channel is expected
     * to have.
     * 
     * @class Channel
     * @constructor
     * @extends EventEmitter
     * @param {Transport} transport the underlying transport for data
     *                              transportation
     */
    function Channel (transport) {
        /* inheritance */
        this.super();
        
        /**
         * The underlying transport for transfering the data serialized from the
         * messages.
         * 
         * @property transport_
         * @type Transport
         */
        this.transport_ = transport;
        
        /**
         * The logger instance for this channel
         * 
         * @property logger_
         * @type Logger
         */
        this.logger_ = C.logging.getObjectLogger(this);
    }
    
    C.lang.inherit(Channel, C.events.EventEmitter);
    
    /**
     * Write the message down to the underlying transport
     * 
     * @method write
     * @param {Message} message the message to be written down
     * @param {Function} callback the callback function to be invoked after the
     *                            message has been successfully written down to
     *                            the underlying transport, or some error
     *                            occurs. The signature of the callback is
     *                            'function (error) {}'
     */
    Channel.prototype.write = function (message, callback) {
        callback(new C.errors.NotImplementedError('This write method is not' +
                                                  ' implemented in this class' +
                                                  ', and expected to be ' +
                                                  'overwritten in the child ' +
                                                  'classes.'));
    };
    
    C.namespace('persia.channels').Channel = Channel;
    
}, '0.0.1', { requires: [] });