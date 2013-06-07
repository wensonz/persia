/**
 * This module contains the implementation of class FixedLengthFrameHandler,
 * which is a child of the abstract base Handler, and designed to be the 
 * encoder/decoder of the 32bit header of the frame, which indicates the length 
 * of the body of the frame in bytes.
 * 
 * @module persia.handlers.fixed-length-frame
 */
Condotti.add('persia.handlers.fixed-length-frame', function (C) {

    /**
     * This FixedLengthFrameHandler class is a child of the abstract base
     * Handler, and designed to be the encoder/decoder of the 32bit header of
     * the frame, which indicates the length of the body of the frame in bytes.
     *
     * @class FixedLengthFrameHandler
     * @constructor
     * @extends Handler
     */
    function FixedLengthFrameHandler () {
        /* inheritance */
        this.super();
        
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
    }
    
    C.lang.inherit(FixedLengthFrameHandler, C.persia.handlers.Handler);
    
    /**
     * Add the 32bit header to the passed-in data to construct a data frame.
     * 
     * @method handleOutbound
     * @param {Buffer} data the data buffer to be handled
     * @param {Function} callback the callback function to be invoked after the
     *                            passed-in data/message has been successfully
     *                            handled, or some error occurs. The signature
     *                            of the callback is 
     *                            'function (error, result) {}'
     */
    FixedLengthFrameHandler.prototype.handleOutbound = function (data, 
                                                                 callback) {
        var frame = new Buffer(4 + data.length);
        // TODO: verify if the data is a buffer
        frame.writeUInt32LE(data.length, 0);
        data.copy(frame, 4);
        callback(null, frame);
    };
    
    /**
     * Try to parse the length of the frame from the 32bit length header and
     * return the entire frame body through the callback function when full
     * frame has been received.
     * 
     * @method handleInbound
     * @param {Buffer} data the data to be handled
     * @param {Function} callback the callback function to be invoked after the
     *                            passed-in data/message has been successfully
     *                            handled, or some error occurs. The signature
     *                            of the callback is 
     *                            'function (error, result) {}'
     */
    FixedLengthFrameHandler.prototype.handleInbound = function (data, callback) {
        var left = data.length,
            start = 0,
            result = [];
        
        this.logger_.debug('Handling inbound ' + data.length + 
                           ' bytes of data ...');
        
        while (left > 0) {
            start = data.length - left;
            if (null === this.header_) { // body is on going
                left -= this.handleBody_(data, start);
                if (null !== this.header_) { // body is ready
                    result.push(this.body_);
                    this.body_ = null;
                }
            } else { // header is onging, which rarely happen
                left -= this.handleHeader_(data, start);
            }
        }
        
        if (result.length > 0) {
            callback(null, result.length > 1 ? result : result[0]);
        }
        
        // TODO: add logging here
        //       packet is not ready now
        // callback(); // silently ignored
    };
    
    /**
     * Unpack the packet body from the received data.
     * 
     * @method unpackBody_
     * @param {Buffer} data the received data
     * @param {Number} start the start position in the data buffer to unpack for
     *                       the body part
     */
    FixedLengthFrameHandler.prototype.handleBody_ = function (data, start) {
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
    FixedLengthFrameHandler.prototype.handleHeader_ = function (data, start) {
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
    
    

}, '0.0.1', { requires: ['persia.handlers.base'] });