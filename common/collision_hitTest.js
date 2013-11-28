if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
    var TMX_Engine = require('./../server/js/TMX_Engine'),
        tmxloader = TMX_Engine.tmxloader,
        sockets = require('../server/js/socket').sockets,
        layerByName = TMX_Engine.layerByName,
        Drop = require('./dto/drop').Drop,
        helper = require('./helper'),
        clone2DArray = helper.clone2DArray;
    exports.mapCollision = mapCollision;
    exports.shootDestruction = shootDestruction;
    exports.hitTestBot = hitTestBot;
    exports.hitTestPlayer = hitTestPlayer;
    exports.hitTestEagle = hitTestEagle;
    exports.outOfMapBullet = outOfMapBullet;
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
    for (var i = 0; i < tmxloader.map.layers.length; i++) {
        if (tmxloader.map.layers[i].name == 'destructible') continue;
        if (tmxloader.map.layers[i].name == 'background' || tmxloader.map.layers[i].name == 'overhead') continue;
        if (!tmxloader.map.layers[i].visible) continue;
        if (type == 'bullet') {
            if (tmxloader.map.layers[i].name == 'water' || tmxloader.map.layers[i].name == 'destructible') continue;
        } else {
            for (var j = 0; j < wNOT; j++) {
                for (var k = 0; k < hNOT; k++) {
                    if (session.getDestructible()[xTile + j][yTile + k] != 0) {
                        return true;
                    }
                }
            }
        }
        for (var j = 0; j < wNOT; j++) {
            for (var k = 0; k < hNOT; k++) {
                if (tmxloader.map.layers[i].data[xTile + j][yTile + k] != 0) {
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
        destructible = session.getDestructible();
    // this one for client, server create in session.js
    if(destructible.length==0)
        clone2DArray(layerByName('destructible').data, destructible);
    var result = {};
        result.data=destructible;
    for (var i = 0; i < lasers.length; i++) {
        /*if(lasers[i].getOriginID().length===20){                                // bullet shot by player not bot
            for(var j=0;j<remotePlayers.length;j++) {
                if(lasers[i].getOriginID()===remotePlayers[j].getSocketID()) {
                    if(!remotePlayers[j].getShootBrick()) return;               // can player shoot down brick?
                }
            }
        }*/
        var laser = lasers[i];
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
                if(removeDestructible(laser.getDirection(), j, k, xtileSTG, ytileSTG)){
                    //laser.setIsRemoved(true);
                    //continue;

                    //lasers.splice(i, 1);
                    //return;
                }
            }
        }
    }
}
function removeDestructible(direction, x, y, xSTG, ySTG) {
    var xstart, xend, ystart, yend,
        destructible = session.getDestructible();

    if(destructible[x][y]==='0') return false;
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
            destructible[m][n] = '0';
        }
    }
    return true;
}

function hitTestBot() {
    var remotePlayers = session.getRemotePlayers(),
        enemy_xw,
        enemy_yh;
    for (var i = 0; i < lasers.length; i++) {
        for (var obj = 0; obj < bots.length; ++obj) {
            enemy_xw = bots[obj].getX() + bots[obj].getWidth();
            enemy_yh = bots[obj].getY() + bots[obj].getHeight();
            if(lasers[i].x<enemy_xw && lasers[i].y<enemy_yh && lasers[i].x>bots[obj].getX() && lasers[i].y>bots[obj].getY()) {
                sockets.in('r'+session.getRoomID()).emit("bot die", { count: bots[obj].id });
                if(bots[obj].getType()==='dumb'){
                    var id = helper.createUUID('xxxx'),
                        type = 'piercing',
                        x = bots[obj].getX(),
                        y = bots[obj].getY(),
                        newDrop = new Drop(id, type, x, y);
                    session.getDrop().push(newDrop);
                    sockets.in('r'+session.getRoomID()).emit("new drop",{id: id,type: type,x: x,y: y});
                }
                bots.splice(obj, 1);
                lasers[i].isRemoved = true;
                for(var k=0; k<remotePlayers.length; k++) {
                    if(lasers[i].getOriginID()===remotePlayers[k].getSocketID()) {
                        remotePlayers[k].setBotKill(remotePlayers[k].getBotKill()+1);
                        if(remotePlayers[k].getBotKill()>=2) {
                            remotePlayers[k].setShootBrick(true);                       // now can shoot down brick
                            sockets.in('r'+session.getRoomID()).emit("shoot brick",{id:remotePlayers[k].getSocketID()});
                        }
                    }
                }
            }
        }
    }
}

function hitTestPlayer() {
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
function outOfMapBullet() {
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
            }
        }
    }
}

//Runs a couple of loops to see if any of the lasers have hit any of the enemies
function hitTestPlayer_old() {
    var ship_xw = ship_x + ship_w,
        ship_yh = ship_y + ship_h,
        laserNewCor;
    for (var i = 0; i < lasers.length; i++) {
        if (lasers[i][2] == 0 || lasers[i][2] == -1) {
            if (lasers[i][1] <= ship_yh && lasers[i][1] >= ship_y && lasers[i][0] >= ship_x && lasers[i][0] <= ship_xw) {
                checkLives();
                // Send local player data to the game server
                socket.emit("move player", { x: ship_x, y: ship_y });
            }
        } else if (lasers[i][2] == 1) {//right
            //shift laser_x to face right
            laserNewCor = lasers[i][0] + 4;
            if (lasers[i][1] <= ship_yh && lasers[i][1] >= ship_y && laserNewCor >= ship_x && laserNewCor <= ship_xw) {
                checkLives();
                // Send local player data to the game server
                socket.emit("move player", { x: ship_x, y: ship_y });
            }
        } else if (lasers[i][2] == 2) {//down
            //shift laser_y to face downward
            laserNewCor = lasers[i][1] + 4;
            if (laserNewCor <= ship_yh && laserNewCor >= ship_y && lasers[i][0] >= ship_x && lasers[i][0] <= ship_xw) {
                checkLives();
                // Send local player data to the game server
                socket.emit("move player", { x: ship_x, y: ship_y });
            }
        }
    }
}

/*	
 //check ship collide with map
 function mapCollision_old() {
 var ship_xw = ship_x + ship_w,
 ship_yh = ship_y + ship_h,
 object_xw,
 object_yh;
 var objectGroup = tmxloader.map.objectgroup['colision'].objects;
 for (var obj = 0; obj < objectGroup.length; ++obj) {
 object_xw = objectGroup[obj].x + objectGroup[obj].width;
 object_yh = objectGroup[obj].y + objectGroup[obj].height;

 var layerID = layerByName('obstacle');

 if (ship_x < object_xw && ship_y < object_yh && ship_xw > objectGroup[obj].x && ship_yh > objectGroup[obj].y) {
 return true;
 }
 }

 return false;
 }

 function laserCollision() {
 var object_xw,
 object_yh,
 check = false;

 var objectGroup = tmxloader.map.objectgroup['colision'].objects;
 for (var i = 0; i < lasers.length; i++) {
 for (var obj = 0; obj < objectGroup.length; ++obj) {

 object_xw = objectGroup[obj].x + objectGroup[obj].width;
 object_yh = objectGroup[obj].y + objectGroup[obj].height;

 if (lasers[i][0] < object_xw && lasers[i][1] < object_yh && lasers[i][0] + 4 > objectGroup[obj].x && lasers[i][1] + 4 > objectGroup[obj].y) {
 check = true;
 }
 }
 if (check) {
 lasers.splice(i, 1);
 check = false;
 }
 }
 }
 */
