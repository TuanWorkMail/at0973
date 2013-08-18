/**
 * Storage Object for Viewport
 */
function Viewport(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.halfWidth = Math.floor(width / 2);
    this.halfHeight = Math.floor(height / 2);
}


/**
 * Map drawing function
 */
function draw() {

    //clear(); 
    viewport.x = viewport_x //- viewport.halfWidth;
    viewport.y = viewport_y //- viewport.halfHeight;

    if (viewport.x < 0) viewport.x = 0;
    if (viewport.y < 0) viewport.y = 0;
    //number of tiles in map multiply by tile width(pixel) minus viewport width(pixel)
    if (viewport.x > tmxloader.map.width * tmxloader.map.tileWidth - viewport.width) viewport.x = tmxloader.map.width * tmxloader.map.tileWidth - viewport.width;
    if (viewport.y > tmxloader.map.height * tmxloader.map.tileHeight - viewport.height) viewport.y = tmxloader.map.height * tmxloader.map.tileHeight - viewport.height;

    //for every layer in map
    for (var i = 0; i < tmxloader.map.layers.length; i++) {
        //for every horizontal tile in viewport
        for (var xp = 0; xp < (viewport.width / tmxloader.map.tileWidth + 1) ; ++xp) {
            //for every vertical tile in viewport
            for (var yp = 0; yp < viewport.height / tmxloader.map.tileHeight ; ++yp) {
                //find the position of the first tile within viewport
                var tile_x = Math.floor(viewport.x / tmxloader.map.tileWidth) + xp;
                var tile_y = Math.floor(viewport.y / tmxloader.map.tileHeight) + yp;

                if (tile_x >= 0 && (tile_x < tmxloader.map.width) && tile_y >= 0 && (tile_y < tmxloader.map.height)) {
                    //if there is a tile at X Y
                    if (tmxloader.map.layers[i].data[tile_x][tile_y] != 0) {

                        var gid = tmxloader.map.layers[i].data[tile_x][tile_y];

                        //number of tiles per row of tilesheet
                        var NoOfTiles = tmxloader.map.tilesets[0].width / tmxloader.map.tilesets[0].tileWidth;

                        //gid%NoOfTiles: position in a row
                        //gid%NoOfTiles-1: first sprite have X = 1 - 1 = 0
                        //(gid%NoOfTiles-1)*tmxloader.map.tilesets[0].tileWidth: X coordinate of the sprite
                        var spriteX = (gid % NoOfTiles - 1) * tmxloader.map.tilesets[0].tileWidth;
                        //Math.floor(gid/NoOfTiles): 10 per row, so 25 is on 25/10=2.5=> row 2
                        var spriteY = Math.floor(gid / NoOfTiles) * tmxloader.map.tilesets[0].tileHeight;

                        //draw the sprite at X Y, place it at its place according to the viewport
                        ctx.drawImage(spriteSheet, spriteX, spriteY, tmxloader.map.tilesets[0].tileWidth, tmxloader.map.tilesets[0].tileHeight, (xp * tmxloader.map.tileWidth) - (viewport.x % tmxloader.map.tileWidth), (yp * tmxloader.map.tileHeight) - (viewport.y % tmxloader.map.tileHeight), tmxloader.map.tileWidth, tmxloader.map.tileHeight);
                    }
                }
            }
        }
    }
}

function findLayerByName(name) {
    for (var i = 0; i < tmxloader.map.layers.length; i++) {
        if (tmxloader.map.layers[i].name == name) {
            return i;
        }
    }
}
		
//check ship collide with map
function mapCollision() {
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

