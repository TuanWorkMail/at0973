if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
    var TMX_Engine = require('./../server/js/TMX_Engine'),
        tmxloader = TMX_Engine.tmxloader,
        sockets = require('../server/js/socket').sockets,
        layerByName = TMX_Engine.layerByName;
    exports.mapCollision = mapCollision;
    exports.shootDestruction = shootDestruction;
    exports.hitTestBot = hitTestBot;
    exports.hitTestPlayer = hitTestPlayer;
    exports.hitTestEagle = hitTestEagle;
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
        if (tmxloader.map.layers[i].name == 'background' || tmxloader.map.layers[i].name == 'overhead') continue;
        if (type == 'bullet') {
            if (tmxloader.map.layers[i].name == 'water' || tmxloader.map.layers[i].name == 'destructible') continue;
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
    var result = layerByName('destructible');
    if(!result) return;
    for (var i = 0; i < lasers.length; i++) {
        var justanumber = 2;
        switch (lasers[i].direction) {
            //bullet travel upward
            case 'up':
                //check behind and at the bullet because the bullet can travel over the brick(bullet travel at 15 pixel while the brick is 10px)
                for (var behindpresent = 10; behindpresent >= 0; behindpresent = behindpresent - 10) {
                    if (result.data[Math.floor(lasers[i].x / 10)][Math.floor((lasers[i].y + behindpresent) / 10)] != 0 ||
                        result.data[Math.floor((lasers[i].x - 1) / 10)][Math.floor(((lasers[i].y + behindpresent) / 10))] != 0) {
                        //destroy 4 brick at impact
                        for (var the4tinybrick = -11; the4tinybrick < 20; the4tinybrick = the4tinybrick + 10) {
                            result.data[Math.floor((lasers[i].x + the4tinybrick) / 10)][Math.floor((lasers[i].y + behindpresent) / 10)] = 0;
                        }
                        lasers[i].isRemoved = true;
                        break;
                    }
                }
                break;
            //bullet travel downward
            case 'down':
                //check behind and at the bullet because the bullet can travel over the brick(bullet travel at 15 pixel while the brick is 10px)
                for (var behindpresent = -10; behindpresent <= 0; behindpresent = behindpresent + 10) {
                    if (result.data[Math.floor(lasers[i].x / 10)][Math.floor((lasers[i].y + behindpresent) / 10)] != 0 ||
                        result.data[Math.floor((lasers[i].x - 1) / 10)][Math.floor(((lasers[i].y + behindpresent) / 10))] != 0) {
                        //destroy 4 brick at impact
                        for (var the4tinybrick = -11; the4tinybrick < 20; the4tinybrick = the4tinybrick + 10) {
                            result.data[Math.floor((lasers[i].x + the4tinybrick) / 10)][Math.floor((lasers[i].y + behindpresent) / 10)] = 0;
                        }
                        lasers[i].isRemoved = true;
                        break;
                    }
                }
                break;
            //bullet travel to the left
            case 'left':
                //check behind and at the bullet because the bullet can travel over the brick(bullet travel at 15 pixel while the brick is 10px)
                for (var behindpresent = 10; behindpresent >= 0; behindpresent = behindpresent - 10) {
                    if (result.data[Math.floor((lasers[i].x + behindpresent) / 10)][Math.floor(lasers[i].y / 10)] != 0 ||
                        result.data[Math.floor(((lasers[i].x + behindpresent) / 10))][Math.floor((lasers[i].y - 1) / 10)] != 0) {
                        //destroy 4 brick at impact
                        for (var the4tinybrick = -11; the4tinybrick < 20; the4tinybrick = the4tinybrick + 10) {
                            result.data[Math.floor((lasers[i].x + behindpresent) / 10)][Math.floor((lasers[i].y + the4tinybrick) / 10)] = 0;
                        }
                        lasers[i].isRemoved = true;
                        break;
                    }
                }
                break;
            //bullet travel to the right
            case 'right':
                //check behind and at the bullet because the bullet can travel over the brick(bullet travel at 15 pixel while the brick is 10px)
                for (var behindpresent = -10; behindpresent <= 0; behindpresent = behindpresent + 10) {
                    var x1 = Math.floor((lasers[i].x + behindpresent) / 10),
                        y1 = Math.floor(lasers[i].y / 10),
                        x2 = Math.floor(((lasers[i].x + behindpresent) / 10)),
                        y2 = Math.floor((lasers[i].y - 1) / 10);
                    if (result.data[Math.floor((lasers[i].x + behindpresent) / 10)][Math.floor(lasers[i].y / 10)] != 0 ||
                        result.data[Math.floor(((lasers[i].x + behindpresent) / 10))][Math.floor((lasers[i].y - 1) / 10)] != 0) {
                        //destroy 4 brick at impact
                        for (var the4tinybrick = -11; the4tinybrick < 20; the4tinybrick = the4tinybrick + 10) {
                            result.data[Math.floor((lasers[i].x + behindpresent) / 10)][Math.floor((lasers[i].y + the4tinybrick) / 10)] = 0;
                        }
                        lasers[i].isRemoved = true;
                        break;
                    }
                }
                break;
        }
    }
}

function hitTestBot() {
    var enemy_xw,
        enemy_yh;

    for (var i = 0; i < lasers.length; i++) {
        for (var obj = 0; obj < bots.length; ++obj) {

            enemy_xw = bots[obj].getX() + bots[obj].getWidth();
            enemy_yh = bots[obj].getY() + bots[obj].getHeight();

            if (lasers[i].x < enemy_xw && lasers[i].y < enemy_yh && lasers[i].x > bots[obj].getX() && lasers[i].y > bots[obj].getY()) {
                //must emit before splice
                sockets.in('r'+session.getRoomID()).emit("bot die", { count: bots[obj].id });
                bots.splice(obj, 1);
                lasers[i].isRemoved = true;
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
