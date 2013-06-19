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
     * @param {Transport} transport the underlying transport for data
     *                              transportation
     * @param {Array} handlers an array of pipeline handlers
     */
    function Pipeline (transport, handlers) {
        /* inheritance */
        this.super();
        
        /**
         * The underlying transport for the data transportation
         * 
         * @property transport_
         * @type Transport
         */
        this.transport_ = transport;
        
        /**
         * The inbound pipeline handler collection
         * 
         * @property inbounds_
         * @type Array
         */
        this.inbounds_ = handlers;
        
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
            new C.persia.handlers.TransportHandler('transport', this.transport_)
        );
        
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
        var self = this,
            logger = C.logging.getStepLogger(this.logger_);
            
        //
        C.async.reduce(this.inbounds_, data, function (reduced, handler, next) {
            
            logger.done(reduced);
            logger.start('Handling the inbound data ' + 
                         C.lang.reflect.inspect(reduced) + ' with handler ' +
                         handler.name);
                         
            handler.handleInbound(reduced, next);
            
        }, function (error, result) {
            if (error) {
                logger.error(error);
                self.emit('error', error);
                return;
            }
            
            logger.done(result);
            self.emit('data', result);
        });
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
            logger = C.logging.getStepLogger(this.logger_);
        
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