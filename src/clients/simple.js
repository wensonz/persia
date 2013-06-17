/**
 * This module contains the client implementation corresponding the server
 * implementation of SimpleServer
 *
 * @module persia.clients.simple
 */
Condotti.add('persia.clients.simple', function (C) {
    
    /**
     * This SimpleClient class is a child of its abstract base class Client, and
     * is designed to be the corresponsive implementation of the SimpleServer
     *
     * @class SimpleClient
     * @constructor
     * @extends Client
     * @param {Object} config the config object for this client
     */
    function SimpleClient (config) {
        /* inheritance */
        this.super(config);
        
        /**
         * The underlying client channel to connect to the server
         * 
         * @property channel_
         * @type Channel
         * @deafult null
         */
        this.channel_ = null;
        
        /**
         * The id of this client
         * 
         * @property id_
         * @type String
         */
        this.id_ = this.config_.id;
        
        /**
         * The dotti factory used to create the channel
         * 
         * @property factory_
         * @type DottiFactory
         * @deafult null
         */
        this.factory_ = null;
        
        /* initialize */
        this.initialize_();
    }
    
    C.lang.inherit(SimpleClient, C.persia.clients.Client);
    
    /**
     * Initialize this client
     *
     * @method initialize_
     */
    SimpleClient.prototype.initialize_ = function () {
        var self = this;
        
        this.logger_.info('Initializing the client components ...');
        this.factory_ = new C.di.DottiFactory(this.config_.dotti);
        this.channel_ = this.factory_.get('channel');
        this.channel_.once('message', function (message) {
            // auth response
            self.logger_.debug('Client ' + self.id_ + ' is authenticated.');
            self.channel_.on('message', self.onChannelMessage_.bind(self));
        });
        
        this.logger_.info('Client ' + this.id_ + ' is initialized.');
    };
    
    /**
     * The "message" event handler for the underlying channel
     *
     * @method onChannelMessage_
     * @param {Object} message the received message
     */
    SimpleClient.prototype.onChannelMessage_ = function (message) {
        // TODO: exec, stat and tee
        this.logger_.info('[MESSAGE] [SEQ: ' + message.seq + '] [SRC: ' + 
                          message.source + '] [TARGETS: ' + 
                          message.targets.join(', ') + '] [TYPE: ' + 
                          message.type + ']');
        this.logger_.debug('[DETAILS: ' + C.lang.reflect.inspect(message) + 
                           ']');
                           
        // TODO: add seq number
    };
    
    /**
     * Connect this client to its specified server
     *
     * @method connect
     * @param {Function} callback the callback function to be invoked after this
     *                            client has been successfully connected to the
     *                            server, or some error occurs. The signature of
     *                            the callback is 'function (error) {}'
     */
    SimpleClient.prototype.connect = function (callback) {
        this.channel_.connect(callback);
    };
    
    /**
     * Close this client
     *
     * @method close
     * @param {Function} callback the callback function to be invoked after this
     *                            client has been successfully closed, or some 
     *                            error occurs. The signature of the callback is
     *                            'function (error) {}'
     */
    SimpleClient.prototype.close = function (callback) {
        this.channel_.close(callback);
    };
    
    C.namespace('persia.clients').SimpleClient = SimpleClient;
    
}, '0.0.1', { requires: ['persia.clients.base'] });