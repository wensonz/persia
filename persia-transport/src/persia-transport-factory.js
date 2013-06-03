/**
 * This module defines the abstract base class TransportFactory, which is
 * designed to provide the management functionalities of the transport
 * related facilites.
 *
 * @module persia-transport-factory
 */
Condotti.add('persia-transport-factory', function (C) {

    /**
     * The abstract base class TransportFactory is designed to provide the
     * management functionalities of the tranport related facilities, such
     * as createTransport, createTransportServer, etc. However, even though
     * this class is to be plugged into the condotti instance, the descendants
     * of the factory, such as TcpTransportFactory, are gonna replace it when 
     * being attached, in order to provide the concrete functionalities.
     *
     * @class TransportFactory
     * @constructor
     */
    function TransportFactory() {
        /**
         * The logger instance
         *
         * @property logger_
         * @type Logger
         */
        this.logger_ = C.logging.getObjectLogger(this);
    }
    
    /**
     * Create a transport based on the configure obtained during initialization.
     * This method is not implemented in this base class, and is expected to be
     * overwritten in the child classes.
     *
     * @method createTransport
     * @param {Function} callback the callback function to be invoked after the
     *                            transport has connected with the other point
     *                            successfully, or some error occurs. The 
     *                            signature of the callback is like 
     *                            'function (error, transport) {}'.
     */
    TransportFactory.prototype.createTransport = function(callback) {
        callback(new C.errors.NotImplementedError('Method createTransport is' + 
                                                  ' not implmented in this ' +
                                                  'base class, and is ' +
                                                  'expected to be overwritten' +
                                                  ' in child classes'));
    };
    
    /**
     * Create a transport server based on the configure obtained during
     * initialization. Note that these two member functions may not be able to
     * be both available according to the configuration, for example, if the 
     * configuration object contains the information about the remote address
     * to be connected to, then the createTransportServer of the 
     * TcpTransportFactory would be not available.
     *
     * @method createTransportServer
     * @param {Function} callback the callback function to be invoked after the
     *                            server is created successfully, or some error
     *                            occurs. The signature of the callback is like
     *                            'function (error, server) {}'.
     */
    TransportFactory.prototype.createTransportServer = function(callback) {
        callback(new C.errors.NotImplementedError('Method ' +
                                                  'createTransportServer is ' +
                                                  'not implmented in this ' +
                                                  'base class, and is ' +
                                                  'expected to be overwritten' +
                                                  ' in child classes'));
    };
    
    C.namespace('persia.transports').TransportFactory = TransportFactory;

}, '0.0.1', { requires: [ 'condotti-lang', 'persia-transport', 'persia-transport-server' ] });