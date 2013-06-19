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
         * The inbound pipeline handler collection
         * 
         * @property inbounds_
         * @type Array
         */
        this.inbounds_ = context.handlers;
        
        /**
         * The outbound pipeline handler collection
         * 
         * @property outbounds_
         * @type Array
         */
        this.outbounds_ = null;
        
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
        
        this.outbounds_ = this.inbounds_.slice(0);
        this.outbounds_.reverse();
        this.outbounds_.push(
            new C.persia.handlers.TransportHandler()
        );
        
        this.context_.inbounds = this.inbounds_;
        this.context_.outbounds = this.outbounds_;
        this.context_.pipeline = this;
        
        this.transport_.on('data', this.onTransportData_.bind(this));
        // this.transport_.on('error', this.onTransportError_.bind(this));
        // this.transport_.on('drain', this.onTransportDrain_.bind(this));
        // this.transport_.on('end', this.onTransportEnd_.bind(this)); ?
    };
    
    /**
     * Clone the context object
     *
     * @method cloneContext_
     * @return {Object} the cloned context object
     */
    Pipeline.prototype.cloneContext_ = function () {
        var context = {},
            key = null;
        
        for (key in this.context_) {
            context[key] = this.context_[key];
        }
        
        return context;
    };
    
    
    /**
     * The "data" event handler for the underlying transport
     *
     * @method onTransportData_
     * @param {Buffer} data the received data from the underlying transport
     */
    Pipeline.prototype.onTransportData_ = function (data) {
        var context = null;
            
        context = this.cloneContext_();
        this.handlers_[0].handleInbound(context, data);
    };
    
    /**
     * Write the message down to the underlying transport
     * 
     * @method write
     * @param {Object} data the data to be written down
     * @param {Function} callback the callback function to be invoked after the
     *                            message has been successfully written down to
     *                            the underlying transport, or some error
     *                            occurs. The signature of the callback is
     *                            'function (error) {}'
     */
    Pipeline.prototype.write = function (data, callback) {
        var self = this,
            context = null;
        
        context = this.cloneContext_();
        // context.callback = function ()
        
        C.async.reduce(this.outbounds_, data, function (reduced, handler, 
                                                        next) {
            logger.done(reduced);
            logger.start('Handling outbound data ' + 
                         C.lang.reflect.inspect(reduced) + ' with handler ' +
                         handler.name);
                         
            handler.handleOutbound(reduced, next);
            
        }, function (error) {
            if (error) {
                logger.error(error);
            } else {
                logger.done();
            }
            
            callback && callback(error);
        });
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