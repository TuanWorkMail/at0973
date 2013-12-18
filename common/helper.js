if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
    var util = require('util');
    exports.createUUID = createUUID;
    exports.randomNumber = randomNumber;
    exports.clone2DArray = clone2DArray;
}
//input: interval in which random number come from
//output: random number between interval
function randomNumber(from, to) {
    return Math.floor(Math.random() * (to - from + 1) + from);
}
//input: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
function createUUID(pattern) {
    return pattern.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    })
}
//var new = old[] will create a REFERENCE, not a clone
//have to manually clone each array in multi-dimentional array
function clone2DArray(source, clone) {
    if(source.length==0) {
        var temp = source;
        source = clone;
        clone = temp;
    }
    for (var i = 0; i < source.length; i++) {
        clone[i] = source[i].slice(0);
    }
}
var debug = {};
debug.log = function(string, level) {
    if(typeof level==='undefined') level=0;
    if(level<debugLogLevel) return;
    if (typeof require !== 'undefined' && typeof exports !== 'undefined') util.log(string);
    else console.log(string);
};
if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
    exports.debug = debug;
}