if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
    var TMX_Engine = require('./../server/js/TMX_Engine'),
        tmxloader = TMX_Engine.tmxloader,
        layerByName = TMX_Engine.layerByName,
        broadcastToRoom = require('../server/socket-listener').broadcastToRoom,
        Drop = require('./dto/drop').Drop,
        helper = require('./helper'),
        main = require('../server/js/main'),
        clone2DArray = helper.clone2DArray,
        debug = helper.debug,
        botCheckHitPoint = require('../server/js/BotClass');
    exports.mapCollision = mapCollision;
    exports.hitTestBot = hitTestBot;
    exports.hitTestPlayer = hitTestPlayer;
    exports.hitTestEagle = hitTestEagle;
    exports.bulletCollision = bulletCollision;
}
//iput:x,y,w,h,type(bullet/tank)
function mapCollision(x, y, w, h, type) {
    var xTile = Math.floor(x / tmxloader.map.tileWidth),
        yTile = Math.floor(y / tmxloader.map.tileHeight),
    //NOT(number of tiles) horizontally(w) or vertically(h)
        wNOT = w / tmxloader.map.tileWidth,
        hNOT = h / tmxloader.map.tileHeight,
        width = tmxloader.map.width * tmxloader.map.tileWidth,
        height = tmxloader.map.height * tmxloader.map.tileHeight;
    //check if out of map area
    if (x < 0 || x + w > width || y < 0 || y + h > height)
        return true;
    //for every layer in map
    for (var i = 0; i < tmxloader.map.layers.length + 2; i++) {
        var name = '',
            array;
        if(i>=tmxloader.map.layers.length){        // after end of layer array
            if(type==='bullet') continue;
            if(i===tmxloader.map.layers.length) {
                array = session.getDestructible();
            } else {
                array = session.getIndestructible();
            }
        } else {
            name = tmxloader.map.layers[i].name;
            array = tmxloader.map.layers[i].data;
        }
        if (name == 'background' || name == 'overhead' || name == 'destructible' || name == 'indestructible') continue;
        if(i<tmxloader.map.layers.length){
            if (!tmxloader.map.layers[i].visible) continue;
        }
        if (type == 'bullet' && name == 'water') continue;
        for (var j = 0; j < wNOT; j++) {
            for (var k = 0; k < hNOT; k++) {
                if (array[xTile + j][yTile + k] != 0) {
                    return true;
                }
            }
        }
    }

    //if nothing match, object not collide with anything
    return false;
}



function hitTestBot() {
    hitTest(bots, 'bot');
}
function hitTestPlayer() {
    if(session.getRemotePlayers().length<2) return; // make sure checkLive() don't throw error
    hitTest(session.getRemotePlayers());
}
function hitTest(array, type) {
    if(typeof type === 'undefined') type = 0;
    lasers = main.session.getLasers();
    for (var i = 0; i < lasers.length; i++) {
        if(type==='bot'&&lasers[i].getOriginID().length!==20) continue;
        for (var j = 0; j < array.length; j++) {
            var ship_xw = array[j].getX() + array[j].getWidth(),
                ship_yh = array[j].getY() + array[j].getHeight();
            if (lasers[i].getX() < ship_xw && lasers[i].getY() < ship_yh && lasers[i].getX() > array[j].getX() && lasers[i].getY() > array[j].getY()) {
                array[j].setHitPoint(array[j].getHitPoint() - lasers[i].getDamage());
                lasers[i].setIsRemoved(true);
                return true;
            }
        }
    }
    return false;
}
function hitTestEagle() {
    var remotePlayers = session.getRemotePlayers(),
        eagle = tmxloader.map.objectgroup['eagle'].objects;

    for (var i = 0; i < lasers.length; i++) {
        for (var obj = 0; obj < eagle.length; ++obj) {
            var ship_xw = eagle[obj].x + eagle[obj].width,
                ship_yh = eagle[obj].y + eagle[obj].height;
            if (lasers[i].x < ship_xw && lasers[i].y < ship_yh && lasers[i].x > eagle[obj].x && lasers[i].y > eagle[obj].y) {
                var name = eagle[obj].name;
                for(var j=0; j<remotePlayers.length; j++) {
                    if(remotePlayers[j].getPosition()==name) {
                        remotePlayers[j].setHitPoint(0);
                    }
                }
            }
        }
    }
}
function bulletCollision() {
    for (var i = 0; i < lasers.length; i++) {
        var laser = lasers[i];
        if (laser.getY() < 0 || laser.getY() > tmxloader.map.height * tmxloader.map.tileHeight ||
            laser.getX() < 0 || laser.getX() > tmxloader.map.width * tmxloader.map.tileWidth) {
            laser.setIsRemoved(true);
        }
    }
}
