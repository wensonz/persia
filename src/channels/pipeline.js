/**
 * This module contains the implementation of the pipeline channel.
 * 
 * @module persia.channels.pipeline
 */
Condotti.add('persia.channels.pipeline', function (C) {

    /**
     * This PipelineChannel is a child of the abstract base Channel, and is
     * designed to simulate the ChannelPipeline class of the famous java
     * framework - netty
     * 
     * @class PipelineChannel
     * @constructor
     * @extends Channel
     * @param {Transport} transport the underlying transport for data 
     *                              transfering
     * @param {Array} handlers the message handlers in the pipeline
     */
    function PipelineChannel (transport, handlers) {
        /* inheritance */
        this.super(transport);
        
        /**
         * The message handlers in the pipeline for message processing
         * 
         * @property handlers_
         * @type Array
         */
        this.handlers_ = handlers;
        
        /* initialize */
        if (!Array.isArray(handlers)) {
            // in case the handlers are passed in as function param separately
            // which mainly occurs when this channel is initialized by dotti
            // facotry
            this.handlers_ = Array.prototype.slice.call(arguments, 1);
        }
    }
    
    C.lang.inherit(PipelineChannel, C.persia.channels.Channel);
    
    /**
     * The data handler of the internal transport
     *
     * @method onTransportData_
     * @param {Buffer} data the data received
     */
    PipelineChannel.prototype.onTransportData_ = function(data) {
        var self = this,
            logger = C.logging.getStepLogger(this.logger_),
            first = true;
            
        this.logger_.debug(data.length + ' bytes binary data [' + 
                           data.toString('hex') + '] is received from ' +
                           'underlying transport ' + 
                           C.lang.reflect.inspect(this.transport_));
                           
        //
        C.async.reduce(this.handlers_, data, function (reduced, handler, next) {
            if (!first) {
                logger.done(reduced);
            }
            
            first = false;
            logger.start('Handling the inbound data ' + 
                         C.lang.reflect.inspect(reduced) + ' with handler of ' +
                         C.lang.reflect.getFunctionName(
                             C.lang.reflect.getObjectType(handler)
                         ));
            handler.handleInbound(reduced, next);
        }, function (error, result) {
            if (error) {
                logger.error(error);
                self.emit('error', error);
                return;
            }
            
            logger.done(result);
            self.emit('message', result);
        });
    };
    
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
    PipelineChannel.prototype.write = function (message, callback) {
        var self = this,
            logger = C.logging.getStepLogger(this.logger_),
            first = true;
        
        callback = callback || function () {};
        
        C.async.reduceRight(this.handlers_, message, function (reduced, handler, 
                                                               next) {
            if (!first) {
                logger.done(reduced);
            }
            
            first = false;
            logger.start('Handling outbound data ' + 
                         C.lang.reflect.inspect(reduced) + ' with handler of ' +
                         C.lang.reflect.getFunctionName(
                             C.lang.reflect.getObjectType(handler)
                         ));
                         
            handler.handleOutbound(reduced, next);
            
        }, function (error, result) {
            if (error) {
                logger.error(error);
                callback(error);
                return;
            }
            
            logger.done(result);
            logger.start('Writing processed data ' + 
                         C.lang.reflect.inspect(result) + 
                         ' onto underlying transport ' +
                         C.lang.reflect.inspect(self.transport_));
                         
            // write onto the wire
            self.transport_.write(result, function (error) {
                if (error) {
                    logger.error(error);
                } else {
                    logger.done();
                }
                callback(error);
            });
        });
    };
    
    /**
     * The string description of this pipeline channel
     *
     * @method toString
     * @param {}  
     * @return {String} the string description of this pipeline channel
     */
    PipelineChannel.prototype.toString = function () {
        return 'pipeline@' + this.transport_.toString();
    };
    
    C.namespace('persia.channels').PipelineChannel = PipelineChannel;
    
    /**
     * The pipeline version of server channel
     *
     * @class PipelineServerChannel
     * @constructor
     * @extends ServerChannel
     * @param {ServerTransport} server the underlying server transport for 
     *                                 client channels to connect
     */
    function PipelineServerChannel (server, handlers) {
        /* inheritance */
        this.super(server);
        
        /**
         * The pipeline handlers for initializing the client channels connected
         * 
         * @property handlers_
         * @type Array
         * @deafult 
         */
        this.handlers_ = handlers;
    }
    
    C.lang.inherit(PipelineServerChannel, C.persia.channels.ServerChannel);
    
    /**
     * The "connected" event handler for the underlying server transport
     *
     * @method onTransportConnected_
     * @param {Transport} transport the connected client side transport
     */
    PipelineServerChannel.prototype.onTransportConnected_ = function (transport) {
        this.logger_.debug('Client side transport ' + 
                           C.lang.reflect.inspect(transport) + ' connected.');
        this.emit('channel', new PipelineChannel(transport, this.handlers_));
    };
    
    /**
     * The string description of this server channel
     *
     * @method toString
     * @return {String} the string description of this server channel
     */
    PipelineServerChannel.prototype.toString = function () {
        return 'pipeline@' + this.server_.toString();
    };
    
    C.namespace('persia.channels').PipelineServerChannel = PipelineServerChannel;

}, '0.0.1', { requires: ['persia.channels.base'] });