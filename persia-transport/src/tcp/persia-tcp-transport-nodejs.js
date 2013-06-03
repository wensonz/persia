/**
 * This module contains the implementation of the TCP version of the Transport
 * class.
 *
 * @module persia-tcp-transport-nodejs
 */

Condotti.add('persia-tcp-transport-nodejs', function (C) {

    /**
     * The TcpTransport class is the TCP implementation of the abstract
     * base Transport based on the node.js socket.
     *
     * @class TcpTransport
     * @constructor
     * @param {Socket} socket the internal TCP socket for this transport
     */
    function TcpTransport(socket) {
        var local = null;
        
        /**
         * The internal TCP socket
         *
         * @property socket_
         * @type Socket
         * @default socket
         */
        this.socket_ = socket;
        
        /**
         * The logger instance
         *
         * @property logger_
         * @type Logger
         */
        this.logger_ = C.logging.getObjectLogger(this);
        
        /**
         * Whether the underlying socket is writable
         *
         * @property writable_
         * @type Boolean
         * @default true
         */
        this.writable_ = true;
        
        
        /* construct parent object */
        local = this.socket_.address();
        this.super('<' + local.address + ':' + local.port + ', ' + 
                   this.socket_.remoteAddress + ':' + this.socket_.remotePort +
                   '>');
        
        /* intialization */
        this.socket_.on('data', C.lang.bind(this.onSocketData_, this));
        this.socket_.on('drain', C.lang.bind(this.onSocketDrain_, this));
        this.socket_.on('end', C.lang.bind(this.onSocketEnd_, this));
        this.socket_.on('error', C.lang.bind(this.onSocketError_, this));
    }
    
    C.lang.inherit(TcpTransport, C.persia.transports.Transport);
    
    /**
     * The data handler of the internal socket
     *
     * @method onSocketData_
     * @param {Buffer} data the data received
     */
    TcpTransport.prototype.onSocketData_ = function(data) {
        this.logger_.debug(data.length + ' bytes binary data [' + 
                           data.toString('hex') + '] is received from ' +
                           'underlying socket');
        this.emit('data', data);
    };
    
    /**
     * The drain handler of the internal socket
     *
     * @method onSocketDrain_
     */
    TcpTransport.prototype.onSocketDrain_ = function() {
        this.logger_.debug('The underlying socket is now writable.');
        this.writable_ = true;
        this.emit('drain');
    };
    
    /**
     * The end handler of the internal socket
     *
     * @method onSocketEnd_
     */
    TcpTransport.prototype.onSocketEnd_ = function() {
        this.logger_.debug('The other end socket has been closed.');
        this.emit('end');
    };
    
    /**
     * The error handler of the internal socket
     *
     * @method onSocketError_
     * @param {Error} error the error occurs
     */
    TcpTransport.prototype.onSocketError_ = function(error) {
        this.logger_.debug('The underlying socket fails. Error: ' + 
                           C.lang.inspect(error));
        
        this.emit('error', error);
    };
    
    /**
     * Write the data buffer to the socket
     *
     * @method write
     * @param {Buffer} data the data buffer to be written
     * @param {Function} callback the callback function to be invoked after the
     *                            data has been successfully written.
     * @return {Boolean} the same return as the one of `net.Socket.write`
     */
    TcpTransport.prototype.write = function(data, callback) {
        var self = this;
        
        if (!this.writable_) {
            this.logger_.debug('Underlying socket ' + this.id + 
                               ' is not writable');
            callback(new C.errors.ShouldPauseError(this));
            return;
        }
        
        this.writable_ = this.socket_.write(data, function (error) {
            if (!error) {
                self.logger_.debug('Writing to underlying TCP socket succeed. ' +
                                   data.length + ' byte(s) are written.');
                callback(null, data.length);
            } else {
                self.logger_.debug('Writing to underlying TCP socket failed. ' +
                                   'Error: ' + C.lang.inspect(error));
                callback(error, 0);
            }
        });
    };
    
    /**
     * Close this socket
     *
     * @method close
     * @param {Function} callback the callback function to be invoked after the
     *                   socket is closed. However, since net.Socket does not
     *                   provide a hook or callback to notify the caller when
     *                   the socket is closed, the passed-in callback is
     *                   triggered once the `net.Socket.end` returns.
     */
    TcpTransport.prototype.close = function(callback) {
        this.socket_.end();
        callback && callback();
    };
    
    C.namespace('persia.transports.tcp').TcpTransport = TcpTransport;

}, '0.0.1', { requires: ['condotti-events', 'condotti-nodejs', 
                         'condotti-events-nodejs', 'persia-transport']});