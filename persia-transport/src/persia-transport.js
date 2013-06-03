/**
 * This module contains the abstract base class Transport, which represents
 * the basic communication channel between the clients and servers.
 *
 * @module persia-transport
 */

Condotti.add('persia-transport', function (C) {

    /**
     * The abstract base class Transport defines the behaviours of the basic
     * communication channel between the clients and servers
     *
     * @class Transport
     * @constructor
     * @param {String} id the id of the transport
     */
    function Transport(id) {
        /* inheritance */
        this.super();
        
        /**
         * The id of the transport
         *
         * @property id
         * @type String
         * @default id
         */
        this.id = id;
        
    }
    
    C.lang.inherit(Transport, C.events.EventEmitter);
    
    /**
     * Write data to the transport, and the callback passed-in is to be 
     * triggered after the data is successfully written, or some error
     * occurs. Note that for most of the I/O systems, the data written
     * may be cached in the underneath components, for example, the kernel 
     * socket buffer for the TCP socket, so the function returns false if
     * there is the underlying component, and the data can not be fully
     * written into it. However, the `callback` function is to be triggered
     * if the data has been finally written out, or some error occurs.
     *
     * @method write
     * @param {Binary} data the data to be written to the transport. Type of the
     *                      data depends on the specific implementation, such as
     *                      it's Buffer for node.js version.
     * @param {Function} callback the callback function to be invoked after the
     *                            data has been successfully written to the
     *                            transport, or some error occurs. The signature
     *                            of the callback is like 
     *                            'function (error, written) {}', while the param
     *                            written indicates the number of bytes written.
     * @return {Boolean} false if the data can not be fully or partially written 
     *                   into the underlying component, otherwise true is returned
     */
    Transport.prototype.write = function(data, callback) {
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
     *                            is like 'function (error) {}' while error is
     *                            null/undefined if no error occurs.
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
        this.super();
        
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
    
    C.namespace('errors').ShouldPauseError = ShouldPauseError;

}, '0.0.1', { requires: ['condotti-lang', 'condotti-errors', 'condotti-events'] });