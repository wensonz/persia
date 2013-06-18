/**
 * This module contains the implementation of the SimpleServer class, which is
 * a child of the abstract base Server and designed to serve as a simple router
 * via the help of the PassiveRouter
 *
 * @module persia.servers.simple
 */
Condotti.add('persia.servers.simple', function (C) {
    
    /**
     * This SimpleServer class is a concrete implementation of its abstract base
     * class Server, and designed to serve as a simple routing server via the
     * help of PassiveRouter, PipelineServerChannel and TcpServerTransport, etc.
     *
     * @class SimpleServer
     * @constructor
     * @extends Server
     * @param {Object} config the config for this server
     */
    function SimpleServer (config) {
        /* inheritance */
        this.super(config);
        
        /**
         * The underlying server channel
         * 
         * @property server_
         * @type ServerChannel
         * @deafult null
         */
        this.server_ = null;
        
        /**
         * The factory collection contains the dotti factory instance, session
         * factory instance and topic factory instance, etc.
         * 
         * @property factories_
         * @type Object
         * @deafult {}
         */
        this.factories_ = {};
        
        /* initialize */
        this.initialize_();
    }
    
    C.lang.inherit(SimpleServer, C.persia.servers.Server);
    
    
    /**
     * Initialize this server
     *
     * @method initialize_
     * @param {}  
     * @return {} 
     */
    SimpleServer.prototype.initialize_ = function () {
        var self = this;
        
        this.logger_.info('Initializing internal components ...');
        this.factories_.dotti = new C.di.DottiFactory(this.config_.dotti);
        
        this.factories_.topic = this.factories_.dotti.get('topic');
        this.factories_.session = this.factories_.dotti.get('session');
        
        this.server_ = this.factory_.get('server');
        this.server_.on('channel', this.onChannelConnected_.bind(this));
        
        this.logger_.info('Server initialized.');
    };
    
    /**
     * The "channel" event handler for the underlying server channel
     *
     * @method onChannelConnected_
     * @param {Channel} channel the client channel connected
     */
    SimpleServer.prototype.onChannelConnected_ = function (channel) {
        var self = this;
        
        channel.once('message', function (message) {
            var session = null;
            try {
                session = self.factories_.session.createSession(channel, 
                                                                message);
            } catch (e) {
                
                channel.close();
            }
            
            session.on('error', function (error) {
                channel.close();
            });
            session.on('end', function () {
                channel.close();
            });
            
            session.start(function (error) {
                if (error) {
                    channel.close();
                }
            });
        });
    };
    
    
    /**
     * Start this server
     *
     * @method start
     * @param {Function} callback the callback function to be invoked after this
     *                            server has been successfully started, or some
     *                            error occurs. The signature of the callback is
     *                            'function (error) {}';
     */
    SimpleServer.prototype.start = function (callback) {
        this.server_.listen(callback);
    };
    
    /**
     * Stop this server
     *
     * @method stop
     * @param {Function} callback the callback function to be invoked after this
     *                            server has been successfully started, or some
     *                            error occurs. The signature of the callback is
     *                            'function (error) {}';
     */
    SimpleServer.prototype.stop = function (callback) {
        this.server_.close(callback);
    };
    
    C.namespace('persia.servers').SimpleServer = SimpleServer;
    
}, '0.0.1', { requires: ['persia.servers.base'] });