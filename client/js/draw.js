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
function drawMap() {

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
                        var spriteX = (gid - 1) % NoOfTiles * tmxloader.map.tilesets[0].tileWidth;
                        //Math.floor(gid/NoOfTiles): 10 per row, so 25 is on 25/10=2.5=> row 2
                        var spriteY = Math.floor(gid / NoOfTiles) * tmxloader.map.tilesets[0].tileHeight;

                        //draw the sprite at X Y, place it at its place according to the viewport
                        contextBg.drawImage(spriteSheet, spriteX, spriteY, tmxloader.map.tilesets[0].tileWidth, tmxloader.map.tilesets[0].tileHeight, (xp * tmxloader.map.tileWidth) - (viewport.x % tmxloader.map.tileWidth), (yp * tmxloader.map.tileHeight) - (viewport.y % tmxloader.map.tileHeight), tmxloader.map.tileWidth, tmxloader.map.tileHeight);
                    }
                }
            }
        }
    }
}

function temporaryDrawOverhead() {

    //clear();
    viewport.x = viewport_x //- viewport.halfWidth;
    viewport.y = viewport_y //- viewport.halfHeight;

    if (viewport.x < 0) viewport.x = 0;
    if (viewport.y < 0) viewport.y = 0;
    //number of tiles in map multiply by tile width(pixel) minus viewport width(pixel)
    if (viewport.x > tmxloader.map.width * tmxloader.map.tileWidth - viewport.width) viewport.x = tmxloader.map.width * tmxloader.map.tileWidth - viewport.width;
    if (viewport.y > tmxloader.map.height * tmxloader.map.tileHeight - viewport.height) viewport.y = tmxloader.map.height * tmxloader.map.tileHeight - viewport.height;

    var i = findLayerByName('overhead');

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
                        var spriteX = (gid - 1) % NoOfTiles * tmxloader.map.tilesets[0].tileWidth;
                        //Math.floor(gid/NoOfTiles): 10 per row, so 25 is on 25/10=2.5=> row 2
                        var spriteY = Math.floor(gid / NoOfTiles) * tmxloader.map.tilesets[0].tileHeight;

                        //draw the sprite at X Y, place it at its place according to the viewport
                        contextOverhead.drawImage(spriteSheet, spriteX, spriteY, tmxloader.map.tilesets[0].tileWidth, tmxloader.map.tilesets[0].tileHeight, (xp * tmxloader.map.tileWidth) - (viewport.x % tmxloader.map.tileWidth), (yp * tmxloader.map.tileHeight) - (viewport.y % tmxloader.map.tileHeight), tmxloader.map.tileWidth, tmxloader.map.tileHeight);
                    }
                }
            }
        }

}
function drawTile(gid, x, y, width, height) {
    //number of tiles per row of tilesheet
    var NoOfTiles = 320 / 40;

    //gid%NoOfTiles: position in a row
    //gid%NoOfTiles-1: first sprite have X = 1 - 1 = 0
    //(gid%NoOfTiles-1)*tmxloader.map.tilesets[0].tileWidth: X coordinate of the sprite
    var spriteX = (gid - 1) % NoOfTiles * 40;
    //Math.floor(gid/NoOfTiles): 10 per row, so 25 is on 25/10=2.5=> row 2
    var spriteY = Math.floor(gid / NoOfTiles) * 40;

    if(width===undefined || height === undefined) {
        //draw the sprite at X Y, place it at its place according to the viewport
        ctx.drawImage(spriteSheet2, spriteX, spriteY, 40, 40, x, y, 40, 40);
    } else {
        ctx.drawImage(spriteSheet2, spriteX, spriteY, width, height, x, y, width, height);
    }
}
//Clears the canvas so it can be updated
function clearCanvas() {
    ctx.clearRect(0, 0, width, height);
    //ctx.fillStyle = "#000";
    //ctx.fillRect(0, 0, width, height);
}
function drawPlayer() {
    for (var i = 0; i < remotePlayers.length; i++) {
        var direction = remotePlayers[i].getDirection(),
            x = remotePlayers[i].getX(),
            y = remotePlayers[i].getY();
        if (direction=='right') {
            drawTile(1, x, y);
        } else if (direction=='left') {
            drawTile(4, x, y);
        } if (direction=='up') {
            drawTile(3, x, y);
        } else if (direction=='down') {
            drawTile(2, x, y);
        }
    }
}
//if host draw from bots, if guest draw from remoteBots
function drawBot() {
    var array;
    if (host == true) {
        array = bots;
    } else if (host == false) {
        array = remoteBots;
    }
    for (var i = 0; i < array.length; i++) {
        //drawByDirection(array[i]);
        drawingBot(array[i]);
    }
    //drawPath();
}
function drawingBot(object) {
    if(object.getType() == 'dumb') {
        if (object.direction == 'right') {
            drawTile(5, object.getX(), object.getY());
        } else if (object.direction == 'left') {
            drawTile(8, object.getX(), object.getY());
        } if (object.direction == 'up') {
            drawTile(7, object.getX(), object.getY());
        } else if (object.direction == 'down') {
            drawTile(6, object.getX(), object.getY());
        }
    } else {
        if (object.direction == 'right') {
            drawTile(22, object.getX(), object.getY());
        } else if (object.direction == 'left') {
            drawTile(24, object.getX(), object.getY());
        } if (object.direction == 'up') {
            drawTile(23, object.getX(), object.getY());
        } else if (object.direction == 'down') {
            drawTile(21, object.getX(), object.getY());
        }
    }
}

function drawByDirection(object) {
    var halfWidth = object.getWidth() / 2,
        halfHeight = object.getHeight() / 2;

    // Backup before messing with the canvas
    ctx.save();

    // Move registration point to the center of the canvas
    ctx.translate(object.getX() + halfWidth, object.getY() + halfHeight);

    switch (object.direction) {
        case 'up':
            ctx.drawImage(object.getImage(), -halfWidth, -halfHeight);
            break;
        case 'down':
            // Rotate 180 degree
            ctx.rotate((Math.PI / 180) * 180);
            ctx.drawImage(object.getImage(), -halfWidth, -halfHeight);
            break;
        case 'left':
            // Rotate 270 degree
            ctx.rotate((Math.PI / 180) * 270);
            ctx.drawImage(object.getImage(), -halfWidth, -halfHeight);
            break;
        case 'right':
            // Rotate 90 degree
            ctx.rotate((Math.PI / 180) * 90);
            ctx.drawImage(object.getImage(), -halfWidth, -halfHeight);
            break;
    }

    // Move registration point back to the top left corner of canvas
    //ctx.translate(-(object.getX() + halfWidth), -(object.getY() + halfHeight));

    // restore
    ctx.restore();
}