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
        
        /* initialize */
        this.initialize_();
    }
    
    C.lang.inherit(Channel, C.events.EventEmitter);
    
    /**
     * Initialize this channel by adding listeners to the events of the
     * underlying transport
     *
     * @method initialize_
     */
    Channel.prototype.initialize_ = function () {
        this.transport_.on('data', this.onTransportData_.bind(this));
        this.transport_.on('error', this.onTransportError_.bind(this));
        this.transport_.on('drain', this.onTransportDrain_.bind(this));
        this.transport_.on('end', this.onTransportEnd_.bind(this));
    };
    
    /**
     * The data handler of the internal transport
     *
     * @method onTransportData_
     * @param {Buffer} data the data received
     */
    Channel.prototype.onTransportData_ = function(data) {
        this.logger_.debug(data.length + ' bytes binary data [' + 
                           data.toString('hex') + '] is received from ' +
                           'underlying transport ' + 
                           C.lang.reflect.inspect(this.transport_));
                           
        this.emit('message', data);
    };
    
    /**
     * The drain handler of the internal transport
     *
     * @method onTransportDrain_
     */
    Channel.prototype.onTransportDrain_ = function() {
        this.logger_.debug('The underlying transport ' + 
                           C.lang.reflect.inspect(this.transport_) +
                           ' is now writable.');
        this.emit('drain');
    };
    
    /**
     * The end handler of the internal transport
     *
     * @method onTransportEnd_
     */
    Channel.prototype.onTransportEnd_ = function() {
        this.logger_.debug('The other end transport has been closed.');
        this.emit('end');
    };
    
    /**
     * The error handler of the internal transport
     *
     * @method onTransportError_
     * @param {Error} error the error occurs
     */
    Channel.prototype.onTransportError_ = function(error) {
        this.logger_.debug('The underlying transport ' + 
                           C.lang.reflect.inspect(this.transport_) +
                           ' fails. Error: ' + 
                           C.lang.reflect.inspect(error));
        
        this.emit('error', error);
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
    Channel.prototype.write = function (message, callback) {
        var logger = C.logging.getStepLogger(this.logger_);
            
        logger.start('Writing down the message ' + 
                     C.lang.reflect.inspect(message) + 
                     ' onto the underlying transport ' +
                     C.lang.reflect.inspect(this.transport_));
        this.transport_.write(message, function (error) {
            if (error) {
                logger.error(error);
            } else {
                logger.done();
            }
            
            callback(error);
        });
    };
    
    
    /**
     * Close this channel
     *
     * @method close
     * @param {Function} callback the callback function to be invoked after the
     *                            channel has been successfully closed, or some
     *                            error occurs. The signature of the callback is
     *                            'function (error) {}'
     */
    Channel.prototype.close = function (callback) {
        var logger = C.logging.getStepLogger(this.logger_);
        
        if (!callback) {
            callback = function () {};
        }
        
        logger.start('Closing the underlying transport ' + 
                     C.lang.reflect.inspect(this.transport_));
        this.transport_.close(function (error) {
            if (error) {
                logger.error(error);
            } else {
                logger.done();
            }
            
            callback(error);
        });
    };
    
    /**
     * Connect this channel to the specified server channel
     *
     * @method connect
     * @param {Function} callback the callback function to be invoked after the
     *                            channel has been successfully connected to the
     *                            specified server channel, or some error 
     *                            occurs. The signature of the callback is
     *                            'function (error) {}'  
     */
    Channel.prototype.connect = function (callback) {
        var logger = C.logging.getStepLogger(this.logger_);
        
        logger.start('Connecting the underlying transport ' + 
                     C.lang.reflect.inspect(this.transport_) + 
                     ' to its pre-specified server transport');
        this.transport_.connect(function (error) {
            if (error) {
                logger.error(error);
            } else {
                logger.done();
            }
            
            callback(error);
        });
    };
    
    /**
     * The overwritten toString
     *
     * @method toString
     * @param {}  
     * @return {String} the descriptive string of this channel
     */
    Channel.prototype.toString = function () {
        return 'channel@' + this.transport_.toString();
    };
    
    C.namespace('persia.channels').Channel = Channel;
    
    
    /**
     * This abstract base class ServerChannel is a channel wrapper of the
     * ServerTransport, which client side channels can connect to and talk with
     * 
     * @class ServerChannel
     * @constructor
     * @extends EventEmitter
     * @param {ServerTransport} server the underlying server transport for 
     *                                 client to connect
     */
    function ServerChannel (server) {
        /* inheritance */
        this.super();
        
        /**
         * The underlying server transport
         * 
         * @property server_
         * @type ServerTransport
         */
        this.server_ = server;
        
        /**
         * The logger instance for this server channel
         *
         * @property logger_
         * @type Logger
         */
        this.logger_ = C.logging.getObjectLogger(this);
        
        /* initialize */
        this.initialize_();
    }
    
    C.lang.inherit(ServerChannel, C.events.EventEmitter);
    
    /**
     * Initialize this server channel by binding the default handlers to the 
     * events of the underlying server transport
     *
     * @method initialize_
     */
    ServerChannel.prototype.initialize_ = function () {
        this.server_.on('transport', this.onTransportConnected_.bind(this));
    };
    
    /**
     * The "connected" event handler for the underlying server transport
     *
     * @method onTransportConnected_
     * @param {Transport} transport the connected client side transport
     */
    ServerChannel.prototype.onTransportConnected_ = function (transport) {
        this.logger_.debug('Client side transport ' + 
                           C.lang.reflect.inspect(transport) + ' connected.');
        this.emit('channel', new Channel(transport));
    };
    
    /**
     * Start this server channel via calling the listen method of the underlying
     * server channel
     *
     * @method listen
     * @param {Function} callback the callback function to be invoked after the
     *                            channel has been successfully closed, or some
     *                            error occurs. The signature of the callback is
     *                            'function (error) {}'
     */
    ServerChannel.prototype.listen = function (callback) {
        var self = this,
            logger = C.logging.getStepLogger(this.logger_);
            
        logger.start('Start the underlying server transport ' +
                     C.lang.reflect.inspect(this.server_) + 
                     ' via its "listen" method');
                     
        this.server_.listen(function (error) {
            if (error) {
                logger.error(error);
            } else {
                logger.done();
            }
            
            callback(error);
        });
    };
    
    
    /**
     * Close this server channel
     *
     * @method close
     * @param {Function} callback the callback function to be invoked after the
     *                            channel has been successfully closed, or some
     *                            error occurs. The signature of the callback is
     *                            'function (error) {}'
     */
    ServerChannel.prototype.close = function (callback) {
        var logger = C.logging.getStepLogger(this.logger_);
        
        if (!callback) {
            callback = function () {};
        }
        
        logger.start('Closing the underlying server transport ' +
                     C.lang.reflect.inspect(this.server_));
                     
        this.server_.close(function (error) {
            if (error) {
                logger.error(error);
            } else {
                logger.done();
            }
            
            callback(error);
        });
    };
    
    /**
     * Return the string description of this server channel
     *
     * @method toString
     * @return {String} the string description of this server channel
     */
    ServerChannel.prototype.toString = function () {
        return 'channel@' + this.server_.toString();
    };
    
    
    C.namespace('persia.channels').ServerChannel = ServerChannel;
    
}, '0.0.1', { requires: [] });