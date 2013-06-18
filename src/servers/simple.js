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
         * The internal router for message routing
         * 
         * @property router_
         * @type Router
         * @deafult null
         */
        this.router_ = null;
        
        /**
         * The dotti factory used to create other instances
         * 
         * @property factory_
         * @type DottiFactory
         * @deafult null
         */
        this.factory_ = null;
        
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
        this.factory_ = new C.di.DottiFactory(this.config_.dotti);
        this.server_ = this.factory_.get('server');
        this.router_ = this.factory_.get('router');
        
        this.router_.on('message', function (message) {
            self.logger_.info(
                '[MESSAGE] ' +
                '[ID: ' + message.id + '] ' +
                '[SOURCE: ' + message.source + '] ' + 
                '[TARGETS: ' + message.targets.join(', ') + '] ' +
                '[TYPE: ' + message.type + ']'
            );
            self.logger_.debug('[DETAILS: ' + C.lang.reflect.inspect(message) + 
                               ']');
            self.router_.route(message);
        });
        
        this.logger_.info('Server initialized.');
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