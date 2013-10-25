function createUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    })
}
//input: interval in which random number come from
//output: random number between interval
exports.randomNumber = function(from, to) {
    return Math.floor(Math.random() * (to - from + 1) + from);
}
exports.createUUID = createUUID;
