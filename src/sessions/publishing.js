/**
 * This module contains the implementation of the PublishingSession
 *
 * @module persia.sessions.publishing
 */
Condotti.add('persia.sessions.publishing', function (C) {
    
    /**
     * This PublishingSession is a child class of the abstract base Session, and
     * is designed to represent the publihsing action from a client to the 
     * server. The data structure of the publishing message is defined as 
     * following:
     * {
     *     "topic": "xxx",
     *     "data": "xxxx"
     * }
     *
     * @class PublishingSession
     * @constructor
     * @extends Session
     * @param {Channel} channel the underlying channel from client to the server
     * @param {Object} message the initial publishing message received
     * @param {TopicFactory} factory the topic factory used to get the topic to
     *                               publish message to
     */
    function PublishingSession (channel, message, factory) {
        /* inheritance */
        this.super(channel, message);
        
        /**
         * The topic factory used to get the topic to publish message to
         * 
         * @property factory_
         * @type TopicFactory
         */
        this.factory_ = factory;
    }
    
    C.lang.inherit(PublishingSession, C.persia.sessions.Session);
    
    /**
     * Start this session
     *
     * @method start
     * @param {Function} callback the callback function to be invoked when the
     *                            this session finishes, or some error occurs.
     *                            The signature of the callback function is
     *                            'function (error) {}'
     */
    PublishingSession.prototype.start = function (callback) {
        var topic = null,
            self = this;
        
        this.logger_.debug('Publishing session starts with the message ' +
                           C.lang.reflect.inspect(this.message_));
                           
        topic = this.factory_.get(this.message_.topic);
        this.logger_.debug('A topic instance is retrieved from the topic ' +
                           'factory ' + C.lang.reflect.inspect(topic) + 
                           ' for the publishing on ' + this.message_.topic);
        
        topic.emit('message', { 
            type: 'data',
            data: this.message_.data
        });
        
        this.logger_.debug('Publishing on topic ' + this.message_.topic + 
                           ' succeed.');
        this.channel_.close(function (error) {
            self.channel_ = null; // close anyway
            callback();
        });
    };
    
    C.namespace('persia.sessions').PublishingSession = PublishingSession;
    
}, '0.0.1', { requires: ['persia.sessions.base'] });