if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
    var TMX_Engine = require('./../server/js/TMX_Engine'),
        tmxloader = TMX_Engine.tmxloader,
        broadcastToRoom = require('../server/socket-listener').broadcastToRoom,
        layerByName = TMX_Engine.layerByName,
        Drop = require('./dto/drop').Drop,
        helper = require('./helper'),
        clone2DArray = helper.clone2DArray,
        debug = require('./helper').debug;
    exports.mapCollision = mapCollision;
    exports.shootDestruction = shootDestruction;
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

function shootDestruction() {
    var remotePlayers = session.getRemotePlayers(),
        destructible = session.getDestructible(),
        indestructible = session.getIndestructible(),
        count=0;
    while(count<2){
        var array;
        if(count===0){
            array = destructible;
        } else {
            array = indestructible;
        }
    for (var i = 0; i < lasers.length; i++) {
        var laser = lasers[i];
        if(count!==0 && laser.getOriginID().length===20){// bullet shot by player not bot
            for(var j=0;j<remotePlayers.length;j++) {
                if(laser.getOriginID()===remotePlayers[j].getSocketID()) {
                    if(remotePlayers[j].getBulletType()!=='piercing') {
                        return;
                    }
                }
            }
        }
        if(count!==0 && laser.getOriginID().length!==20) continue;
        var dimension = tmxloader.map.objectgroup['dimension'].objects[0],
            xtile = Math.round(laser.getX() / tmxloader.map.tileWidth),
            ytile = Math.round(laser.getY() / tmxloader.map.tileHeight),
            halfWidth = dimension.width / 2,
            halfHeight = dimension.height / 2,
            // STG = snap to grid
            xtileSTG = Math.round(laser.getX() / halfWidth) * 2,
            ytileSTG = Math.round(laser.getY() / halfHeight) * 2,
            xstart, xend, ystart, yend;
        switch (laser.getDirection()) {
            case 'up':
                xstart = xtileSTG - 1;
                xend = xtileSTG + 1;
                ystart = ytile;
                yend = Math.round( (laser.getY() + laser.getSpeed()) / tmxloader.map.tileHeight);
                break;
            case 'down':
                xstart = xtileSTG - 1;
                xend = xtileSTG + 1;
                ystart = Math.round( (laser.getY() - laser.getSpeed()) / tmxloader.map.tileHeight);
                yend = ytile;
                break;
            case 'left':
                xstart = xtile;
                xend = Math.round( (laser.getX() + laser.getSpeed()) / tmxloader.map.tileWidth);
                ystart = ytileSTG - 1;
                yend = ytileSTG + 1;
                break;
            case 'right':
                xstart = Math.round( (laser.getX() - laser.getSpeed()) / tmxloader.map.tileWidth);
                xend = xtile;
                ystart = ytileSTG - 1;
                yend = ytileSTG + 1;
                break;
        }
        for(var j=xstart; j<xend; j++){
            for(var k=ystart; k<yend; k++){
                if(removeDestructible(laser.getDirection(), j, k, xtileSTG, ytileSTG, array)){
                    laser.setIsRemoved(true);
                    // get out of loop
                    j = xend;
                    k = yend;

                    //lasers.splice(i, 1);
                    //return;
                }
            }
        }
    }
        count++;
    }
}
function removeDestructible(direction, x, y, xSTG, ySTG, array) {
    var xstart, xend, ystart, yend;

    if(array[x][y]==='0') return false;
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
    for(var m=xstart; m<xend; m++) {
        for(var n=ystart; n<yend; n++){
            array[m][n] = '0';
        }
    }
    return true;
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
                broadcastToRoom(session.getRoomID(),"bot die",{ count: botArray[obj].id })
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
                // MOVE THE ABOVE OUT
                for(var k=0; k<remotePlayers.length; k++) {
                    if(lasers[i].getOriginID()===remotePlayers[k].getSocketID()) {
                        remotePlayers[k].setBotKill(remotePlayers[k].getBotKill()+1);
                        //XXXXXXXXXXXXXXxxxxxxxxxxxxxxxxxxXXXXXXXXXXXXXXXXXXXXXXXXXXxxxxxxxxxxxxxxxxxxxxx
                        debug.log('player '+remotePlayers[k].getUsername()+' bot kill: '+remotePlayers[k].getBotKill());
                        if(remotePlayers[k].getBotKill()>=2) {
                            remotePlayers[k].setShootBrick(true);                       // now can shoot down brick
                            broadcastToRoom(session.getRoomID(),"shoot brick",{id:remotePlayers[k].getSocketID()});
                        }
                    }
                }
                lasers[i].isRemoved = true;
                botArray.splice(obj, 1);
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
                remotePlayers[obj].setHitPoint(remotePlayers[obj].getHitPoint() - 4);
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
