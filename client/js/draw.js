var viewport,
    viewport_x = 0,
    viewport_y = 0,
    canvas,
    ctx,
    canvasBg,
    contextBg,
    canvasOverhead,
    contextOverhead,
    spriteSheet,
    spriteSheet2;
function createStackedCanvases() {
    var width = tmxloader.map.width * tmxloader.map.tileWidth,
        height = tmxloader.map.height * tmxloader.map.tileHeight;
    canvas = document.createElement("canvas");
    ctx = canvas.getContext("2d");
    document.body.appendChild(canvas);
    canvas.style.position = 'absolute';
    canvas.style.zIndex = 1;
    canvas.width = width;
    canvas.height = height;
    canvasBg = document.createElement("canvas");
    contextBg = canvasBg.getContext("2d");
    document.body.appendChild(canvasBg);
    canvasBg.style.position = 'absolute';
    canvasBg.style.zIndex = 0;
    canvasBg.width = width;
    canvasBg.height = height;
    contextBg.fillStyle = "#000";
    contextBg.fillRect(0, 0, width, height);
    canvasOverhead = document.createElement("canvas");
    contextOverhead = canvasOverhead.getContext("2d");
    document.body.appendChild(canvasOverhead);
    canvasOverhead.style.position = 'absolute';
    canvasOverhead.style.zIndex = 2;
    canvasOverhead.width = width;
    canvasOverhead.height = height;

    viewport = new Viewport(0, 0, width, height);
    spriteSheet = new Image();
    spriteSheet.src = "../common/map/" + tmxloader.map.tilesets[0].src;
    spriteSheet2 = new Image();
    spriteSheet2.src = "images/tank5.png";
}
function Viewport(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.halfWidth = Math.floor(width / 2);
    this.halfHeight = Math.floor(height / 2);
}
function drawMap() {

    //clear(); 
    viewport.x = viewport_x //- viewport.halfWidth;
    viewport.y = viewport_y //- viewport.halfHeight;

    if (viewport.x < 0) viewport.x = 0;
    if (viewport.y < 0) viewport.y = 0;
    //number of tiles in map multiply by tile width(pixel) minus viewport width(pixel)
    if (viewport.x > tmxloader.map.width * tmxloader.map.tileWidth - viewport.width)
        viewport.x = tmxloader.map.width * tmxloader.map.tileWidth - viewport.width;
    if (viewport.y > tmxloader.map.height * tmxloader.map.tileHeight - viewport.height)
        viewport.y = tmxloader.map.height * tmxloader.map.tileHeight - viewport.height;

    //for every layer in map
    for (var i = 0; i < tmxloader.map.layers.length; i++) {

        if(tmxloader.map.layers[i].name == 'overhead' || tmxloader.map.layers[i].name == 'destructible') continue;

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
                        contextBg.drawImage(spriteSheet, spriteX, spriteY, tmxloader.map.tilesets[0].tileWidth,
                            tmxloader.map.tilesets[0].tileHeight, (xp * tmxloader.map.tileWidth) -
                                (viewport.x % tmxloader.map.tileWidth), (yp * tmxloader.map.tileHeight) -
                                (viewport.y % tmxloader.map.tileHeight), tmxloader.map.tileWidth, tmxloader.map.tileHeight);
                    }
                }
            }
        }
    }
}

