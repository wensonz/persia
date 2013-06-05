/**
 * This module contains the definitions of the abstract base classes of
 * Transport, TransportServer and TransportFactory.
 * 
 * @module persia.transports.base
 */
Condotti.add('persia.transports.base', function (C) {

    /**
     * This Transport class is the abstraction of the transport client, such as
     * a TCP client socket, or a client of a file-based tunnel, etc.
     * 
     * @class Transport
     * @constructor
     * @extends EventEmitter
     * @param {String} id the id of the transport
     */
    function Transport (id) {
        /* inheritance */
        this.super();
        
        /**
         * The id of this transport
         * 
         * @property id
         * @type String
         */
        this.id = id;
        
        /**
         * The logger instance
         *
         * @property logger_
         * @type Logger
         */
        this.logger_ = C.logging.getObjectLogger(this);
    }
    
    C.lang.inherit(Transport, C.events.EventEmitter);
    
    /**
     * Write data to the transport, and the passed-in callback is to be
     * triggered after the data is successfully written, or some error
     * occurs. Note that for most of the I/O systems, the data written
     * may be cached in the underneath components, for example, the kernel
     * socket buffer for the TCP socket, so the function returns false if
     * there is the underlying component, and the data can not be fully
     * written into it. When the callback is invoked without an error, it means
     * the data has been finally written out.
     * 
     * @method write
     * @param {Buffer} data the data to be written to the transport. Type of the
     *                      data depends on the specific implementation, such as
     *                      it's Buffer for node.js version.
     * @param {Function} callback the callback function to be invoked after the
     *                            data has been successfully written to the
     *                            transport, or some error occurs. The signature
     *                            of the callback is like
     *                            'function (error) {}'.
     * @return {Boolean} false if the data can not be fully or partially written
     *                   into the underlying component, otherwise true is 
     *                   returned
     */
    Transport.prototype.write = function (data, callback) {
        callback(new C.errors.NotImplementedError('Method write is not ' +
                                                  'implemented in this class,' +
                                                  ' and is expected to be ' +
                                                  'overwritten in child ' +
                                                  'classes'));
        return false;
    };
    
    /**
     * Close this transport
     *
     * @method close
     * @param {Function} callback the callback function to be invoked after the
     *                            transport is successfully closed, or some
     *                            error occurs. The signature of the callback
     *                            is like 'function (error) {}'.
     */
    Transport.prototype.close = function(callback) {
        callback(new C.errors.NotImplementedError('Method closed is not ' +
                                                  'implemented in this class,' +
                                                  ' and is expected to be ' +
                                                  'overwritten in child ' +
                                                  'classes'));

    };

    /**
     * The overwritten toString method
     *
     * @method toString
     * @return {String} the string representation of the transport
     */
    Transport.prototype.toString = function() {
        return this.id;
    };
    
    C.namespace('persia.transports').Transport = Transport;
    
    /**
     * The error thrown when the 'write' method is called but the transport is
     * not writable
     *
     * @class ShouldPauseError
     * @extends Error
     * @constructor
     * @param {Transport} transport the transport reports this error
     */
    function ShouldPauseError(transport) {
        /* inheritance */
        this.name = 'ShouldPauseError';
        
        this.message = 'Transport ' + transport.id + ' is not wriable now, ' +
                       'please wait until the event \'drain\' emitted.';
        /**
         * The transport reports this error
         *
         * @property transport
         * @type Transport
         * @default transport
         */
        this.transport = transport;
    }

    C.lang.inherit(ShouldPauseError, Error);

    C.namespace('persia.errors').ShouldPauseError = ShouldPauseError;
    
    /**
     * The abstract base class TransportServer is designed to define the
     * behaviours that all transport servers are expected to have, such as
     * accepting the client transports, emitting events when client connects,
     * etc.
     *
     * @class TransportServer
     * @constructor
     * @param {String} id the id of this server
     */
    function TransportServer(id) {
        /* inheritance */
        this.super();
        
        /**
         * The id of this server
         *
         * @property id
         * @type String
         */
        this.id = id;
        
        /**
         * The logger instance
         *
         * @property logger_
         * @type Logger
         */
        this.logger_ = C.logging.getObjectLogger(this);
    }
    
    C.lang.inherit(TransportServer, C.events.EventEmitter);

    /**
     * Start the transport server.
     *
     * @method start
     * @param {Function} callback the callback function to be invoked when
     *                            the server is started successfully, or
     *                            some error occurs. The signature of the
     *                            callback is 'function (error) {}'.
     */
    TransportServer.prototype.start = function(callback) {
        callback(new C.errors.NotImplementedError('Method start is not ' +
                                                  'implemented in ' +
                                                  'TransportServer, '+
                                                  'and is expected to' +
                                                  ' be overwritten in' +
                                                  ' child classes.'));
    };


    /**
     * Stop the transport server.
     *
     * @method stop
     * @param {Function} callback the callback function to be invoked after the
     *                            server is closed successfully, or some error
     *                            occurs. The signature of the callback is
     *                            'function (error) {}'.
     */
    TransportServer.prototype.stop = function(callback) {
        callback(new C.errors.NotImplementedError('Method stop is not ' +
                                                  'implemented in ' +
                                                  'TransportServer, ' +
                                                  'and is expected to' +
                                                  ' be overwritten in' +
                                                  ' child classes'));
    };
    
    /**
     * The overwritten toString
     *
     * @method toString
     * @return {String} the string representation of the transport server
     */
    TransportServer.prototype.toString = function() {
        return this.id;
    };
    
    C.namespace('persia.transports').TransportServer = TransportServer;
    
    
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
    
    
}, '0.0.1', { requires: [] });