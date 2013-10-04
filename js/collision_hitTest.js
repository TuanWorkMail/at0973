//iput:x,y,w,h,type(bullet/tank)
function mapCollision(x, y, w, h, type) {
    var xTile = Math.floor(x / tmxloader.map.tileWidth),
        yTile = Math.floor(y / tmxloader.map.tileHeight),
        //NOT(number of tiles) horizontally(w) or vertically(h)
        wNOT = w / tmxloader.map.tileWidth,
        hNOT = h / tmxloader.map.tileWidth;
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

function hitTestBot() {
    var enemy_xw,
        enemy_yh,
        check = false;

    for (var i = 0; i < lasers.length; i++) {
        for (var obj = 0; obj < bots.length; ++obj) {

            enemy_xw = bots[obj].getX() + bot_w;
            enemy_yh = bots[obj].getY() + bot_h;


            if (lasers[i].x < enemy_xw && lasers[i].y < enemy_yh && lasers[i].x > bots[obj].getX() && lasers[i].y > bots[obj].getY()) {
                check = true;
                //must emit before splice
                socket.emit("bot die", { count: bots[obj].id });
                bots.splice(obj, 1);
                lasers[i].isRemoved = true;
            }
        }
    }
}

//Runs a couple of loops to see if any of the lasers have hit any of the enemies
function hitTestPlayer() {
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

    var layerID = findLayerByName('obstacle');

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
