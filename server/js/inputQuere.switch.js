var main = require('./main');
exports.inputQueueSwitch = function(){
    var inputQueue = main.inputQueue;
    for(var i=0;i<inputQueue.length;i++){
        switch (inputQueue[i].getEventName()){
            case 'move key up':
            case 'move key down':
        }
    }
};