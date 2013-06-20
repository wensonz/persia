/**
 * This module contains the simple implementation of the class Topic and 
 * TopicFactory
 *
 * @module persia.topic
 */
Condotti.add('persia.topic', function (C) {
    
    /**
     * This Topic class is a simple child of the EventEmitter
     *
     * @class Topic
     * @constructor
     * @extends EventEmitter
     * @param {String} name the name of this topic
     */
    function Topic (name) {
        /* inheritance */
        this.super();
        
        /**
         * The name of this topic
         * 
         * @property name
         * @type String
         */
        this.name = name;
    }
    
    C.lang.inherit(Topic, C.events.EventEmitter);
    
    C.namespace('persia.topic').Topic = Topic;
    
    /**
     * This TopicFactory is a simple implementation which simply return the
     * Topic instance with the specified name. If that topic does not exist,
     * this factory will create one and return it.
     *
     * @class TopicFactory
     * @constructor
     */
    function TopicFactory () {
        /**
         * The created topics
         * 
         * @property topics_
         * @type Object
         * @deafult {}
         */
        this.topics_ = {};
    }
    
    /**
     * Return the Topic instance with the specified name. If that topic does not
     * exist, this factory will create one and return it.
     *
     * @method get
     * @param {String} name the name of the topic to be returned
     * @return {Topic} the topic with the specified name
     */
    TopicFactory.prototype.get = function (name) {
        var topic = this.topics_[name];
        
        if (!topic) {
            topic = new Topic(name);
            this.topics_[name] = topic;
        }
        
        return topic;
    };
    
    C.namespace('persia.topic').TopicFactory = TopicFactory;
    
}, '0.0.1', { requires: [] });