var tmxloader = require('./TMX_Engine').tmxloader;
//input: bot array
//move the bot according to there foundPath
exports.movingBot = function (bots) {
    //bot current coordianate is calculate base on ship_w/h, not tileWidth/height
    var pixelX = bots.pathFound[bots.whereNow + 1][0] * bots.getWidth(),
        pixelY = bots.pathFound[bots.whereNow + 1][1] * bots.getHeight(),
        differenceX = bots.getX() - pixelX,
        differenceY = bots.getY() - pixelY;
    //go vertically
    if (differenceX == 0 && differenceY != 0) {
        //down or up
        if (differenceY > 0) {
            bots.setY(bots.getY() - bots.speed);
            bots.direction = 'up';
        } else {
            bots.setY(bots.getY() + bots.speed);
            bots.direction = 'down';
        }
        //go horizontally
    } else if (differenceY == 0 && differenceX != 0) {
        //right or left
        if (differenceX > 0) {
            bots.setX(bots.getX() - bots.speed);
            bots.direction = 'left';
        } else {
            bots.setX(bots.getX() + bots.speed);
            bots.direction = 'right';
        }
    } else {
        bots.whereNow++;
    }
}

//input: current location
//output: array of path to a random point
exports.botRandomPath = function (object) {
    var check = true,
        randomNumber = require('./helper').randomNumber,
        pathFinder = require('./BotPathFinder').pathFinder,
        botDestination = tmxloader.map.objectgroup['destination'].objects;
    while (check) {
        //pathStart/end calculate base on ship_w/h, not tileWidth/Height
        pathStart = [Math.floor(object.getX() / object.getWidth()), Math.floor(object.getY() / object.getHeight())];
        var random = randomNumber(0, botDestination.length - 1);
        pathEnd = [Math.floor(botDestination[random].x / object.getWidth()), Math.floor(botDestination[random].y / object.getHeight())];
        if (pathStart[0] != pathEnd[0] || pathStart[1] != pathEnd[1]) {
            check = false;
        }
    }
    return pathFinder(combine16to1tile(combineTileLayer()), pathStart, pathEnd);
}

//combine all the tile layers together for pathfinding
//output: 1 combined layer
function combineTileLayer() {
    var combined = [];
    for (var layer = 0; layer < tmxloader.map.layers.length; layer++) {
        if (tmxloader.map.layers[layer].name == 'overhead')
            continue;
        //first use 1 layer as the start
        //var new = old[] will create a REFERENCE, not a clone
        //have to manually clone each array in multi-dimentional array
        if (combined.length == 0) {
            for (var i = 0; i < tmxloader.map.width; i++) {
                combined[i] = tmxloader.map.layers[layer].data[i].slice(0);
            }
            continue;
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
function combine16to1tile(combined) {
    var combinedBig = [];
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