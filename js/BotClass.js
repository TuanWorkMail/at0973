
//if host draw from bots, if guest draw from remoteBots
function drawBot(host) {
    if (host == true) {
        for (var i = 0; i < bots.length; i++) {
            //ctx.drawImage(bot, bots[i].getX(), bots[i].getY());
            drawingBot(bots[i]);
        }
    } else if (host == false) {
        for (var i = 0; i < remoteBots.length; i++) {
            //ctx.drawImage(bot, remoteBots[i].getX(), remoteBots[i].getY());
            drawingBot(remoteBots[i]);
        }
    }
    //drawPath();
}

function drawingBot(object) {
    // Get context
    var context = canvas.getContext("2d"),
        halfWidth = bot_w / 2,
        halfHeight = bot_h / 2;

    // Backup before messing with the canvas
    context.save();

    // Move registration point to the center of the canvas
    context.translate(object.getX() + halfWidth, object.getY() + halfHeight);

    switch (object.direction) {
        case 'up':
            ctx.drawImage(bot, -halfWidth, -halfHeight);
            break;
        case 'down':
            // Rotate 180 degree
            context.rotate((Math.PI / 180) * 180);
            ctx.drawImage(bot, -halfWidth, -halfHeight);
            break;
        case 'left':
            // Rotate 270 degree
            context.rotate((Math.PI / 180) * 270);
            ctx.drawImage(bot, -halfWidth, -halfHeight);
            break;
        case 'right':
            // Rotate 90 degree
            context.rotate((Math.PI / 180) * 90);
            ctx.drawImage(bot, -halfWidth, -halfHeight);
            break;
    }

    // Move registration point back to the top left corner of canvas
    //context.translate(-(object.getX() + halfWidth), -(object.getY() + halfHeight));

    // restore
    context.restore();
}

	
var botCount = 0,
    pathStart,
    pathStartX,
    pathStartY,
    pathEnd,
    thePath,
    thePathX,
    thePathY,
    c,//currently headed to which target in thePath
    //enemiesGroup,

    //grid = new PF.Grid(20, 20, world),
    //finder = new PF.AStarFinder(),
    //where bot will spawn, each map have a number of predefined point
    whereSpawn = 0;

function moveBot() {
    if (host == false) return;
    createBot();
    for (var bot = 0; bot < bots.length; bot++) {
        if (bots[bot].intel == 'smart') {
            if (bots[bot].whereNow < bots[bot].pathFound.length - 1) {
                movingBot(bot);
            } else {
                bots[bot].pathFound = botRandomPath(bots[bot].getX(), bots[bot].getY());
                bots[bot].whereNow = 0;
            }
        } else if (bots[bot].intel == 'dumb') {
            goStraight(bot);
        }
        socket.emit("bot broadcast", { count: bots[bot].id, x: bots[bot].getX(), y: bots[bot].getY(), direction: bots[bot].direction });
    }
}

//stupid bot just go straight, if stuck turn randomly
function goStraight(bot) {
    //flag to check if hit the wall
    var flag = false;
    switch (bots[bot].direction) {
        case 'up':
            bots[bot].setY(bots[bot].getY() - enemySpeed);
            if (mapCollision(bots[bot].getX(), bots[bot].getY(), bot_w, bot_h, 'tank')) {
                bots[bot].setY(bots[bot].getY() + enemySpeed);
                flag = true;
            }
            break;
        case 'down':
            bots[bot].setY(bots[bot].getY() + enemySpeed);
            if (mapCollision(bots[bot].getX(), bots[bot].getY(), bot_w, bot_h, 'tank')) {
                bots[bot].setY(bots[bot].getY() - enemySpeed);
                flag = true;
            }
            break;
        case 'left':
            bots[bot].setX(bots[bot].getX() - enemySpeed);
            if (mapCollision(bots[bot].getX(), bots[bot].getY(), bot_w, bot_h, 'tank')) {
                bots[bot].setX(bots[bot].getX() + enemySpeed);
                flag = true;
            }
            break;
        case 'right':
            bots[bot].setX(bots[bot].getX() + enemySpeed);
            if (mapCollision(bots[bot].getX(), bots[bot].getY(), bot_w, bot_h, 'tank')) {
                bots[bot].setX(bots[bot].getX() - enemySpeed);
                flag = true;
            }
            break;
    }
    if(flag)
        switch (randomNumber(1, 4)) {
            case 1:
                bots[bot].direction = 'up';
                break;
            case 2:
                bots[bot].direction = 'down';
                break;
            case 3:
                bots[bot].direction = 'left';
                break;
            case 4:
                bots[bot].direction = 'right';
                break;
        }

}
//add new bot to the array
function createBot() {
    //reset spawn point when reach the last point
    if (whereSpawn == enemiesGroup.length) {
        whereSpawn = 0;
    }
    while (bots.length < botsLength && whereSpawn < enemiesGroup.length) {
        botCount++;
        // Initialise the new bot
        var x = enemiesGroup[whereSpawn].x,
            y = enemiesGroup[whereSpawn].y;
        //every 3 bot is smart
        if (botCount % 10 == 0) {
            newBot = new Bot(botCount, x, y, 'smart', botRandomPath(x, y), 0, [], '', enemySpeed);
        } else {
            newBot = new Bot(botCount, x, y, 'dumb', [], 0, [], 'down', 2);
        }
        // Add new player to the remote players array
        bots.push(newBot);
        whereSpawn++;

    }
}
//input: current location
//output: array of path to a random point
function botRandomPath(x, y) {
    var check = true;
    while (check) {
        //pathStart/end calculate base on ship_w/h, not tileWidth/Height
        pathStart = [Math.floor(x / ship_w), Math.floor(y / ship_h)];
        var random = randomNumber(0, botDestination.length - 1);
        pathEnd = [Math.floor(botDestination[random].x / ship_w), Math.floor(botDestination[random].y / ship_h)];
        if (pathStart[0] != pathEnd[0] || pathStart[1] != pathEnd[1]) {
            check = false;
        }
    }
    return pathFinder(combine16to1tile(combineTileLayer()), pathStart, pathEnd);
}

