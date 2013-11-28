var botSmart = require('./BotSmart'),
    helper = require('../../common/helper'),
    botsLength = 99;
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
        if (bots[bot].getType() == 'smart') {
            if (bots[bot].whereNow < bots[bot].pathFound.length - 1) {
                botSmart.movingBot(bots[bot]);
            } else {
                bots[bot].pathFound = botSmart.botRandomPath(bots[bot]);
                bots[bot].whereNow = 0;
            }
        } else if (bots[bot].getType() == 'dumb') {
            require('./BotStupid').goStraight(bots[bot]);
        }
        var sockets = require('./socket').sockets;
        sockets.in('r'+session.getRoomID()).emit("bot broadcast", { id: bots[bot].id, x: bots[bot].getX(),
            y: bots[bot].getY(), direction: bots[bot].getDirection(), type: bots[bot].type });
    }
}
//add new bot to the array
function createBot() {
    var enemiesGroup = require('./TMX_Engine').tmxloader.map.objectgroup['bot'].objects,
        Bot = require('./../../common/dto/Bot').Bot;
    if (botsLength > enemiesGroup.length){
        botsLength = enemiesGroup.length;
    }
    while (bots.length < botsLength) {
        var whereSpawn = session.getWhereSpawn();
        //reset spawn point when reach the last point
        if (whereSpawn >= enemiesGroup.length) {
            whereSpawn = 0;
        }
        // Initialise the new bot
        var id = helper.createUUID('xxxx'),
            x = enemiesGroup[whereSpawn].x,
            y = enemiesGroup[whereSpawn].y,
            newBot;
        console.log(whereSpawn);
        //every 3 bot is smart
        if (whereSpawn % 2 == 0) {
            newBot = new Bot(id, x, y, 'dumb');
        } else {
            newBot = new Bot(id, x, y, 'smart');
            newBot.pathFound = botSmart.botRandomPath(newBot);
        }
        bots.push(newBot);
        session.setWhereSpawn(whereSpawn+1);
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
            ctx.drawImage(spriteSheet, spriteNum * 32, 0, 32, 32,
                bots[i].pathFound[rp][0] * 32, bots[i].pathFound[rp][1] * 32, 32, 32);
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
//exports.bots = bots;