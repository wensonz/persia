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
    }
    
    C.lang.inherit(Transport, C.events.EventEmitter);
    
    /**
     * Write data to the transport, and the passed-in callback is to be
     * triggered after the data is successfully written, or some error
     * occurs. Note that for most of the I/O systems, the data written
     * may be cached in the underneath components, for example, the kernel
     * socket buffer for the TCP socket, so the function returns false if
     * there is the underlying component, and the data can not be fully
     * written into it
     * 
     * @method write
     * @param {Buffer} data the data to be written to the transport. Type of the
     *                      data depends on the specific implementation, such as
     *                      it's Buffer for node.js version.
     * @param {Function} callback the callback function to be invoked after the
     *                            data has been successfully written to the
     *                            transport, or some error occurs. The signature
     *                            of the callback is like
     *                            'function (error, written) {}'.
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
    
    
}, '0.0.1', { requires: [] });