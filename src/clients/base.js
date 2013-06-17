/**
 * This module contains the definition of the abstract base class Client, which
 * is designed to be the parent of all concrete client implementations
 *
 * @module persia.clients.base
 */
Condotti.add('persia.clients.base', function (C) {
    
    /**
     * This Client class is the abstract base class of all the concrete client
     * implementations, and defines the basic behaviours a client is expected to
     * have
     *
     * @class Client
     * @constructor
     * @extends 
     * @param {Object} config the config for this client
     */
    function Client (config) {
        /**
         * The config object for this client
         *
         * @property config_
         * @type Object
         */
        this.config_ = config;
        
        /**
         * The logger instance for this client
         *
         * @property logger_
         * @type Logger
         */
        this.logger_ = C.logging.getObjectLogger(this);
    }
    
    /**
     * Connect this client to its specified server
     *
     * @method connect
     * @param {Function} callback the callback function to be invoked after this
     *                            client has been successfully connected to the
     *                            server, or some error occurs. The signature of
     *                            the callback is 'function (error) {}'
     */
    Client.prototype.connect = function (callback) {
        callback(new C.errors.NotImplementedError('This connect method is not' +
                                                  ' implemented in this class' +
                                                  ', and expected to be ' +
                                                  'overwritten in child ' +
                                                  'classes.'));
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
    Client.prototype.close = function (callback) {
        callback(new C.errors.NotImplementedError('This close method is not' +
                                                  ' implemented in this class' +
                                                  ', and expected to be ' +
                                                  'overwritten in child ' +
                                                  'classes.'));
    };
    
    C.namespace('persia.clients').Client = Client;
    
}, '0.0.1', { requires: [] });