//input: interval in which random number come from
//output: random number between interval
function randomNumber(from, to) {
    return Math.floor(Math.random() * (to - from + 1) + from);
}

function drawPath() {
    for (var i = 0; i < bots.length; i++) {
        for (var rp = 0; rp < bots[i].pathFound.length; rp++) {
            switch (rp) {
                case 0:
                    spriteNum = 10; // start
                    break;
                case bots[i].pathFound.length -1:
                    spriteNum = 1; // end
                    break;
                default:
                    spriteNum = 4; // path node
                    break;
            }
            ctx.drawImage(spriteSheet, spriteNum * 32, 0, 32, 32, bots[i].pathFound[rp][0] * 32, bots[i].pathFound[rp][1] * 32, 32, 32);
        }
    }
}

//combine all the tile layers together for pathfinding
//output: 1 combined layer
function combineTileLayer() {
    var combined = [];
    for (var layer = 0; layer < tmxloader.map.layers.length; layer++) {
        if (tmxloader.map.layers[layer].name == 'overhead')
            continue;
        //first use 1 layer as the start
        //var new = old[] will create a REFERENCE, not a clone
        //have to manually clone each array in multi-dimentional array
        if (combined.length == 0) {
            for (var i = 0; i < tmxloader.map.width; i++) {
                combined[i] = tmxloader.map.layers[layer].data[i].slice(0);
            }
            continue;
        }
        //if combined is 0 and layer is not 0, combined = 1 (unwalkable)
        for (var i = 0; i < tmxloader.map.width; i++) {
            for (var j = 0; j < tmxloader.map.height; j++) {
                if (combined[i][j] == 0 && tmxloader.map.layers[layer].data[i][j] != 0) {
                    combined[i][j] = 1;
                }
            }
        }
    }
    return combined;
}
//input: the small tile layer
//combine 4x4 into 1 big tile
//check if any tile in 4x4 is unwalkable, make the big tile unwalkable too
//output: the big tile layer
function combine16to1tile(combined) {
    var combinedBig = [];
    for (var width = 0; width < tmxloader.map.width / 4; width++) {
        combinedBig[width] = [];
        for (var height = 0; height < tmxloader.map.height / 4; height++) {
            //if any of 4x4 is unwalkable, flag it unwalkable
            var flag = false;
            for (var i = 0; i < 4; i++) {
                for (var j = 0; j < 4; j++) {
                    if (combined[width * 4 + i][height * 4 + j] != 0)
                        flag = true;
                }
            }
            if (flag) {
                combinedBig[width][height] = 1;
            } else {
                combinedBig[width][height] = 0;
            }
        }
    }
    return combinedBig;
}

function drawTileLayerRaw(combinedBig) {
    for (var i = 0; i < combinedBig.length; i++) {
        for (var j = 0; j < combinedBig[i].length; j++) {
            document.getElementById('tile').innerHTML += combinedBig[j][i];
            document.getElementById('tile').innerHTML += '  ,  ';//4
        }
        document.getElementById('tile').innerHTML += '<br />';
    }
    document.getElementById('tile').innerHTML += '<br />';
}

function hitTestBot() {
    var enemy_xw,
        enemy_yh,
        check = false;

    for (var i = 0; i < lasers.length; i++) {
        for (var obj = 0; obj < bots.length; ++obj) {

            enemy_xw = bots[obj].getX() + bot_w;
            enemy_yh = bots[obj].getY() + bot_h;

            //quick patch, need to create a new delete condition, and multiplayer also
            if(i>=lasers.length)
                i=lasers.length-1;
            if(lasers.length==0)
                return;

            if (lasers[i][0] < enemy_xw && lasers[i][1] < enemy_yh && lasers[i][0] > bots[obj].getX() && lasers[i][1] > bots[obj].getY()) {
                check = true;
                //must emit before splice
                socket.emit("bot die", { count: bots[obj].id });
                bots.splice(obj, 1);
                lasers.splice(i, 1);
            }
        }
    }
}
//work in progress
//input: coordinate, direction, moving speed and type(tank/bullet)
//move an object according to input parameter
function moving(object, direction, speed, type) {

    //if (mapCollision(ship_x, ship_y, ship_w, ship_h, 'tank')) {
        //ship_x -= shipSpeed;
    //}

    switch (object.direction) {
        case 'up':
            x = - object.speed;
            break;
        case 'down':
            x = + object.speed;
            break;
        case 'left':
            y = - object.speed;
            break;
        case 'right':
            y = + object.speed;
            break;
    }
}
/*

*/