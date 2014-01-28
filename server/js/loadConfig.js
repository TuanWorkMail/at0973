var fs = require('fs'),
    config = {};

// default config only applied when config does not exist
// to change server config use config file

config.debugLogLevel = 1;
config.dbmode = 'mysql--';
config.minimumNoPlayer = 2;
config.mapName = 'classic_small';
config.score = 1;
exports.loadConfig = function(){
    fs.readFile('./config', function(err, data2) {
        if(err){
            fs.writeFile('./config', JSON.stringify(config), function (err) {
                if(err) debug.log(err, 1);
            });
        } else config = JSON.parse(data2);
        exports = config;
    });
};