function drawLayer(layer, context) {
    if(layer.length==0) return;

    viewport.x = viewport_x //- viewport.halfWidth;
    viewport.y = viewport_y //- viewport.halfHeight;

    if (viewport.x < 0) viewport.x = 0;
    if (viewport.y < 0) viewport.y = 0;
    //number of tiles in map multiply by tile width(pixel) minus viewport width(pixel)
    if (viewport.x > tmxloader.map.width * tmxloader.map.tileWidth - viewport.width)
        viewport.x = tmxloader.map.width * tmxloader.map.tileWidth - viewport.width;
    if (viewport.y > tmxloader.map.height * tmxloader.map.tileHeight - viewport.height)
        viewport.y = tmxloader.map.height * tmxloader.map.tileHeight - viewport.height;

        //for every horizontal tile in viewport
        for (var xp = 0; xp < (viewport.width / tmxloader.map.tileWidth + 1) ; ++xp) {
            //for every vertical tile in viewport
            for (var yp = 0; yp < viewport.height / tmxloader.map.tileHeight ; ++yp) {
                //find the position of the first tile within viewport
                var tile_x = Math.floor(viewport.x / tmxloader.map.tileWidth) + xp;
                var tile_y = Math.floor(viewport.y / tmxloader.map.tileHeight) + yp;

                if (tile_x >= 0 && (tile_x < tmxloader.map.width) && tile_y >= 0 && (tile_y < tmxloader.map.height)) {
                    //if there is a tile at X Y
                    if (layer[tile_x][tile_y] != 0) {

                        var gid = layer[tile_x][tile_y];

                        //number of tiles per row of tilesheet
                        var NoOfTiles = tmxloader.map.tilesets[0].width / tmxloader.map.tilesets[0].tileWidth;

                        //gid%NoOfTiles: position in a row
                        //gid%NoOfTiles-1: first sprite have X = 1 - 1 = 0
                        //(gid%NoOfTiles-1)*tmxloader.map.tilesets[0].tileWidth: X coordinate of the sprite
                        var spriteX = (gid - 1) % NoOfTiles * tmxloader.map.tilesets[0].tileWidth;
                        //Math.floor(gid/NoOfTiles): 10 per row, so 25 is on 25/10=2.5=> row 2
                        var spriteY = Math.floor(gid / NoOfTiles) * tmxloader.map.tilesets[0].tileHeight;

                        //draw the sprite at X Y, place it at its place according to the viewport
                        context.drawImage(spriteSheet, spriteX, spriteY, tmxloader.map.tilesets[0].tileWidth,
                            tmxloader.map.tilesets[0].tileHeight, (xp * tmxloader.map.tileWidth) -
                                (viewport.x % tmxloader.map.tileWidth), (yp * tmxloader.map.tileHeight) -
                                (viewport.y % tmxloader.map.tileHeight), tmxloader.map.tileWidth, tmxloader.map.tileHeight);
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

    if(typeof width==='undefined' || typeof height === 'undefined') {
        ctx.drawImage(spriteSheet2, spriteX, spriteY, 40, 40, x, y, 40, 40);
    } else {
        ctx.drawImage(spriteSheet2, spriteX, spriteY, width, height, x, y, width, height);
    }
}
//Clears the canvas so it can be updated
function clearCanvas() {
    var width = tmxloader.map.width * tmxloader.map.tileWidth,
        height = tmxloader.map.height * tmxloader.map.tileHeight;
    ctx.clearRect(0, 0, width, height);
    //ctx.fillStyle = "#000";
    //ctx.fillRect(0, 0, width, height);
}
//If there are lasers in the lasers array, then this will draw them on the canvas
function drawLaser() {
    for (var i = 0; i < lasers.length; i++) {
        ctx.fillStyle = '#f00';
        ctx.fillRect(lasers[i].x - 2, lasers[i].y - 2, 4, 4);
    }
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
function drawingBot(object) {
    if(object.getType() == 'dumb') {
        switch(object.direction) {
            case 'right':
                drawTile(5, object.getX(), object.getY());
                break;
            case 'left':
                drawTile(8, object.getX(), object.getY());
                break;
            case 'up':
                drawTile(7, object.getX(), object.getY());
                break;
            case 'down':
                drawTile(6, object.getX(), object.getY());
                break;
            default :
                console.log(object.getDirection()+' is not direction');
        }
    } else {
        switch(object.direction) {
            case 'right':
                drawTile(22, object.getX(), object.getY());
                break;
            case 'left':
                drawTile(24, object.getX(), object.getY());
                break;
            case 'up':
                drawTile(23, object.getX(), object.getY());
                break;
            case 'down':
                drawTile(21, object.getX(), object.getY());
                break;
            default :
                console.log(object.getDirection()+' is not direction');
        }
    }
}
function drawStartScreen() {
    var width = tmxloader.map.width * tmxloader.map.tileWidth,
        height = tmxloader.map.height * tmxloader.map.tileHeight;
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 50px VT323';
    ctx.fillText('Canvas Shooter', width / 2 - 150, height / 2);
    ctx.font = 'bold 20px VT323';
    ctx.fillText('Click to Play', width / 2 - 56, height / 2 + 30);
    ctx.fillText('Use arrow keys to move', width / 2 - 100, height / 2 + 60);
    ctx.fillText('Use the x key to shoot', width / 2 - 100, height / 2 + 90);
    canvasOverhead.addEventListener('click', gameStart, false);
}
function drawEndScreen() {
    var width = tmxloader.map.width * tmxloader.map.tileWidth,
        height = tmxloader.map.height * tmxloader.map.tileHeight;
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 50px VT323';
    ctx.fillText('Game Over!', (width / 2) - 60, height / 2);
    ctx.fillRect((width / 2) - 60, (height / 2) + 10, 100, 40);
    ctx.fillStyle = '#000';
    ctx.fillText('Continue?', (width / 2) - 60, (height / 2) + 35);
    canvasOverhead.addEventListener('click', continueButton, false);
}
function drawEagle() {
    var drawpoint = tmxloader.map.objectgroup['eagle'].objects;
    var eagle = new Image();
    eagle.src = "images/eagle.png";
    for(var i=0; i<drawpoint.length; i++) {
        var x = drawpoint[i].x,
            y = drawpoint[i].y;
        contextBg.drawImage(eagle, 0, 0, 40, 40, x, y, 40, 40);
    }
}