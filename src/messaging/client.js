/**
 * This module contains the implementation of the client side messaging handler,
 * which is designed to provide client side functionalities for the messaging
 * system
 *
 * @module persia.messaging.client
 */
Condotti.add('persia.messaging.client', function (C) {
    
    /**
     * This MessagingHandler class is a child of the abstract base class
     * Handler and is designed to provide the client side functionalities for
     * the messaging system. The data structure of the messages used in this
     * system are as following:
     *
     * SUBSCRIPTION: 
     * {
     *    "type": "SUBSCRIPTION",
     *    "topic": "${topic name to be subscribed}"
     * }
     * 
     * PUBLISHING:
     * {
     *     "type": "PUBLISHING",
     *     "topic": "${topic name for the data to be published}",
     *     "data": ${arbitary binary data}
     * }
     *
     * DATA:
     * {
     *     "type": "DATA",
     *     "topic": "${topic name this data comes from}",
     *     "data": ${arbitary binary data}
     * }
     *
     * ERROR:
     * {
     *     "type": "ERROR",
     *     "code": ${error code in number},
     *     "message": ${error message}
     *     // "action": "${action name causing this error}" ?
     * }
     *
     *
     * @class MessagingHandler
     * @constructor
     * @extends Handler
     * @param {String} name the name of the handler
     */
    function MessagingHandler (name) {
        /* inheritance */
        this.super(name);
        
        /**
         * The running orchestration jobs
         * 
         * @property running_
         * @type Object
         * @deafult {}
         */
        this.running_ = {};
    }
    
    C.lang.inherit(MessagingHandler, C.persia.handlers.Handler);
    
    /**
     * Handle the inbound data and invoke the next handler in the chain
     * 
     * @method handleInbound
     * @param {Object} context the context object for the pipeline
     * @param {Object} data the data to be handled
     */
    MessagingHandler.prototype.handleInbound = function (context, data) {
        
        this.logger_.info('New message received: ' + 
                          C.lang.reflect.inspect(data));
        
        switch (data.type) {
        case 'DATA':
            this.onDataMessage_(context, data);
            break;
        default:
            this.logger_.error('Unsupported message type "' + data.type + 
                               '" is found.');
            this.handleOutbound(context, { 
                type: "ERROR", 
                code: 415, // Unsupported Media Type
                message: 'Message type "' + data.type + '" is not supported.' 
            });
        }
    };
    
    /**
     * Handle the inbound DATA message. The data structure of the "data" part
     * of the message, which is expected to be a request object, is defined as 
     * following:
     * {
     *     "id": "${the id for this request}",
     *     "type": "REQUEST",
     *     "sender": "${the id of the sender}",
     *     "job": "${the orchestration job id}",
     *     "command": "${the command to be executed}", // EXEC, TEE, STAT, CANCEL or NOTIFY
     *     "params": {}
     * }
     * For the EXEC command, the "params" object is defined as following:
     * {
     *     "executable": "${path to the executable}",
     *     "arguments": [], // other command line arguments
     *     "uid": "${user id for the execution}",
     *     "gid": "${group id}"
     * }
     * 
     * And the response message is defined as following:
     * {
     *     "id": "${the id for the request}",
     *     "type": "RESPONSE",
     *     "sender": "${the id of the responser}",
     *     "result": ${arbitory result object},
     *     "error": {
     *         "code": ${the error code in number},
     *         "message": "${the error message}"
     *     }
     * }
     * 
     * @method onDataMessage_
     * @param {Object} context the context object for this handler
     * @param {Object} message the subscription message to be handled
     */
    MessagingHandler.prototype.onDataMessage_ = function (context, message) {
        //
        this.logger_.info('Data message received: ' + C.lang.reflect.inspect(message));
        switch (message.data.command) {
        case 'EXEC':
            this.onExecCommand_(context, message.data);
            break;
        case 'TEE':
            this.onTeeCommand_(context, message.data);
            break;
        case 'STAT':
            this.onStatCommand_(context, message.data);
            break;
        case 'CANCEL':
            this.onCancelCommand_(context, message.data);
            break;
        default:
            this.handleOutbound(context, {
                type: 'PUBLISHING',
                topic: message.data.sender,
                data: {
                    id: message.data.id,
                    sender: context.id,
                    error: { 
                        code: 415, 
                        message: 'Command "' + message.data.command + 
                                 '" is not supported'
                    }
                }
            });
            break;
        }
    };
    
    /**
     * Handle the "EXEC" command 
     *
     * @method onExecCommand_
     * @param {Object} context the context object for this handler
     * @param {Object} request the request object for execution
     */
    MessagingHandler.prototype.onExecCommand_ = function (context, request) {
        var mkdirp = C.require('mkdirp'),
            self = this,
            logger = C.logging.getStepLogger(this.logger_),
            path = null,
            response = null;
            
        this.logger_.debug('EXEC command is found.');
        path = C.natives.path.resolve(context.root, request.job);
        response = {
            type: 'PUBLISHING',
            topic: request.sender,
            data: {
                id: request.id,
                sender: context.id,
                type: 'RESPONSE'
            }
        };
        
        C.async.waterfall([
            function (next) { // Check if the job already exist
                logger.start('Looking up if the job directory ' + path + 
                             ' already exists');
                C.natives.fs.exists(path, next.bind(null, null));
            },
            function (exists, next) { // create directory and files
                var error = null;
                logger.done(exists);
                
                if (exists) {
                    // TODO: add customized error type
                    error = new Error('Job ' + request.job + 
                                      ' is being executed');
                    error.code = 409;
                    logger.error(error);
                    next(error);
                    return;
                }
                
                //
                logger.start('Making the job directory ' + path);
                mkdirp(path, next);
            },
            function (made, next) { // change ownership
                logger.done(made);
                
                logger.start('Changing the ownership of the directory ' + path +
                             ' to be ' + request.params.uid + ':' + 
                             request.params.gid);
                C.natives.fs.chown(path, request.params.uid, request.params.gid, 
                                   next);
            },
            function (next) { // spawn the child process to execute the job
                var child = null,
                    output = null;
                
                logger.done();
                
                logger.start('Creating stdout/err output file under ' + path);
                try {
                    output = C.natives.fs.createWriteStream(
                        C.natives.path.resolve(path, 'output')
                    );
                } catch (e) {
                    logger.error(e);
                    e.code = 500;
                    next(new Error('Creating stdout/err output file failed.'));
                    return;
                }
                
                logger.done();
                logger.start('Excuting the job "' + request.params.executable + 
                             ' ' + request.params.arguments.join(' ') + '"');
                try {
                    child = C.natives.child_process.spawn(
                        request.params.executable,
                        request.params.arguments,
                        {
                            // stdio: ['ignore', output, output],
                            uid: request.params.uid,
                            gid: request.params.gid,
                            detached: true
                        }
                    );
                } catch (e) {
                    logger.error(e);
                    e.code = 400;
                    next(e);
                    return;
                }
                
                child.stdout.pipe(output);
                child.stderr.pipe(output);
                // bind the "exit" event to remove from running table and
                // create the "stat" file
                child.on('exit', function (code, signal) {
                    C.natives.fs.writeFile(
                        C.natives.path.resolve(path, 'stat'),
                        JSON.stringify({ code: code, signal: signal}, null, 4)
                    );
                    delete self.running_[request.job];
                    
                    // send "NOTIFY" to the API server
                    self.handleOutbound(context, {
                        type: 'PUBLISHING',
                        topic: request.sender,
                        data: {
                            id: C.uuid.v4(),
                            type: 'REQUEST',
                            sender: context.id,
                            job: request.job,
                            command: 'NOTIFY',
                            params: {
                                code: code,
                                signal: signal
                            }
                        }
                    });
                });
                
                // create pid file
                C.natives.fs.writeFile(
                    C.natives.path.resolve(path, 'pid'),
                    child.pid.toString()
                );
                
                child.unref();
                self.running_[request.job] = child;
                next();
            }
        ], function (error) {
            if (error) {
                if (!error.code) {
                    logger.error(error);
                }
                
                response.data.error = {
                    code: error.code || 500,
                    message: error.message
                };
            } else {
                logger.done();
            }
            
            self.handleOutbound(context, response);
        });
    };
    
    
    /**
     * Handle the caught error and invoke the next handler in the chain
     * 
     * @method handleCaughtError
     * @param {Object} context the context object for the pipeline
     * @param {Error} error the error caught
     */
    MessagingHandler.prototype.handleCaughtError = function (context, error) {
        var self = this;
        
        this.logger_.error('Error occurs in pipeline ' + 
                           context.pipeline.toString() + '. Detail: ' +
                           C.lang.reflect.inspect(error));
        
        context.transport.close();
    };
    
    C.namespace('persia.handlers').MessagingHandler = MessagingHandler;
    
}, '0.0.1', { requires: ['persia.handlers.base'] });