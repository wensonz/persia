/**
 * This module contains the implementation of the class Pipeline, which is the
 * JAVASCRIPT implementation of the interface ChannelPipeline of the framework
 * Netty in JAVA.
 *
 * @module persia.pipeline
 */
Condotti.add('persia.pipeline', function (C) {
    
    /**
     * This Pipeline class is the JAVASCRIPT implementation of the interface
     * ChannelPipeline of the framework Netty in JAVA
     *
     * @class Pipeline
     * @constructor
     * @extends EventEmitter
     * @param {Object} context the context object for this pipeline, which is
     *                         expected to contain all the necessary info for
     *                         the pipeline and its handlers to processing
     *                         the inbound/outbound data. There are at least
     *                         two items in this context, the transport and
     *                         the handlers with the key "transport" and
     *                         "handlers" separately.
     */
    function Pipeline (context) {
        /* inheritance */
        this.super();
        
        /**
         * The context object for this pipeline
         * 
         * @property context_
         * @type Object
         */
        this.context_ = context;
        
        /**
         * The underlying transport for the data transportation
         * 
         * @property transport_
         * @type Transport
         */
        this.transport_ = context.transport;
        
        /**
         * The pipeline handler collection
         * 
         * @property handlers_
         * @type Array
         */
        this.handlers_ = context.handlers;
        
        /**
         * The logger instance for this pipeline
         *
         * @property logger_
         * @type Logger
         */
        this.logger_ = C.logging.getObjectLogger(this);
        
        /**
         * Whether the pipeline is writable
         * 
         * @property writable
         * @type Boolean
         * @deafult false
         */
        Object.defineProperty(this, 'writable', {
            get: function () { return this.transport_.writable; }
        });
        
        /* initialize */
        this.initialize_();
    }
    
    C.lang.inherit(Pipeline, C.events.EventEmitter);
    
    /**
     * Initialize this pipeline
     *
     * @method initialize_
     */
    Pipeline.prototype.initialize_ = function () {
        var first = null;
        
        first = new C.persia.handlers.TransportHandler();
        this.handlers_.reduce(function (previous, current) {
            previous.next = current;
            current.prev = previous;
            return current;
        }, first);
        this.handlers_.unshift(first);
        this.context_.pipeline = this;
        
        this.transport_.on('data', this.onTransportData_.bind(this));
        // this.transport_.on('error', this.onTransportError_.bind(this));
        // this.transport_.on('drain', this.onTransportDrain_.bind(this));
        // this.transport_.on('end', this.onTransportEnd_.bind(this)); ?
    };
    
    /**
     * The "data" event handler for the underlying transport
     *
     * @method onTransportData_
     * @param {Buffer} data the received data from the underlying transport
     */
    Pipeline.prototype.onTransportData_ = function (data) {
        this.handlers_[0].handleInbound(this.context_, data);
    };
    
    /**
     * Write the message down to the underlying transport
     * 
     * @method write
     * @param {Object} data the data to be written down
     */
    Pipeline.prototype.write = function (data) {
        var handler = null;
        
        handler = this.handlers_[this.handlers_.length - 1];
        this.logger_.debug('Invoking the handler ' + handler.name + ' on data' +
                           C.lang.reflect.inspect(data));
        handler.handleOutbound(this.context_, data);
    };
    
    /**
     * The string description of this pipeline
     *
     * @method toString
     * @return {String} the string description of this pipeline 
     */
    Pipeline.prototype.toString = function () {
        return 'pipeline@' + this.transport_.toString();
    };
    
    C.namespace('persia').Pipeline = Pipeline;
    
}, '0.0.1', { requires: ['persia.handlers.transport'] });