/**
 * This module contains the descendent implementation of the class 
 * MessageFactory, which is designed to use the index of the message
 * type in a configuration array as the id of the type during
 * serialization and deserialization.
 *
 * @module persia-indexed-message-factory
 */
Condotti.add('persia-indexed-message-factory', function (C) {

    /**
     * This IndexedMessageFactory class is an descendent implementation
     * of the abstract base MessageFactory. It's designed to use a number
     * index as the id of the type during serialization and deserialization.
     * The index comes from a configuration array of the factory, the element
     * of which leads to a concrete message type under the Condotti instance C.
     *
     * @class IndexedMessageFactory
     * @constructor
     * @param {Array} config the config array for this factory
     */
    function IndexedMessageFactory(config) {
        var self = this;
        
        /* inheritance */
        this.super();
        
        /**
         * The config array
         *
         * @property config_
         * @type Array
         * @default config
         */
        this.config_ = config;
        
        /**
         * The supported message types, which is an array of the
         * message constructors, which is used to indicate the message type when 
         * serializing and deserializing messages, to the corresponding 
         * message constructors. In order to make the query from message object
         * to its type id easy and efficient, the id of a message type is added
         * to its constructor as a property with name '__index__'.
         *
         * @property indexes_
         * @type Array
         * @default []
         */
        this.indexes_ = [];
        
        /* initialize */
        C.lang.forEach(this.config_, function (index, item) {
            var type = C.namespace(item.path); // item is supposed to consist of
                                               // two members, id: the contant id
                                               // for the message type, and the
                                               // path for the concrete constructor
            
            if (C.lang.isPlainObject(type)) { // the message type does not exist
                self.logger_.debug('The configured message type ' + path + 
                                   ' does not exist.');
                throw new Error();
            }
            
            type.__index__ = index;
            type.__id__ = item.id;
            self.logger_.debug('Type ' + C.lang.getFunctionName(type) +
                               ' is injected with id: ' + type.__id__ + 
                               ', index: ' + type.__index__);
                               
            self.indexes_[index] = type;
            self.types_[item.id] = type;
        });
    }
	
	C.lang.inherit(IndexedMessageFactory, C.persia.messages.MessageFactory);
    
    /**
     * Serialize the passed-in message to buffer
     *
     * @method serialize
     * @param {Message} message the message to be serialized
     * @param {Function} callback the callback function to be invoked when the
     *                            message is successfully serialized, or some
     *                            error occurs. The signature of the callback
     *                            is 'function (error, data) {}'
     */
    IndexedMessageFactory.prototype.serialize = function(message, callback) {
        var self = this,
            type = C.lang.getObjectType(message),
            index = type.__index__;
        
        if (undefined === index) {
            this.logger_.debug('The constructor of the message ' + 
                               C.lang.getFunctionName(type) + 
                               ' does not contain a property with ' +
                               'name \'__index__\'');
            callback(new Error(), null);
            return;
        }
        
        message.serialize(function (error, data) {
            if (error) {
                self.logger_.debug('Serializing message ' + 
                                   C.lang.inspect(message) + ' failed. Error: ' +
                                   C.lang.inspect(error));
                callback(error, null);
                return;
            }
            
            result = new Buffer(data.length + 1);
            result.writeUInt8(index, 0);
            data.copy(result, 1);
            self.logger_.debug('Message ' + C.lang.inspect(message) + 
                               ' is successfully serialized.');
            callback(null, result);
        });
    };
    
    /**
     * Deserialize the passed-in buffer to its corresponding message isntance
     *
     * @method deserialize
     * @param {Buffer} data the binary data to be deserialized
     * @param {Function} callback the callback function to be invoked when the
     *                            binary data is successfully deserialized,
     *                            or some error occurs. The signature of the
     *                            callback is 'function (error, message) {}'
     */
    IndexedMessageFactory.prototype.deserialize = function(data, callback) {
        var index = data.readUInt8(0),
            message = null,
            type = this.indexes_[index],
            self = this;
            
        if (!type) {
            this.logger_.debug('Required message type with index: ' + index + 
                               ' does not exist.');
            callback(new Error(), null);
            return;
        }
        
        message = new type();
        message.deserialize(data.slice(1), function (error, message) {
            if (error) {
                self.logger_.debug('Deserializing binary data ' + 
                                   C.lang.inspect(data) + 
                                   ' to message of type ' +
                                   C.lang.getFunctionName(type) + 
                                   ' failed. Error: ' + C.lang.inspect(error));
                callback(error, null);
                return;
            }
            
            self.logger_.debug('Deserializing binary data ' + 
                               C.lang.inspect(data) + 
                               ' to message of type ' +
                               C.lang.getFunctionName(type) + 
                               ' succeed. Message: ' + 
                               C.lang.inspect(message));
            callback(null, message);
        });
    };
    
    C.namespace('persia.messages').IndexedMessageFactory = IndexedMessageFactory;

}, '0.0.1', { requires: ['persia-message-factory']});