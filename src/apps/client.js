/**
 * This module contains the implementation of the client application
 *
 * @module persia.apps.client
 */
Condotti.add('persia.apps.client', function (C) {
    
    /**
     * This ClientApp is the child class of the abstract base App and designed
     * to serve the message queue client functionalities.
     *
     * @class ClientApp
     * @constructor
     * @extends App
     * @param {Object} config the config object for this client app
     * @param {DottiFactory} factory the dotti factory used to initialize 
     *                               internal components
     */
    function ClientApp (config, factory) {
        /* inheritance */
        this.super(config, factory);
        
        /**
         * The internal transport
         * 
         * @property transport_
         * @type Transport
         * @deafult null
         */
        this.transport_ = null;
        
        /**
         * The pipeline handler collection
         * 
         * @property handlers_
         * @type Array
         * @deafult []
         */
        this.handlers_ = [];
        
        /**
         * The pipeline for the underlying transport
         * 
         * @property pipeline_
         * @type Pipeline
         * @deafult null
         */
        this.pipeline_ = null;
        
        /* initialize */
        this.initialize_();
    }
    
    C.lang.inherit(ClientApp, C.persia.apps.App);
    
    /**
     * Initialize this server application
     *
     * @method initialize_
     */
    ClientApp.prototype.initialize_ = function () {
        var self = this,
            factory = null;
        
        this.logger_.info('[ START ] Initializing the client application ...');
        
        this.logger_.debug('Loading the pipeline handlers ' + 
                           this.config_.handlers.toString() + ' ...');
        // TODO: error handling when handler not exist 
        this.handlers_ = this.config_.handlers.map(function (handler) {
            return self.factory_.get(handler);
        });
        
        this.logger_.debug('Creating the internal transport ...');
        factory = this.factory_.get('transport');
        this.transport_ = factory.createTransport();
        this.pipeline_ = new C.persia.Pipeline({
            factories: {
                dotti: this.factory_
            },
            transport: this.transport_,
            handlers: this.handlers_
        });
        
        this.logger_.debug('[ OK ] Client application is initialized.');
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
    ClientApp.prototype.run = function (callback) {
        var self = this,
            logger = C.logging.getStepLogger(this.logger_);
            
        this.transport_.once('connect', function () {
            logger.done();
            // sending subscription message
            self.pipeline_.write({
                type: 'SUBSCRIPTION',
                topic: self.config_.id
            });
        });
        
        this.transport_.once('error', function (error) {
            logger.error(error);
            callback(error);
        });
        // TODO: add 'close' handler to exit this process
        logger.start('Starting the underlying transport ' + this.transport_.id);
        this.transport_.connect();
    };
    
    C.namespace('persia.apps').ClientApp = ClientApp;
    
}, '0.0.1', { requires: ['persia.apps.base'] });