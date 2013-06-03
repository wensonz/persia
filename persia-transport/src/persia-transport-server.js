/**
 * This module contains the abstract base class TransportServer, which defines
 * the behaviours all transport server should have, such as accepting the 
 * client transports, emitting events when client connects, etc.
 *
 * @module persia-transport-server
 */

Condotti.add('persia-transport-server', function (C) {

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
        this.super();
        /**
         * The id of this server
         *
         * @property id
         * @type String
         * @default id
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

}, '0.0.1', { requires: ['condotti-lang', 'condotti-events', 'persia-transport']});