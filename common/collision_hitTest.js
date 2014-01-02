if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
    var TMX_Engine = require('./../server/js/TMX_Engine'),
        tmxloader = TMX_Engine.tmxloader,
        layerByName = TMX_Engine.layerByName,
        broadcastToRoom = require('../server/socket-listener').broadcastToRoom,
        Drop = require('./dto/drop').Drop,
        helper = require('./helper'),
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
    var remotePlayers = session.getRemotePlayers(),
        enemy_xw,
        enemy_yh,
        botArray = bots;    // this to make webstorm not throwing warning
    for (var i = 0; i < lasers.length; i++) {
        if(lasers[i].getOriginID().length!==20) continue;  // bot don't shoot each other
        for (var obj = 0; obj < botArray.length; ++obj) {
            enemy_xw = botArray[obj].getX() + botArray[obj].getWidth();
            enemy_yh = botArray[obj].getY() + botArray[obj].getHeight();
            if(lasers[i].x<enemy_xw && lasers[i].y<enemy_yh && lasers[i].x>botArray[obj].getX() && lasers[i].y>botArray[obj].getY()) {
                botArray[obj].setHitPoint(botArray[obj].getHitPoint() - lasers[i].getDamage());
                lasers[i].setIsRemoved(true);
                if(botArray[obj].getHitPoint()<=0){
                    // CREATE DROP
                    if(botArray[obj].getType()==='smart'){
                        var id = helper.createUUID('xxxx'),
                            type = 'piercing',
                            x = botArray[obj].getX(),
                            y = botArray[obj].getY(),
                            newDrop = new Drop(id, type, x, y);
                        session.getDrop().push(newDrop);
                        broadcastToRoom(session.getRoomID(),"new drop",{id: id,type: type,x: x,y: y});
                    }
                    for(var k=0; k<remotePlayers.length; k++) {
                        if(lasers[i].getOriginID()===remotePlayers[k].getSocketID()) {
                            remotePlayers[k].setBotKill(remotePlayers[k].getBotKill()+1);
                            if(botArray[obj].getType()==='smart') {
                                remotePlayers[k].setScore(remotePlayers[k].getScore()+1);
                            } else {
                                remotePlayers[k].setScore(remotePlayers[k].getScore()+5);
                            }
                            debug.log('player '+remotePlayers[k].getUsername()+' bot kill: '
                                +remotePlayers[k].getBotKill()+' score: '+remotePlayers[k].getScore());
                        }
                    }
                    // MOVE THE ABOVE OUT
                    broadcastToRoom(session.getRoomID(),"bot die",{ count: botArray[obj].id });
                    botArray.splice(obj, 1);
                }
            }
        }
    }
}
function hitTestPlayer() {
    if(session.getRemotePlayers().length<2) return; // make sure checkLive() don't throw error
    var remotePlayers = session.getRemotePlayers(),
        ship_xw,
        ship_yh;
    for (var i = 0; i < lasers.length; i++) {
        for (var obj = 0; obj < remotePlayers.length; ++obj) {
            ship_xw = remotePlayers[obj].getX() + remotePlayers[obj].getWidth();
            ship_yh = remotePlayers[obj].getY() + remotePlayers[obj].getHeight();
            if (lasers[i].x < ship_xw && lasers[i].y < ship_yh && lasers[i].x > remotePlayers[obj].getX() && lasers[i].y > remotePlayers[obj].getY()) {
                remotePlayers[obj].setHitPoint(remotePlayers[obj].getHitPoint() - lasers[i].getDamage());
                lasers[i].isRemoved = true;
            }
        }
    }
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
    if(lasers.length==0) return;
    var endOfArray = false;
    while(!endOfArray) {
        for (var i = 0; i < lasers.length; i++) {
            var laser = lasers[i];
            if(i==lasers.length-1) {
                endOfArray=true;
            }
            if (laser.getY() < 0 || laser.getY() > tmxloader.map.height * tmxloader.map.tileHeight ||
                laser.getX() < 0 || laser.getX() > tmxloader.map.width * tmxloader.map.tileWidth) {
                lasers.splice(i, 1);
                //restart loop
                i = lasers.length;
            }else if (mapCollision(laser.getX(), laser.getY(), 4, 4, 'bullet')) {
                laser.setIsRemoved(true);
            }
        }
    }

}
