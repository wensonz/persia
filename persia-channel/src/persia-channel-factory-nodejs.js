/**
 * This module contains the abstract base class ChannelFactory, which is
 * designed to provide similar interfaces as those of TransportFactory, to
 * manage the channels and channel servers.
 *
 * @module persia-channel-factory-nodejs
 */
Condotti.add('persia-channel-factory-nodejs', function (C) {

    /**
     * The abstract base class ChannelFactory is designed to provide similar 
     * interfaces as the ones of TransportFactory so as to manage the creation
     * of the channels and channel servers. 
     *
     * @class ChannelFactory
     * @constructor
     * @param {TransportFactory} transportFactory the transport factory used to
     *                                            create transports and servers
     *                                            when necessary.
     * @param {MessageFactory} messageFactory the message factory used to create
     *                                        supported messages and verify the
     *                                        passed-in message type. Also the
     *                                        serialization/deserialization of
     *                                        messages are implemented in this
     *                                        factory
     */
    function ChannelFactory(transportFactory, messageFactory) {
        /**
         * The transport factory used to create transports and servers when
         * necessary.
         *
         * @property transportFactory_
         * @type TransportFactory
         * @default transportFactory
         */
        this.transportFactory_ = transportFactory;
        
        /**
         * The message factory instance
         *
         * @property messageFactory_
         * @type MessageFactory
         * @default messageFactory
         */
        this.messageFactory_ = messageFactory;
        
        /**
         * The logger instance
         *
         * @property logger_
         * @type Logger
         */
        this.logger_ = C.logging.getObjectLogger(this);
        
    }
    
    // C.lang.inherit(ChannelFactory, C.events.EventEmitter);
    
    /**
     * Create a client side channel
     *
     * @method createChannel
     * @param {Function} callback the callback funtion to be invoked when the 
     *                            channel is successfully created, or some
     *                            error occurs. Since the
     *                            channel layer is on top of the transport
     *                            layer, so the callback being triggered means
     *                            that the underlying transport has connected
     *                            to the server successfully. The signature of
     *                            the callback is 'function (error, channel) {}'
     */
    ChannelFactory.prototype.createChannel = function(callback) {
        var self = this;
        this.logger_.debug('Creating underlying client transport ...');
        this.transportFactory_.createTransport(function (error, transport) {
            if (error) {
                self.logger_.debug('Error: ' + C.lang.inspect(error));
                callback(error, null);
                return;
            }
            self.logger_.debug('Client transport ' + C.lang.inspect(transport) +
                               ' is successfully created.');
            callback(null, new C.persia.channels.Channel(transport, 
                                                         self.messageFactory_));
        });
    };
    
    /**
     * Create a channel server
     *
     * @method createChannelServer
     * @param {Function} callback the callback funtion to be invoked when the 
     *                            server is successfully created, or some
     *                            error occurs. Since the
     *                            channel layer is on top of the transport
     *                            layer, so the callback being triggered means
     *                            that the underlying transport server has be
     *                            successfully created. The signature of
     *                            the callback is 'function (error, server) {}'
     */
    ChannelFactory.prototype.createChannelServer = function(callback) {
        var self = this;
        this.logger_.debug('Creating underlying transport server ...');
        this.transportFactory_.createTransportServer(function (error, server) {
            if (error) {
                self.logger_.debug('Error: ' + C.lang.inspect(error));
                callback(error, null);
                return;
            }
            self.logger_.debug('Transport server ' + C.lang.inspect(server) +
                               ' is successfully created.');
            callback(null, 
                     new C.persia.channels.ChannelServer(
                         server, self.messageFactory_
                     ));
        });
    };
    
    C.namespace('persia.channels').ChannelFactory = ChannelFactory;

}, '0.0.1', { requires: ['condotti-events', 'persia-channel-nodejs', 
                         'persia-channel-server-nodejs', 
                         'persia-transport-factory']});