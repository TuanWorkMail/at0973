if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
    exports.shootDestroyBrick = shootDestroyBrick;
    var tmxloader = require('./../server/js/TMX_Engine').tmxloader;
}
var broadcastToRoom = require('../server/socket-listener').broadcastToRoom,
    main = require('../server/js/main'),
    destroyedBrick = [];
function shootDestroyBrick() {
    var remotePlayers = session.getRemotePlayers(),
        destructible = session.getDestructible(),
        indestructible = session.getIndestructible(),
        count=0;
    if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
        playerById = require('./player').playerById;
    }
    while(count<2){
        var array, arrayName;
        if(count===0){
            array = destructible;
            arrayName = 'destructible';
        } else {
            array = indestructible;
            arrayName = 'indestructible';
        }
        for (var i = 0; i < lasers.length; i++) {
            var laser = lasers[i];
            var playerDimension = tmxloader.map.objectgroup['dimension'].objects[0],
                xtile = Math.round(laser.getX() / tmxloader.map.tileWidth),
                ytile = Math.round(laser.getY() / tmxloader.map.tileHeight),
                halfWidth = playerDimension.width / 2,
                halfHeight = playerDimension.height / 2,
                // STG = snap to grid
                xtileSTG = Math.round(laser.getX() / halfWidth) * 2,
                ytileSTG = Math.round(laser.getY() / halfHeight) * 2,
                xstart = xtileSTG - 1,
                xend = xtileSTG + 1,
                ystart = ytileSTG - 1,
                yend = ytileSTG + 1,
                xincrement = 1,
                yincrement = 1;
            switch (laser.getDirection()) {
                case 'up':
                    ystart = Math.round( (laser.getY() + laser.getSpeed()) / tmxloader.map.tileHeight);
                    yend = ytile;
                    yincrement = -1;
                    break;
                case 'down':
                    ystart = Math.round( (laser.getY() - laser.getSpeed()) / tmxloader.map.tileHeight);
                    yend = ytile;
                    break;
                case 'left':
                    xstart = Math.round( (laser.getX() + laser.getSpeed()) / tmxloader.map.tileWidth);
                    xend = xtile;
                    xincrement = -1;
                    break;
                case 'right':
                    xstart = Math.round( (laser.getX() - laser.getSpeed()) / tmxloader.map.tileWidth);
                    xend = xtile;
                    break;
            }
            for(var j=xstart; j * xincrement < xend * xincrement; j = j + xincrement){
                for(var k=ystart; k * yincrement < yend * yincrement; k = k + yincrement){
                    if(array[j][k]==='0') continue;
                    laser.setIsRemoved(true);
                    var destroy = true;
                    if(count!==0){
                        var player = playerById(laser.getOriginID());
                        if(!player || player.players.getBulletType()!=='piercing') {
                            destroy = false;
                        }
                    }
                    if(destroy) removeDestructible(laser.getDirection(), j, k, xtileSTG, ytileSTG, array, arrayName);
                    // get out of loop
                    j = xend;
                    k = yend;

                    //lasers.splice(i, 1);
                    //return;

                }
            }
        }
        count++;
    }
}
function removeDestructible(direction, x, y, xSTG, ySTG, array, arrayName) {
    var xstart, xend, ystart, yend;

    switch(direction) {
        case 'up':
        case 'down':
            xstart = xSTG - 2;
            xend = xSTG + 2;
            ystart = y;
            yend = y + 1;
            break;
        case 'left':
        case 'right':
            xstart = x;
            xend = x + 1;
            ystart = ySTG - 2;
            yend = ySTG + 2;
            break;
    }
    var brickDestroyedNow = [];
    for(var m=xstart; m<xend; m++) {
        for(var n=ystart; n<yend; n++){
            array[m][n] = '0';
            destroyedBrick.push([m, n]);
            brickDestroyedNow.push([m, n]);
        }
    }
    broadcastToRoom(main.session.getRoomID(), 'destroy brick', {array: brickDestroyedNow, name: arrayName});
}