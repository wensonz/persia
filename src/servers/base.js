/**
 * This module contains the definition of the abstract base class Server which
 * is designed to define the basic behaviours a concrete server is expected to
 * have
 *
 * @module persia.servers.base
 */
Condotti.add('persia.servers.base', function (C) {
    
    /**
     * This Server class is the abstract base class of all concrete server
     * implementations and defines the basic behaviours a server is expected to
     * have
     *
     * @class Server
     * @constructor
     * @param {Object} config the config object for this server
     */
    function Server (config) {
        /**
         * The config object for this server
         *
         * @property config_
         * @type Object
         */
        this.config_ = config;
        
        /**
         * The logger instance for this server
         *
         * @property logger_
         * @type Logger
         */
        this.logger_ = C.logging.getObjectLogger(this);
    }
    
    /**
     * Start this server
     *
     * @method start
     * @param {Function} callback the callback function to be invoked after this
     *                            server has been successfully started, or some
     *                            error occurs. The signature of the callback is
     *                            'function (error) {}';
     */
    Server.prototype.start = function (callback) {
        callback(new C.errors.NotImplementedError('This start method is not ' +
                                                  'implemented in this class' +
                                                  ', and expected to be ' +
                                                  'overwritten in child ' +
                                                  'classes.'));
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
    Server.prototype.stop = function (callback) {
        callback(new C.errors.NotImplementedError('This stop method is not ' +
                                                  'implemented in this class' +
                                                  ', and expected to be ' +
                                                  'overwritten in child ' +
                                                  'classes.'));
    };
    
    C.namespace('persia.servers').Server = Server;
    
}, '0.0.1', { requires: [] });