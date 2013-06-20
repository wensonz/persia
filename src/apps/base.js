/**
 * This module contains the definition of the abstract base class App, which
 * represent an entry point of an application
 *
 * @module persia.apps.base
 */
Condotti.add('persia.apps.base', function (C) {
    
    /**
     * This App class is the abstract base class of all concrete application
     * and designed to define the basic behaviours an application is expected to
     * have.
     *
     * @class App
     * @constructor
     * @extends EventEmitter
     * @param {Object} config the config object for this application
     * @param {DottiFactory} factory the dotti factory used to initialize 
     *                               internal components
     */
    function App (config, factory) {
        /* inheritance */
        this.super();
        
        /**
         * The logger instance for this application
         *
         * @property logger_
         * @type Logger
         */
        this.logger_ = C.logging.getObjectLogger(this);
        
        /**
         * The config object for this application
         *
         * @property config_
         * @type Object
         */
        this.config_ = config;
        
        /**
         * The dotti factory used to initialize internal components
         * 
         * @property factory_
         * @type DottiFactory
         */
        this.factory_ = factory;
    }
    
    C.lang.inherit(App, C.events.EventEmitter);
    
    /**
     * Run this application
     *
     * @method run
     * @param {Function} callback the callback function to be invoked after the
     *                            application stop running with/without error.
     *                            The signature of the callback function is
     *                            'function (error) {}'
     */
    App.prototype.run = function (callback) {
        callback(new C.errors.NotImplementedError('This run method is not ' +
                                                  'implemented in this ' +
                                                  'class, and is expected to ' +
                                                  'be overwritten in child ' +
                                                  'classes.'));
    };
    
    C.namespace('persia.apps').App = App;
    
}, '0.0.1', { requires: [] });