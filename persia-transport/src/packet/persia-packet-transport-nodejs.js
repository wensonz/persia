/**
 * This module contains a simple implementation of class PacketTransport, which
 * is obviously a child class of the Transport, while each time a binary packet
 * is to be sent via the write method, it will add a size header in front of 
 * the packet, to indicate the packet size.
 *
 * @module persia-packet-transport-nodejs
 */
Condotti.add('persia-packet-transport-nodejs', function (C) {

    /**
     * This simple PacketTransport class is designed to 
     *
     * @class PacketTransport
     * @constructor
     * @param {transport} transport the underlying transport for the packed
     *                              data to be sent
     */
    function PacketTransport(transport) {
        var self = this;
        
        /* inheritance */
        this.super('packet@' + transport.id);
        
        /**
         * The underlying transport for data transportation
         *
         * @property transport_
         * @type Transport
         * @default transport
         */
        this.transport_ = transport;
        
        /**
         * The logger instance
         *
         * @property logger_
         * @type Logger
         */
        this.logger_ = C.logging.getObjectLogger(this);
        
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
         * @property need_
         * @type Number
         * @default 4
         */
        this.need_ = 4;
        
        /* initialization */
        this.transport_.on('data', C.lang.bind(this.onTransportData_, this));
        this.transport_.on('error', function (error) { self.emit('error', error); });
        this.transport_.on('drain', function () { self.emit('drain'); });
        this.transport_.on('end', function () { self.emit('end'); });
    }
    
    C.lang.inherit(PacketTransport, C.persia.transports.Transport);
    
    /**
     * Transport data event handler
     *
     * @method onTransportData_
     * @param {Buffer} data the data received from underlying transport
     */
    PacketTransport.prototype.onTransportData_ = function(data) {
        var self = this;
        
        this.unpack_(data, function (error, body) {
            if (error) {
                // TODO: add logging here
                self.emit('error', error);
                return;
            }
            if (body) {
                self.emit('data', body);
            } else {
                self.logger_.debug('Received data is not enough for a ' +
                                   'complete packet.');
            }
            // TODO: add logging here
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
        
        while (left > 0) {
            position = data.length - left;
            if (null === this.header_) { // body is onging
                this.logger_.debug('Processing body data ...');
                if (left >= this.need_) {
                    this.logger_.debug('Left of the received data: ' + left + 
                                       ' is greater than body needed: ' + 
                                       this.need_);
                    data.copy(this.body_, this.body_.length - this.need_, 
                              position, position + this.need_);
                    this.logger_.debug('Current body is ready.');
                    left -= this.need_;
                    this.logger_.debug('Recieved data has left ' + left + 
                                       ' byte(s) for next header.');
                    this.header_ = new Buffer(4);
                    this.need_ = 4;
                    
                    C.lang.nextTick((function () {
                        var body = self.body_;
                        self.body_ = null;
                        return function () {
                            callback(null, body);
                        };
                    })());
                } else {
                    this.logger_.debug('Left of the received data: ' + left + 
                                       ' can not fulfill the body requirement: ' +
                                       this.need_);
                    data.copy(this.body_, this.body_.length - this.need_, 
                              position);
                    this.need_ -= left;
                    this.logger_.debug('Current body still needs ' + 
                                       this.need_ + ' byte(s).');
                    left = 0;
                }
            } else { // header is onging, which rarely happen
                this.logger_.debug('Processing header data ...');
                if (left >= this.need_) { // enough bytes received
                    this.logger_.debug('Left of the received data: ' + left + 
                                       ' is greater than header needed: ' + 
                                       this.need_);
                    data.copy(this.header_, this.header_.length - this.need_, 
                              position, position + this.need_);
                    this.logger_.debug('Current header is ready.');
                    left -= this.need_;
                    this.logger_.debug('Recieved data has left ' + left + 
                                       ' byte(s) for current body.');
                    this.need_ = this.header_.readUInt32LE(0);
                    this.body_ = new Buffer(this.need_);
                    this.header_ = null;
                    this.logger_.debug('Current body needs ' + this.need_ + 
                                       ' byte(s)');
                } else {
                    this.logger_.debug('Left of the received data: ' + left + 
                                       ' can not fulfill the header requirement: ' +
                                       this.need_);
                    data.copy(this.header_, this.header_.length - this.need_,
                              position);
                    this.need_ -= left;
                    left = 0;
                    this.logger_.debug('Current header still needs ' + 
                                       this.need_ + ' byte(s).');
                }
            }
        }
        // TODO: add logging here
        //       packet is not ready now
        callback();
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
     *                            'function (error, bytesWritten) {}'
     */
    PacketTransport.prototype.write = function(data, callback) {
        var self = this;
        
        C.async.waterfall([
            function (next) {
                self.pack_(data, next);
            },
            function (packet, next) {
                self.transport_.write(packet, next);
            }
        ], function (error, bytesWritten) {
            if (error) {
                self.logger_.debug('Writing data ' + C.lang.inspect(data) + 
                                   ' to the underlying transport ' + 
                                   self.transport_.toString() + ' failed. ' +
                                   'Error: ' + C.lang.inspect(error));
                callback(error);
                return;
            }
            self.logger_.debug('Writing data ' + C.lang.inspect(data) +
                               ' to the underlying transport ' +
                               self.transport_.toString() + ' succeed.');
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
        var self = this;
        this.transport_.close(function (error) {
            if (error) {
                self.logger_.debug('Closing underlying transport failed. ' +
                                   'Error: ' + C.lang.inspect(error));
                callback(error);
                return;
            }
            
            self.logger_.debug('Closing underlying transport succeed.');
            callback();
        });
    };
    
    C.namespace('persia.transports.packet').PacketTransport = PacketTransport;

}, '0.0.1', { requires: ['condotti-nodejs', 'persia-transport']});