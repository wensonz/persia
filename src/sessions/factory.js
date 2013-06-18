/**
 * This module contains the implementation of the class SessionFactory which is
 * designed to create corresponding session on the received message
 *
 * @module persia.sessions.factory
 */
Condotti.add('persia.sessions.factory', function (C) {
    
    /**
     * This SessionFactory class is designed to create corresponding sessions
     * based on the initial message recieved from connected client
     *
     * @class SessionFactory
     * @constructor
     * @param {TopicFactory} topic the topic factory used by the sessions to be
     *                             created
     */
    function SessionFactory (topic) {
        /**
         * The topic factory used by the sessions to be created
         * 
         * @property topic_
         * @type TopicFactory
         */
        this.topic_ = topic;
        
        /**
         * The logger instance for this session factory
         *
         * @property logger_
         * @type Logger
         */
        this.logger_ = C.logging.getObjectLogger(this);
    }
    
    /**
     * Create the correct session corresponding to the passed in message
     *
     * @method createSession
     * @param {Channel} channel the channel from which the message is received
     * @param {Object} message the initial message for the session to be created
     * @return {Session} the new created session for the message
     */
    SessionFactory.prototype.createSession = function (channel, message) {
        switch (message.type) {
        case 'subscribe':
            return new C.persia.sessions.SubscriptionSession(channel, message, 
                                                             this.topic_);
            break;
        case 'publish':
            return new C.persia.sessions.PublishingSession(channel, message, 
                                                           this.topic_);
            break;
        default:
            throw new C.errors.NotImplementedError(
                'Message type ' + C.lang.reflect.inspect(message) + 
                ' has not been implemented.'
            );
            break;
        }
    };
    
    C.namespace('persia.sessions').SessionFactory = SessionFactory;
    
    
}, '0.0.1', { requires: ['persia.sessions.subscription', 'persia.sessions.publishing'] });