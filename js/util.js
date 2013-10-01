
//input: interval in which random number come from
//output: random number between interval
function randomNumber(from, to) {
    return Math.floor(Math.random() * (to - from + 1) + from);
}


function findLayerByName(name) {
    for (var i = 0; i < tmxloader.map.layers.length; i++) {
        if (tmxloader.map.layers[i].name == name) {
            return i;
        }
    }
}