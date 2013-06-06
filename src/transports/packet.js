/**
 * This module contains the implementation of the PacketTransport and 
 * PacketServerTransport, which are designed to pack the raw data with a length
 * header before writing to the underlying transport, and unpack the packed data
 * on receiving from the underlying transport.
 * 
 * @module persia.transports.packet
 */
Condotti.add('persia.transports.packet', function (C) {
    
    /**
     * This PacketTransport class is a child of the abstract base Transport, and
     * is designed to pack a 4 bytes length header to the data to be written 
     * onto the underlying transport, so that the receiver knows how long the
     * following data is expected to be.
     * 
     * @class PacketTransport
     * @constructor
     * @extends Transport
     * @param {Transport} transport the underlying transport that provides the
     *                              actual transportation functionalities.
     */
    function PacketTransport (transport) {
        /* inheritance */
        this.super();
        
        /**
         * The underlying transport which provides the actual transportation
         * functionalities.
         * 
         * @property transport_
         * @type Transport
         */
        this.transport_ = transport;
        
        /**
         * The header part of the packet
         *
         * @property header_
         * @type Buffer
         * @default new Buffer(4)
         */
        this.header_ = new Buffer(4);
        
        /**
         * The body part of the packet
         *
         * @property body_
         * @type Buffer
         * @default null
         */
        this.body_ = null;
        
        /**
         * The left number of bytes needed from the underlying transport
         * for the current packet to be complete.
         *
         * @property needed_
         * @type Number
         * @default 4
         */
        this.needed_ = 4;
        
        /* initialize */
        Object.defineProperty(this, 'writable', {
            get: function () { return this.transport_.writable; } 
        });
        
        this.bindTransportEvents_();
    }
    
    C.lang.inherit(PacketTransport, C.persia.transports.Transport);
    
    /**
     * Bind the event handlers for the underlying transport
     * 
     * @method bindTransportEvents_
     */
    PacketTransport.prototype.bindTransportEvents_ = function () {
        this.transport_.on('data', this.onTransportData_.bind(this));
        this.transport_.on('error', this.onTransportError_.bind(this));
        this.transport_.on('drain', this.onTransportDrain_.bind(this));
        this.transport_.on('end', this.onTransportEnd_.bind(this));
    };
    
    /**
     * Transport error event handler
     * 
     * @method onTransportError_
     * @param {Error} error the error occurs on the underlying transport
     */
    PacketTransport.prototype.onTransportError_ = function (error) {
        this.logger_.error('Underlying transport ' + 
                           C.lang.reflect.inspect(this.transport_) +
                           ' failed. Error: ' +
                           C.lang.reflect.inspect(error));
        this.emit('error', error);
    };
    
    /**
     * Transport drain event handler
     * 
     * @method onTransportDrain_
     */
    PacketTransport.prototype.onTransportDrain_ = function () {
        this.logger_.error('Underlying transport ' + 
                           C.lang.reflect.inspect(this.transport_) +
                           ' is writable now.');
        this.emit('drain');
    };
    
    /**
     * Transport end event handler
     * 
     * @method onTransportDrain_
     */
    PacketTransport.prototype.onTransportEnd_ = function () {
        this.logger_.error('Underlying transport ' + 
                           C.lang.reflect.inspect(this.transport_) +
                           ' is closed.');
        this.emit('end');
    };
    
    /**
     * Transport data event handler
     *
     * @method onTransportData_
     * @param {Buffer} data the data received from underlying transport
     */
    PacketTransport.prototype.onTransportData_ = function(data) {
        var self = this,
            logger = C.logging.getStepLogger(this.logger_);
            
        this.logger_.debug(data.length + ' bytes of data are received from ' +
                           'the underlying transport ' + 
                           C.lang.reflect.inspect(this.transport_));
        logger.start('Unpacking the received ' + data.length + ' bytes of data');               
        this.unpack_(data, function (error, body) {
            if (error) {
                // TODO: add logging here
                logger.error(error);
                self.emit('error', error);
                return;
            }
            
            logger.done();
            // TODO: log the buffer
            if (body) {
                self.logger_.debug('Unpacked body length ' + body.length + 
                                   ' bytes');
                self.emit('data', body);
            } else {
                self.logger_.debug('Received data is not enough for a ' +
                                   'complete packet.');
            }
        });
    };
    
    /**
     * Pack the serialized data and return a buffer can be sent over the
     * underlying transport
     *
     * @method pack_
     * @param {Buffer} body the serialized body to be packed
     * @param {Function} callback the callback function to be invoked when the
     *                            body is successfully framed, or some error
     *                            occurs. The signature of the callback is
     *                            'function (error, body) {}'.
     */
    PacketTransport.prototype.pack_ = function(body, callback) {
        var packet = new Buffer(4 + body.length);
        packet.writeUInt32LE(body.length, 0);
        body.copy(packet, 4);
        callback(null, packet);
    };
    
    /**
     * Unpack the received buffer and extract the embeded data
     *
     * @method unpack_
     * @param {Buffer} data the data received from the underlying transport, 
     *                      which may be partial of a complete packet.
     * @param {Function} callback the callback to be invoked when the passed-in
     *                            packet is successfully deframed, or some error
     *                            occurs. The signature of the callback is
     *                            'function (error, data) {}'
     */
    PacketTransport.prototype.unpack_ = function(data, callback) {
        var left = data.length,
            position = 0,
            self = this;
        
        this.logger_.debug('Unpacking ' + data.length + ' bytes of data ...');
        
        while (left > 0) {
            position = data.length - left;
            if (null === this.header_) { // body is onging
                left -= this.unpackBody_(data, position);
                if (null !== this.header_) {
                    C.lang.nextTick((function () {
                        var body = self.body_;
                        self.body_ = null;
                        return function () {
                            callback(null, body);
                        };
                    })());
                }
            } else { // header is onging, which rarely happen
                left -= this.unpackHeader_(data, position);
            }
        }
        // TODO: add logging here
        //       packet is not ready now
        callback();
    };
    
    // TODO: refactor the unpackHeader_ and unpackBody_ to reduce the "global"
    //       variables
    /**
     * Unpack the packet body from the received data.
     * 
     * @method unpackBody_
     * @param {Buffer} data the received data
     * @param {Number} start the start position in the data buffer to unpack for
     *                       the body part
     */
    PacketTransport.prototype.unpackBody_ = function (data, start) {
        var left = data.length - start;
        
        this.logger_.debug('Processing left ' + left + 
                           ' bytes of body data ...');
        if (left >= this.needed_) {
            this.logger_.debug('Left of the received data: ' + left + 
                               ' is more than body needed: ' + 
                               this.needed_);
            data.copy(this.body_, this.body_.length - this.needed_, 
                      start, start + this.needed_);
            this.logger_.debug('Current body is ready.');
            left -= this.needed_;
            this.logger_.debug('Recieved data has left ' + left + 
                               ' byte(s) for next header.');
            this.header_ = new Buffer(4);
            this.needed_ = 4;
            
            
        } else {
            this.logger_.debug('Left of the received data: ' + left + 
                               ' can not fulfill the body requirement: ' +
                               this.needed_);
            data.copy(this.body_, this.body_.length - this.needed_, 
                      start);
            this.needed_ -= left;
            this.logger_.debug('Current body still needs ' + 
                               this.needed_ + ' byte(s).');
            left = 0;
        }
        
        return data.length - start - left;
    };
    
    /**
     * Unpack the received data as packet header.
     * 
     * @method unpackHeader_
     * @param {Buffer} data the received data
     * @param {Number} start the start position in the data to unpack for the
     *                       header
     */
    PacketTransport.prototype.unpackHeader_ = function (data, start) {
        var left = data.length - start;
        
        this.logger_.debug('Unpacking header from ' + left + 
                           ' bytes of data ...');
                           
        if (left >= this.needed_) { // enough bytes received
            this.logger_.debug('Left of the received data: ' + left + 
                               ' is more than header needed: ' + 
                               this.needed_);
            data.copy(this.header_, this.header_.length - this.needed_, 
                      start, start + this.needed_);
            this.logger_.debug('Current header is ready.');
            left -= this.needed_;
            this.logger_.debug('Recieved data has left ' + left + 
                               ' byte(s) for current body.');
            this.needed_ = this.header_.readUInt32LE(0);
            this.body_ = new Buffer(this.needed_);
            this.header_ = null;
            this.logger_.debug('Current body needs ' + this.needed_ + 
                               ' byte(s)');
        } else {
            this.logger_.debug('Left of the received data: ' + left + 
                               ' can not fulfill the header\'s requirement: ' +
                               this.needed_);
            data.copy(this.header_, this.header_.length - this.needed_,
                      start);
            this.needed_ -= left;
            left = 0;
            this.logger_.debug('Current header still needs ' + 
                               this.needed_ + ' byte(s).');
        }
        
        return data.length - start - left;
    };
    
    /**
     * Write the data to this transport, with a simple size header inserted in
     * front of the data. The simple size header is so simple that it's a
     * LE 32bit unsigned integer.
     *
     * @method write
     * @param {Buffer} data the data to be sent over this transport
     * @param {Function} callback the callback function to be invoked when the
     *                            data has been successfully sent over this
     *                            transport, or some error occurs. The
     *                            signature of the callback function is
     *                            'function (error) {}'
     */
    PacketTransport.prototype.write = function(data, callback) {
        var self = this,
            logger = C.logging.getStepLogger(this.logger_);
        
        C.async.waterfall([
            function (next) {
                logger.start('Packing ' + data.length + ' bytes of data');
                self.pack_(data, next);
            },
            function (packet, next) {
                logger.done();
                
                logger.start('Writing down packed data of ' + packet.length +
                             ' onto the underlying transport ' +
                             C.lang.reflect.inspect(self.transport_));
                             
                self.transport_.write(packet, next);
            }
        ], function (error) {
            if (error) {
                logger.error(error);
                callback(error);
                return;
            }
            logger.done();
            callback();
        });
    };
    
    /**
     * Close this transport
     *
     * @method close
     * @param {Function} callback the callback function to be invoked after the
     *                            channel is successfully closed, or some 
     *                            error occurs. The signature of the callback
     *                            is like 'function (error) {}' while error is
     *                            null/undefined if no error occurs.
     */
    PacketTransport.prototype.close = function(callback) {
        var logger = C.logging.getStepLogger(this.logger_);
        
        logger.start('Closing the underlying transport ' + 
                     C.lang.reflect.inspect(this.transport_));
        this.transport_.close(function (error) {
            if (error) {
                logger.error(error);
            } else {
                logger.done();
            }
            
            callback(error);
        });
    };
    
    
    /**
     * Return the string representation of this transport
     * 
     * @method toString
     * @return {String} the string representation of this transport
     */
    PacketTransport.prototype.toString = function () {
        return 'packet@' + this.transport_.toString();
    };
    
    C.namespace('persia.transports.packet').PacketTransport = PacketTransport;
    
    
    /**
     * This class PacketServerTransport is the implementation of the abstract
     * base ServerTransport, and is the corresponding server implementation for
     * the PacketTransport.
     *
     * @class PacketServerTransport
     * @constructor
     * @param {ServerTransport} server the underlying server transport for the
     *                                 actual client acceptance, and data 
     *                                 transportation
     */
    function PacketServerTransport(server) {
        
        /* inheritance */
        this.super();
        
        /**
         * The underlying transport server instance
         *
         * @property server_
         * @type ServerTransport
         * @default server
         */
        this.server_ = server;
        
        /* initialization */
        this.server_.on('transport', this.onTransportConnected_.bind(this));
    }
    
    C.lang.inherit(PacketServerTransport, C.persia.transports.ServerTransport);
    
    
    /**
     * Start this server transport by calling the listen method of the 
     * underlying server transport.
     *
     * @method listen
     * @param {Function} callback the callback function to be invoked when
     *                            the server is started successfully, or
     *                            some error occurs. The signature of the
     *                            callback is 'function (error) {}'.
     */
    PacketServerTransport.prototype.listen = function(callback) {
        var logger = C.logging.getStepLogger(this.logger_);
        
        logger.start('Starting the underlying server transport ' +
                     C.lang.reflect.inspect(this.server_));
                     
        this.server_.listen(function (error) {
            if (error) {
                logger.error(error);
            } else {
                logger.done();
            }
            
            callback(error);
        });
    };
    
    
    /**
     * Close the transport server.
     *
     * @method close
     * @param {Function} callback the callback function to be invoked after the
     *                            server is closed successfully, or some error
     *                            occurs. The signature of the callback is 
     *                            'function (error) {}'.
     */
    PacketServerTransport.prototype.close = function(callback) {
        var logger = C.logging.getStepLogger(this.logger_);
        
        logger.start('Stopping the underlying server transport ' +
                     C.lang.reflect.inspect(this.server_));
        this.server_.close(function (error) {
            if (error) {
                logger.error(error);
            } else {
                logger.done();
            }
            
            callback(error);
        });
    };
    
    /**
     * 'transport' event handler for the underlying server
     *
     * @method onServerTransport_
     * @param {Transport} transport the new accepted client transport
     */
    PacketServerTransport.prototype.onTransportConnected_ = function(transport) {
        this.logger_.debug('New underlying client transport ' + 
                           C.lang.reflect.inspect(transport) + ' is accepted.');
        this.emit('transport', new PacketTransport(transport));
    };
    
    
    C.persia.transports.packet.PacketServerTransport = PacketServerTransport;
    
}, '0.0.1', { requires: ['persia.transports.base'] });