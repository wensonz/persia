/**
 * This module contains the implementation of the pipeline channel.
 * 
 * @module persia.channels.pipeline
 */
Condotti.add('persia.channels.pipeline', function (C) {

    /**
     * This PipelineChannel is a child of the abstract base Channel, and is
     * designed to simulate the ChannelPipeline class of the famous java
     * framework - netty
     * 
     * @class PipelineChannel
     * @constructor
     * @extends Channel
     * @param {Transport} transport the underlying transport for data 
     *                              transfering
     * @param {Array} handlers the message handlers in the pipeline
     */
    function PipelineChannel (transport, handlers) {
        /* inheritance */
        this.super(transport);
        
        /**
         * The message handlers in the pipeline for message processing
         * 
         * @property handlers_
         * @type Array
         */
        this.handlers_ = handlers;
    }
    
    C.lang.inherit(PipelineChannel, C.persia.channels.Channel);
    
    

}, '0.0.1', { requires: ['persia.channels.base'] });