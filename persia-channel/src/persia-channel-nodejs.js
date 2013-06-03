/**
 * The node.js descendent of the abstract base class Channel
 *
 * @module persia-channel-nodejs
 */
Condotti.add('persia-channel-nodejs', function (C) {

    /**
     * The abstract node.js descendent of the abstract base class Channel
     *
     * @class Channel
     * @constructor
     * @param {Transport} transport the underlying transport
     * @param {MessageFactory} messageFactory the message factory used to
     *                                        identify message types and
     *                                        create messages based the
     *                                        received data from underlying
     *                                        transport.
     */
    function Channel(transport, messageFactory) {
        var self = this;
        
        /* inheritance */
        this.super();
        
        /**
         * the channel id
         *
         * @property id
         * @type String
         */
        this.id = 'channel@' + transport.id;
        
        /**
         * The underlying transport instance
         *
         * @property transport_
         * @type Transport
         * @default transport
         */
        this.transport_ = transport;
        /**
         * The logger instance
         *
         * @property logger_
         * @type Logger
         */
        this.logger_ = C.logging.getObjectLogger(this);
        
        /**
         * The message factory instance used to identify the message types, and
         * create messages based on the received data from the underlying
         * transport
         *
         * @property messageFactory_
         * @type MessageFactory
         * @default messageFactory
         */
        this.messageFactory_ = messageFactory;
        
        /* initialization */
        // TODO: add logging in the following callbacks
        this.transport_.on('data', C.lang.bind(this.onTransportData_, this));
        this.transport_.on('error', function (error) { self.emit('error', error); });
        this.transport_.on('drain', function () { self.emit('drain'); });
        this.transport_.on('end', function () { self.emit('end'); });
    }
    
    C.lang.inherit(Channel, C.events.EventEmitter);
    
    /**
     * Transport data event handler
     *
     * @method onTransportData_
     * @param {Buffer} data the data received from underlying transport
     */
    Channel.prototype.onTransportData_ = function(data) {
        var self = this;
        
        this.logger_.debug('Received ' + data.length + ' bytes data[' + 
                           data.toString('hex') + '] from underlying transport' +
                           C.lang.inspect(this.transport_));
        this.messageFactory_.deserialize(data, function (error, message) {
            if (error) {
                self.logger_.debug('Deserializing received data to message ' +
                                   'failed. Error: ' + C.lang.inspect(error));
                
                C.lang.nextTick(function () {
                    self.emit('error', error);
                });
                return;
            }
            
            self.logger_.debug('Received binary data is successfully ' +
                               'deserialized into message: ' +
                               C.lang.inspect(message));
                               
            C.lang.nextTick(function () {
                self.emit('message', message);
            });
        });
    };
    
    /**
     * Serialize the passed-in message, and send the serialized data to the 
     * underlying transport.
     *
     * @method write
     * @param {Message} message the binary packet to be sent to the channel
     * @param {Function} callback the callback function to be invoked when the
     *                            packet is sent successfully to the underlying
     *                            transport, or some error occurs. Like the
     *                            transport, callback is only triggered once 
     *                            the data is finally written to the wire,
     *                            but not cached in the underlying system.
     * @return {Boolean} false is returned if the underlying transport can not
     *                   process more data, otherwise true is returned.
     */
    Channel.prototype.write = function(message, callback) {
        var self = this;
        
        C.async.waterfall([
            function (next) {
                self.logger_.debug('Serializing message ' + 
                                   C.lang.inspect(message) + 
                                   ' before sending ...');
                self.messageFactory_.serialize(message, next);
            },
            function (data, next) {
                self.logger_.debug('Message is successfully serialized into ' +
                                   data.length + ' bytes binary data[' + 
                                   data.toString('hex') + ']');
                self.logger_.debug('writing the serialized data into ' +
                                   'underlying transport ' + 
                                   C.lang.inspect(self.transport_));
                                   
                self.transport_.write(data, next);
            }
        ], function (error, bytesWritten) {
            if (error) {
                self.logger_.debug('Error: ' + C.lang.inspect(error));
                callback(error);
                return;
            }
            self.logger_.debug('Writing serialized data succeed.' + 
                               bytesWritten + ' bytes written.');
            callback();
        });
    };
    
    /**
     * Close this channel
     *
     * @method close
     * @param {Function} callback the callback function to be invoked after the
     *                            channel is successfully closed, or some 
     *                            error occurs. The signature of the callback
     *                            is like 'function (error) {}' while error is
     *                            null/undefined if no error occurs.
     */
    Channel.prototype.close = function(callback) {
        var self = this;
        this.transport_.close(function (error) {
            if (error) {
                self.logger_.debug('Closing underlying transport failed. ' +
                                   'Error: ' + C.lang.inspect(error));
                callback(error);
                return;
            }
            
            self.logger_.debug('Closing underlying transport succeed.');
            callback();
        });
    };
    
    /**
     * The overwritten toString method
     *
     * @method toString
     * @return {String} the string representation of the channel
     */
    Channel.prototype.toString = function() {
        return this.id;
    };
    
    C.namespace('persia.channels').Channel = Channel;

}, '0.0.1', { requires: ['condotti-nodejs', 'condotti-events', 
                         'condotti-events-nodejs']});