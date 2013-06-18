/**
 * This module contains the definition of the abstract base class Session which
 * is designed to represent a series of actions taken place between a client and
 * a server, such as subscription, publishing, etc.
 *
 * @module persia.sessions.base
 */
Condotti.add('persia.sessions.base', function (C) {
    
    /**
     * This Session class is the abstract base class of all concrete session
     * implementations, and is designed to represent a series of actions taken
     * place between a client and a server like publishing, subscribing, etc.
     *
     * @class Session
     * @constructor
     * @param {Channel} channel the underlying channel connects the client and
     *                          the server
     * @param {Object} message the initial message received
     */
    function Session (channel, message) {
        /* inheritance */
        this.super();
        
        /**
         * The underlying channel connects to the server
         * 
         * @property channel_
         * @type Channel
         */
        this.channel_ = channel;
        
        /**
         * The logger instance for this session
         *
         * @property logger_
         * @type Logger
         */
        this.logger_ = C.logging.getObjectLogger(this);
    }
    
    C.lang.inherit(Session, C.events.EventEmitter);
    
    /**
     * Start this session
     *
     * @method start
     * @param {Function} callback the callback function to be invoked when the
     *                            this session finishes, or some error occurs.
     *                            The signature of the callback function is
     *                            'function (error) {}'
     */
    Session.prototype.start = function (callback) {
        callback(new C.errors.NotImplementedError('This start method is not ' +
                                                  'implemented in this class,' +
                                                  ' and expected to be ' +
                                                  'overwritten in child ' +
                                                  'classes.'));
    };
    
    C.namespace('persia.sessions').Session = Session;
    
}, '0.0.1', { requires: [] });