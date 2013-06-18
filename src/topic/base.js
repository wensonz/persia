/**
 * This module contains the implementation of class Topic
 *
 * @module persia.topics.base
 */
Condotti.add('persia.topics.base', function (C) {
    
    /**
     * This Topic class is simply a child of EventEmitter used to emit "message"
     * event when new data comes
     *
     * @class Topic
     * @constructor
     * @extends EventEmitter
     * @param {String} name the name of the topic
     */
    function Topic (name) {
        /* inheritance */
        this.super();
        
        /**
         * The name of this topic
         * 
         * @property name_
         * @type String
         */
        this.name_ = name;
    }
    
    C.lang.inherit(Topic, C.events.EventEmitter);
    
    C.namespace('persia.topics').Topic = Topic;
    
    /**
     * This TopicFactory class is designed to retrieve or create topic based on
     * the topic name
     *
     * @class TopicFactory
     * @constructor
     */
    function TopicFactory () {
        /**
         * The topics created
         * 
         * @property topics_
         * @type Object
         * @deafult {}
         */
        this.topics_ = {};
    }
    
    /**
     * Return the required topic with the specified name. If the topic does not
     * exist, it will create one and return it
     *
     * @method get
     * @param {String} name the name of the topic to retrieve
     * @return {Topic} the required topic
     */
    TopicFactory.prototype.get = function (name) {
        var topic = null;
        topic = this.topics_[name];
        if (!topic) {
            topic = new Topic(name);
            this.topics_[name] = topic;
        }
        
        return topic;
    };
    
    C.namespace('persia.topics').TopicFactory = TopicFactory;
    
}, '0.0.1', { requires: [] });