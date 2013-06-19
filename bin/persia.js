var natives = require('natives'),
    condotti = require('condotti'),
    config = require(natives.path.resolve(__dirname, '../config/config.json'),
    C = null,
    logger = null,
    name = null,
    step = null;

//============  PROGRAM START HERE  ===============
C = condotti.Condotti(config.condotti);

name = natives.path.basename(__filename, '.js');
name = name.charAt(0).toUpperCase() + name.substring(1);

logger = C.logging.getLogger(name);
logger.info('[ BOOT ] Program ' + name + ' is being bootstrapped ...');

step = C.logging.getStepLogger(logger);

C.async.waterfall([
    function (next) { // loading modules
        step.start('Loading necessary modules ' + config.modules.toString());
        C.use(config.modules, next);
    }, 
    function (unused, next) { // initializing compoennts
        var factory = null,
            app = null;
        
        step.done();
        step.start('Initializing program components');
        factory = new C.di.DottiFactory(config.dotti);
        app = factory.get('app');
        step.done();
        
        step.start('Running the application');
        app.run(next);
    }
], function (error) {
    if (error) {
        step.error(error);
        logger.error('[ TERM ] Program ' + name + ' terminates abnormally.');
        process.exit(1);
        return;
    }
    
    step.done();
    logger.info('[ EXIT ] Program ' + name + ' exits normally.');
    process.exit(0);
});