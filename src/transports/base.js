/**
 * This module contains the definitions of the abstract base classes of
 * Transport, ServerTransport and TransportFactory.
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
     */
    function Transport () {
        /* inheritance */
        this.super();
        
        /**
         * Whether the transport is writable
         *
         * @property writable
         * @type Boolean
         * @default false
         */
        this.writable = false;
        
        /**
         * The logger instance
         *
         * @property logger_
         * @type Logger
         */
        this.logger_ = C.logging.getObjectLogger(this);
        
        /**
         * The id of this transport
         *
         * @property id
         * @type String
         */
        Object.defineProperty(this, 'id', { get: this.getId_ });
    }
    
    C.lang.inherit(Transport, C.events.EventEmitter);
    
    /**
     * Return the id of the transport
     * 
     * @method getId_
     * @return {String} the identifier of this transport
     */
    Transport.prototype.getId_ = function () {
        throw new C.errors.NotImplementedError('Method getId_ is not ' +
                                               'implemented in this class,' +
                                               ' and is expected to be ' +
                                               'overwritten in child ' +
                                               'classes');
    };
    
    /**
     * Connect this transport to the server according to the config specified
     * during construction.
     * 
     * @method connect
     */
    Transport.prototype.connect = function () {
        throw new C.errors.NotImplementedError('Method connect is not ' +
                                               'implemented in this class,' +
                                               ' and is expected to be ' +
                                               'overwritten in child ' +
                                               'classes');
    };
    
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
     *                            'function () {}'.
     */
    Transport.prototype.write = function (data, callback) {
        throw new C.errors.NotImplementedError('Method write is not ' +
                                               'implemented in this class,' +
                                               ' and is expected to be ' +
                                               'overwritten in child ' +
                                               'classes');
    };
    
    /**
     * Close this transport
     *
     * @method close
     */
    Transport.prototype.close = function() {
        throw new C.errors.NotImplementedError('Method closed is not ' +
                                               'implemented in this class,' +
                                               ' and is expected to be ' +
                                               'overwritten in child ' +
                                               'classes');
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
     * The abstract base class ServerTransport is designed to define the
     * behaviours that all transport servers are expected to have, such as
     * accepting the client transports, emitting events when client connects,
     * etc.
     *
     * @class ServerTransport
     * @constructor
     */
    function ServerTransport() {
        /* inheritance */
        this.super();
        
        /**
         * The logger instance
         *
         * @property logger_
         * @type Logger
         */
        this.logger_ = C.logging.getObjectLogger(this);
        
        /**
         * The id of this transport
         *
         * @property id
         * @type String
         */
        Object.defineProperty(this, 'id', { get: this.getId_ });
    }
    
    C.lang.inherit(ServerTransport, C.events.EventEmitter);
    
    /**
     * Return the id of the transport
     * 
     * @method getId_
     * @return {String} the identifier of this transport
     */
    ServerTransport.prototype.getId_ = function () {
        throw new C.errors.NotImplementedError('Method getId_ is not ' +
                                               'implemented in this class,' +
                                               ' and is expected to be ' +
                                               'overwritten in child ' +
                                               'classes');
    };
    
    /**
     * Bind the server transport to the desired endpoint and listen on.
     *
     * @method listen
     */
    ServerTransport.prototype.listen = function() {
        throw new C.errors.NotImplementedError('Method listen is not ' +
                                               'implemented in ' +
                                               'this class, '+
                                               'and is expected to' +
                                               ' be overwritten in' +
                                               ' child classes.');
    };


    /**
     * Close the server transport.
     *
     * @method close
     */
    ServerTransport.prototype.close = function() {
        throw new C.errors.NotImplementedError('Method stop is not ' +
                                                  'implemented in ' +
                                                  'this class, ' +
                                                  'and is expected to' +
                                                  ' be overwritten in' +
                                                  ' child classes');
    };
    
    /**
     * The overwritten toString
     *
     * @method toString
     * @return {String} the string representation of the transport server
     */
    ServerTransport.prototype.toString = function() {
        return this.id;
    };
    
    C.namespace('persia.transports').ServerTransport = ServerTransport;
    
    
    /**
     * This TransportFactory class is the abstract base of all concrete
     * transport factory implementations and is a similar definition as the
     * SocketFactory in JAVA
     *
     * @class TransportFactory
     * @constructor
     */
    function TransportFactory () {
        /**
         * The logger instance for this factory
         *
         * @property logger_
         * @type Logger
         */
        this.logger_ = C.logging.getObjectLogger(this);
    }
    
    /**
     * Create a client transport
     *
     * @method createTransport
     * @return {Transport} the new created client transport
     */
    TransportFactory.prototype.createTransport = function () {
        throw new C.errors.NotImplementedError('Method createTransport is not' +
                                               ' implemented in this class,' +
                                               ' and is expected to be ' +
                                               'overwritten in child ' +
                                               'classes');
    };
    
    /**
     * Create a server transport
     *
     * @method createServerTransport
     * @return {ServerTransport} the new created server transport
     */
    TransportFactory.prototype.createServerTransport = function () {
        throw new C.errors.NotImplementedError('Method createServerTransport ' +
                                               'is not implemented in this ' +
                                               'class, and is expected to be ' +
                                               'overwritten in child ' +
                                               'classes');
    };
    
    C.namespace('persia.transports').TransportFactory = TransportFactory;
    
}, '0.0.1', { requires: [] });