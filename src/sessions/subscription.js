/**
 * This module contains the implementation of the client and server session for
 * subscription
 *
 * @module persia.sessions.subscription
 */
Condotti.add('persia.sessions.subscription', function (C) {
    
    /**
     * This SubscriptionSession is a child class of Session and is designed to
     * represent a client subscription. The data structure of the subscription
     * request is defined as following:
     * {
     *     "type": "subscription",
     *     "topic": "xxx"
     * }
     * 
     * @class SubscriptionSession
     * @constructor
     * @extends Session
     * @param {Channel} channel the underlying channel connects to the server
     * @param {Object} message the subscription message received
     * @param {TopicFactory} factory the topic factory used to get required 
     *                               topic
     */
    function SubscriptionSession (channel, message, factory) {
        /* inheritance */
        this.super(channel, message);
        
        /**
         * The topic factory used to get the desired topic
         * 
         * @property factory_
         * @type TopicFactory
         */
        this.factory_ = factory;
        
        /**
         * The "message" event handler for the desired topic, which is used to
         * be removed from the topic when the client channel disconnects
         * 
         * @property handler_
         * @type Function
         * @deafult null
         */
        this.handler_ = this.onTopicMessage_.bind(this);
    }
    
    C.lang.inherit(SubscriptionSession, C.persia.sessions.Session);
    
    /**
     * Start this subscription session
     *
     * @method start
     * @param {Function} callback the callback function to be invoked when the
     *                            this session finishes, or some error occurs.
     *                            The signature of the callback function is
     *                            'function (error) {}'
     */
    SubscriptionSession.prototype.start = function (callback) {
        var topic = null,
            self = this;
        
        this.logger_.debug('Subscription session starts with the message ' +
                           C.lang.reflect.inspect(this.message_));
                           
        topic = this.factory_.get(this.message_.topic);
        this.logger_.debug('A topic instance is retrieved from the topic ' +
                           'factory ' + C.lang.reflect.inspect(topic) + 
                           ' for the subscription on ' + this.message_.topic);
        
        topic.on('message', this.handler_);
        this.channel_.on('end', this.onChannelEnd_.bind(this));
        
        this.logger_.debug('Subscription on topic ' + this.message_.topic + 
                           ' succeed.');
                           
        callback && callback();
    };
    
    /**
     * The "end" event handler of the underlying channel
     *
     * @method onChannelEnd_
     */
    SubscriptionSession.prototype.onChannelEnd_ = function () {
        this.logger_.debug('The peer of channel ' + 
                           C.lang.reflect.inspect(this.channel_) +
                           ' closes the channel.');
        this.unsubscribe_();
    };
    
    
    /**
     * The "message" event handler for the desired topic
     *
     * @method onTopicMessage_
     * @param {Object} message the new message emitted from the desired topic
     */
    SubscriptionSession.prototype.onTopicMessage_ = function (message) {
        var self = this,
            topic = null;
        
        this.logger_.debug('New message ' + C.lang.reflect.inspect(message) +
                           ' for topic ' + this.message_.topic + ' arrived.');
                           
        this.channel_.write(message, function (error) {
            if (!error) {
                self.logger_.info('New message ' + 
                                  C.lang.reflect.inspect(message) +
                                  ' from topic ' + self.message_.topic + 
                                  ' is successfully delivered via channel ' +
                                  C.lang.reflect.inspect(self.channel_));
                return;
            }
            
            self.logger_.error('New message ' + 
                               C.lang.reflect.inspect(message) +
                               ' from topic ' + self.message_.topic +
                               ' failed to be delivered to channel ' + 
                               C.lang.reflect.inspect(self.channel_) +
                               '. Error: ' + 
                               C.lang.reflect.inspect(error));
            
            if (error instanceof C.persia.errors.ShouldPauseError) {
                return;
            }
            
            // Unsubscribe
            self.unsubscribe_(error);
        });
    };
    
    /**
     * Unsubscribe the topic due to the channel is closed or error occurs
     *
     * @method unsubscribe_
     * @param {Error} error the error occurs. If it's undefined/null, it means
     *                      the channel is closed by the peer
     */
    SubscriptionSession.prototype.unsubscribe_ = function (error) {
        var topic = null,
            self = this;
        
        topic = this.factory_.get(this.message_.topic);
        topic.removeListener('message', this.handler_);
        this.channel_.close(function () {
            self.logger_.debug('Underlying channel ' + 
                               C.lang.reflect.inspect(self.channel_) + 
                               ' is closed.');
            self.channel_ = null;
            // TODO: emit an customized one
            if (error) {
                self.emit('error', error);
            } else {
                self.emit('end');
            }
        });
    };
    
    
    C.namespace('persia.sessions').SubscriptionSession = SubscriptionSession;
    
}, '0.0.1', { requires: ['persia.sessions.base'] });