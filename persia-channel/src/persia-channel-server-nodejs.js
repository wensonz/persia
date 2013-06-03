/**
 * This module contains the abstract base class ChannelServer which is like the
 * TransportServer except working with channel.
 *
 * @module persia-channel-server-nodejs
 */
Condotti.add('persia-channel-server-nodejs', function (C) {

    /**
     * The abstract base class ChannelServer is much more like the underlying
     * TransportServer, but it works with channels instead of transports.
     *
     * @class ChannelServer
     * @constructor
     * @param {TransportServer} transportServer the underlying transport server
     *                                          to be used when dealing with
     *                                          transports
     * @param {MessageFactory} messageFactory the message factory used to create
     *                                        supported messages and verify the
     *                                        passed-in message type. Also the
     *                                        message serialization and
     *                                        deserialization are provided via
     *                                        this instance
     */
    function ChannelServer(transportServer, messageFactory) {
        /* inheritance */
        this.super();
        
        /**
         * The underlying transport server to be used when dealing with
         * transport
         *
         * @property transportServer_
         * @type TransportServer
         * @default transportServer
         */
        this.transportServer_ = transportServer;
        
        /**
         * The message factory instance
         *
         * @property messageFactory_
         * @type MessageFactory
         * @default messageFactory
         */
        this.messageFactory_ = messageFactory;
        
        /**
         * The id of the server
         *
         * @property id
         * @type String
         */
        this.id = 'channel@' + transportServer.id;
        
        /**
         * The logger instance
         *
         * @property logger_
         * @type Logger
         */
        this.logger_ = C.logging.getObjectLogger(this);
        
        /* initialize */
        this.transportServer_.on('transport', 
                                 C.lang.bind(this.onServerTransport_, this));
    }
    
    C.lang.inherit(ChannelServer, C.events.EventEmitter);
    
    /**
     * 'transport' event handler for the underlying server
     *
     * @method onServerTransport_
     * @param {Transport} transport the new accepted client transport
     */
    ChannelServer.prototype.onServerTransport_ = function(transport) {
        this.logger_.debug('New underlying client transport ' + transport.id + 
                           ' is accepted.');
        this.emit('channel', 
                  new C.persia.channels.Channel(transport, this.messageFactory_));
    };
    
    /**
     * Start this channel server
     *
     * @method start
     * @param {Function} callback the callback function to be invoked when the
     *                            server is started successfully, or some error
     *                            occurs. The signature of this callback is
     *                            'function (error) {}'.
     */
    ChannelServer.prototype.start = function(callback) {
        var self = this;
        this.logger_.debug('Starting underlying transport server ' +
                           this.transportServer_.id + ' ...');
        this.transportServer_.start(function (error) {
            if (error) {
                self.logger_.debug('Error: ' + C.lang.inspect(error));
                callback(error);
                return;
            }
            self.logger_.debug('The underlying transport server is running');
            callback();
        });
    };
    
    /**
     * Stop the channel server.
     *
     * @method stop
     * @param {Function} callback the callback function to be invoked after the
     *                            server is closed successfully, or some error
     *                            occurs. The signature of the callback is 
     *                            'function (error) {}'.
     */
    ChannelServer.prototype.stop = function(callback) {
        var self = this;
        this.logger_.debug('Stopping underlying transport server ' +
                           this.transportServer_.id + ' ...');
        this.transportServer_.start(function (error) {
            if (error) {
                self.logger_.debug('Error: ' + C.lang.inspect(error));
                callback(error);
                return;
            }
            self.logger_.debug('The underlying transport server is stopped');
            callback();
        });
    };
    
    /**
     * The overwritten toString method
     *
     * @method toString
     * @return {String} the string representation of the channel server
     */
    ChannelServer.prototype.toString = function() {
        return this.id;
    };
    
    
    
    C.namespace('persia.channels').ChannelServer = ChannelServer;

}, '0.0.1', { requires: ['condotti-lang', 'condotti-errors', 'condotti-events', 
                         'persia-transport-server', 'persia-channel-nodejs']});