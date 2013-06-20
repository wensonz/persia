/**
 * This module contains the implementation of the server application
 *
 * @module persia.apps.server
 */
Condotti.add('persia.apps.server', function (C) {
    
    /**
     * This ServerApp is the child class of the abstract base App and designed
     * to serve the message queue server functionalities.
     *
     * @class ServerApp
     * @constructor
     * @extends App
     * @param {Object} config the config object for this server app
     * @param {DottiFactory} factory the dotti factory used to initialize 
     *                               internal components
     */
    function ServerApp (config, factory) {
        /* inheritance */
        this.super(config, factory);
        
        /**
         * The internal server transport
         * 
         * @property server_
         * @type ServerTransport
         * @deafult null
         */
        this.server_ = null;
        
        /**
         * The pipeline handler collection
         * 
         * @property handlers_
         * @type Array
         * @deafult []
         */
        this.handlers_ = [];
        
        /* initialize */
        this.initialize_();
    }
    
    C.lang.inherit(ServerApp, C.persia.apps.App);
    
    /**
     * Initialize this server application
     *
     * @method initialize_
     */
    ServerApp.prototype.initialize_ = function () {
        var self = this,
            factory = null;
        
        this.logger_.info('[ START ] Initializing the server application ...');
        
        this.logger_.debug('Loading the pipeline handlers ' + 
                           this.config_.handlers.toString() + ' ...');
        // TODO: error handling when handler not exist 
        this.handlers_ = this.config_.handlers.map(function (handler) {
            return self.factory_.get(handler);
        });
        
        this.logger_.debug('Creating the internal server ...');
        factory = this.factory_.get('transport');
        this.server_ = factory.createServerTransport();
        this.server_.on('transport', this.onTransportConnected_.bind(this));
        
        this.logger_.debug('[ OK ] Server application is initialized.');
    };
    
    /**
     * The "transport" event handler for the underlying server
     *
     * @method onTransportConnected_
     * @param {Transport} transport the new connected client transport
     */
    ServerApp.prototype.onTransportConnected_ = function (transport) {
        // create a pipeline for the transport
        var context = {
            factories: {
                dotti: this.factory_,
                topic: this.factory_.get('topic')
            },
            transport: transport,
            handlers: this.handlers_
        };
        
        new C.persia.Pipeline(context);
    };
    
    
    /**
     * Run this application
     *
     * @method run
     * @param {Function} callback the callback function to be invoked after the
     *                            application stop running with/without error.
     *                            The signature of the callback function is
     *                            'function (error) {}'
     */
    ServerApp.prototype.run = function (callback) {
        var self = this,
            logger = C.logging.getStepLogger(this.logger_);
        
        logger.start('Starting the underlying server transport ' + 
                     this.server_.id);
                     
        this.server_.once('listening', function () {
            logger.done();
        });
        
        this.server_.once('error', function (error) {
            logger.error(error);
            callback(error);
        });
        
        // TODO: add 'error' handler to exit this process
        this.server_.listen();
    };
    
    C.namespace('persia.apps').ServerApp = ServerApp;
    
}, '0.0.1', { requires: ['persia.apps.base'] });