if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
    exports.combine16to1tile = combine16to1tile;
    var TMX_Engine = require('../server/js/TMX_Engine'),
        tmxloader = TMX_Engine.tmxloader,
        helper = require('./helper'),
        clone2DArray = helper.clone2DArray;
}
//combine all the tile layers together for pathfinding
//output: 1 combined layer
function combineTileLayer() {
    var combined = [];
    for (var layer = 0; layer < tmxloader.map.layers.length; layer++) {
        var name = tmxloader.map.layers[layer].name;
        if (name === 'overhead' || name === 'destructible')
            continue;
        if (!tmxloader.map.layers[layer].visible) continue;
        //first use 1 layer as the start
        if (combined.length == 0) {
            clone2DArray(session.getDestructible(), combined);
        }
        //if combined is 0 and layer is not 0, combined = 1 (unwalkable)
        for (var i = 0; i < tmxloader.map.width; i++) {
            for (var j = 0; j < tmxloader.map.height; j++) {
                if (combined[i][j] == 0 && tmxloader.map.layers[layer].data[i][j] != 0) {
                    combined[i][j] = 1;
                }
            }
        }
    }
    return combined;
}
//input: the small tile layer
//combine 4x4 into 1 big tile
//check if any tile in 4x4 is unwalkable, make the big tile unwalkable too
//output: the big tile layer
function combine16to1tile() {
    var combined = combineTileLayer(),
        combinedBig = [];
    for (var width = 0; width < tmxloader.map.width / 4; width++) {
        combinedBig[width] = [];
        for (var height = 0; height < tmxloader.map.height / 4; height++) {
            //if any of 4x4 is unwalkable, flag it unwalkable
            var flag = false;
            for (var i = 0; i < 4; i++) {
                for (var j = 0; j < 4; j++) {
                    if (combined[width * 4 + i][height * 4 + j] != 0)
                        flag = true;
                }
            }
            if (flag) {
                combinedBig[width][height] = 1;
            } else {
                combinedBig[width][height] = 0;
            }
        }
    }
    return combinedBig;
}