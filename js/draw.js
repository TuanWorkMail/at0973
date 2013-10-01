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

//Clears the canvas so it can be updated
function clearCanvas() {
    ctx.clearRect(0, 0, width, height);
}

//If an arrow key is being pressed, moves the ship in the right direction
function drawShip() {
    //if ship cross the map border, throw it back in
    if (ship_x <= 0) ship_x = 0;
    if ((ship_x + ship_w) >= width) ship_x = width - ship_w;
    if (ship_y <= 0) ship_y = 0;
    if ((ship_y + ship_h) >= height) ship_y = height - ship_h;
    //THERE ALREADY DIRECTION NO NEED FOR LASTKEY, AND CHANGE DIRECTION TO STRING NOT SOME NUMBER
    /*if (rightKey == false && leftKey == false && upKey == false && downKey == false) {
        if (ship_x % (ship_w / 2) != 0 || ship_y % (ship_h / 2) != 0) {
            //debug
            //console.log(ship_x + ' ' + ship_x % (ship_w / 2) + ' ' + ship_y + ' ' + ship_y % (ship_h / 2));
            switch (direction) {
                case 'right':
                    ship_x += shipSpeed;
                    if (mapCollision(ship_x, ship_y, ship_w, ship_h, 'tank')) {
                        ship_x -= shipSpeed;
                    }
                    break;
                case 'left':
                    ship_x -= shipSpeed;
                    if (mapCollision(ship_x, ship_y, ship_w, ship_h, 'tank')) {
                        ship_x += shipSpeed;
                    }
                    break;
                case 'up':
                    ship_y -= shipSpeed;
                    if (mapCollision(ship_x, ship_y, ship_w, ship_h, 'tank')) {
                        ship_y += shipSpeed;
                    }
                    break;
                case 'down':
                    ship_y += shipSpeed;
                    if (mapCollision(ship_x, ship_y, ship_w, ship_h, 'tank')) {
                        ship_y -= shipSpeed;
                    }
                    break;
            }
        }
    }*/
    if (rightKey) {
        direction = 'right';
        ship_x += shipSpeed;
        if (mapCollision(ship_x, ship_y, ship_w, ship_h, 'tank')) {
            ship_x -= shipSpeed;
        }
    } else if (leftKey) {
        direction = 'left';
        ship_x -= shipSpeed;
        if (mapCollision(ship_x, ship_y, ship_w, ship_h, 'tank')) {
            ship_x += shipSpeed;
        }
    } else if (upKey) {
        direction = 'up';
        ship_y -= shipSpeed;
        if (mapCollision(ship_x, ship_y, ship_w, ship_h, 'tank')) {
            ship_y += shipSpeed;
        }
    } else if (downKey) {
        direction = 'down';
        ship_y += shipSpeed;
        if (mapCollision(ship_x, ship_y, ship_w, ship_h, 'tank')) {
            ship_y -= shipSpeed;
        }
    }

    if (direction == 'right') {
        ctx.drawImage(ship_right, ship_x, ship_y);
    } else if (direction == 'left') {
        ctx.drawImage(ship_left, ship_x, ship_y);
    } if (direction == 'up') {
        ctx.drawImage(ship, ship_x, ship_y);
    } else if (direction == 'down') {
        ctx.drawImage(ship_down, ship_x, ship_y);
    }
}




