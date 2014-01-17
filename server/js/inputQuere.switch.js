var main = require('./main');
function inputQueueSwitch(){
    var inputQueue = main.inputQueue;
    for(var i=0;i<inputQueue.length;i++){
        switch (inputQueue[i].getEventName()){
            case 'login':
            case 'register':
            case 'move key up':
            case 'move key down':
        }
    }
}