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
        
        /**
         * Whether the underlying channel has been connected to the server
         * 
         * @property connected_
         * @type Boolean
         * @deafult false
         */
        this.connected_ = false;
        
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
        
        this.channel_.on('end', function () {
            self.logger_.error('Peer channel has been closed.');
            self.reconnect_();
        });
        
        this.channel_.on('error', function (error) {
            self.logger_.error('Error occurs on the underlying channel ' +
                               C.lang.reflect.inspect(self.channel_) + 
                               '. Detail: ' + C.lang.reflect.inspect(error));
            self.reconnect_();
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
        this.logger_.info(
            '[MESSAGE] ' +
            '[ID: ' + message.id + '] ' +
            '[SOURCE: ' + message.source + '] ' + 
            '[TARGETS: ' + message.targets.join(', ') + '] ' +
            '[TYPE: ' + message.type + ']'
        );
        this.logger_.debug('[DETAILS: ' + C.lang.reflect.inspect(message) + 
                           ']');
        
        if 
    };
    
    /**
     * Close the underlying channel and reconnect it to the server after 2 sec
     *
     * @method reconnect_
     */
    SimpleClient.prototype.reconnect_ = function () {
        this.close(setTimeout.bind(null, this.connect.bind(this), 2000));
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
        var self = this,
            logger = C.logging.getStepLogger(this.logger_);
        
        if (this.connected_) {
            this.logger_.debug('Client ' + this.id_ + 
                               ' already connects to the server');
            callback();
            return;
        }
        
        C.async.waterfall([
            function (next) { // start to connect
                logger.start('Connecting the underlying channel ' +
                             C.lang.reflect.inspect(self.channel_) + 
                             ' to its specified server');
                self.channel_.connect(next);
            },
            function (next) {
                logger.done();
                
                logger.start('Authenticating this client with id ' + self.id_);
                self.channel_.once('message', function (message) {
                    // auth response
                    self.logger_.info('Client ' + self.id_ + 
                                       ' is authenticated.');
                    self.channel_.on('message', 
                                     self.onChannelMessage_.bind(self));
                    next();
                });
                // TODO: timeout for the registration response
                self.channel_.write({
                    type: 'registration',
                    content: { id: self.id_ }
                });
            }
        ], function (error) {
            if (error) {
                logger.error(error);
                self.close(callback);
                return;
            }
            
            logger.done();
            self.connected_ = true;
            callback();
        });
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
        var self = this;
        
        this.channel_.removeAllListeners('message');
        this.channel_.close(function (error) {
            self.connected_ = false;
            // callback() ?
            callback(error);
        });
    };
    
    C.namespace('persia.clients').SimpleClient = SimpleClient;
    
}, '0.0.1', { requires: ['persia.clients.base'] });