var botSmart = require('./BotSmart');
//where bot will spawn, each map have a number of predefined point
var whereSpawn = 0,
    bots = [],
    botsLength = 2;
/*
var pathStart,
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
*/

exports.moveBot=function () {
    createBot();
    for (var bot = 0; bot < bots.length; bot++) {
        if (bots[bot].type == 'smart') {
            if (bots[bot].whereNow < bots[bot].pathFound.length - 1) {
                botSmart.movingBot(bots[bot]);
            } else {
                bots[bot].pathFound = botSmart.botRandomPath(bots[bot]);
                bots[bot].whereNow = 0;
            }
        } else if (bots[bot].type == 'dumb') {
            require('./BotStupid').goStraight(bots[bot]);
        }
        var socket = require('./socket').socket;
        socket.emit("bot broadcast", { count: bots[bot].id, x: bots[bot].getX(), y: bots[bot].getY(), direction: bots[bot].direction, type: bots[bot].type });
    }
}
//add new bot to the array
function createBot() {
    var enemiesGroup = require('./TMX_Engine').tmxloader.map.objectgroup['bot'].objects,
        Bot = require('./Bot').Bot;
    //reset spawn point when reach the last point
    if (whereSpawn == enemiesGroup.length) {
        whereSpawn = 0;
    }
    while (bots.length < botsLength && whereSpawn < enemiesGroup.length) {
        // Initialise the new bot
        var x = enemiesGroup[whereSpawn].x,
            y = enemiesGroup[whereSpawn].y;
        //every 3 bot is smart
        if (whereSpawn % 4 == 0) {
            newBot = new Bot(whereSpawn, x, y, 'smart');
            newBot.pathFound = botSmart.botRandomPath(newBot);
        } else {
            newBot = new Bot(whereSpawn, x, y, 'dumb');
        }
        // Add new player to the remote players array
        bots.push(newBot);
        whereSpawn++;

    }
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
exports.bots = bots;