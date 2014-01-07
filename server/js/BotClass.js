var botSmart = require('./BotSmart'),
    helper = require('../../common/helper'),
    tmxloader = require('./TMX_Engine').tmxloader,
    botsLimit = 99,
    alternate = 'stupid';
/*
var pathStart,
    pathStartX,
    pathStartY,
    pathEnd,
    thePath,
    thePathX,
    thePathY,
    c,//currently headed to which target in thePath
    //botGroup,

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
        require('../socket-listener').broadcastToRoom(session.getRoomID(),"bot broadcast", { id: bots[bot].id,
            x: bots[bot].getX(), y: bots[bot].getY(), direction: bots[bot].getDirection(), type: bots[bot].type });
    }
}
//add new bot to the array
function createBot() {
    var botGroup = tmxloader.map.objectgroup['bot'].objects,
        bossGroup = [],
        Bot = require('./../../common/dto/Bot').Bot,
        maxLength;
    if(typeof tmxloader.map.objectgroup['boss'] !== "undefined"){
        bossGroup = tmxloader.map.objectgroup['boss'].objects;
    } else if(alternate!=='stupid') {
        alternate='stupid';
    }
    maxLength = botGroup.length+bossGroup.length;
    if (botsLimit > maxLength){
        botsLimit = maxLength;
    }
    while (bots.length < botsLimit) {
        var whereSpawn = session.getWhereSpawn(),
            bossCount = session.getBossCount(),
            botLength = session.getBotLength(),
            bossLength = session.getBossLength();
        var id = helper.createUUID(),
            x, y, type, newBot;
        if(alternate==='stupid'){
            if (whereSpawn >= botGroup.length) {
                whereSpawn = 0;
            }
            x = botGroup[whereSpawn].x;
            y = botGroup[whereSpawn].y;
            type = 'dumb';
            session.setWhereSpawn(whereSpawn+1);
            alternate = 'smart';
        } else {
            if(bossGroup.length !== 0){
            if (bossCount >= bossGroup.length){
                bossCount = 0;
            }
            x = bossGroup[bossCount].x;
            y = bossGroup[bossCount].y;
            type = 'smart';
            session.setBossCount(bossCount+1);
            }
            alternate = 'stupid';
        }
        newBot = new Bot(id, x, y, type);
        if(type==='smart') {
            newBot.pathFound = botSmart.botRandomPath(newBot);
        }
        bots.push(newBot);
    }
}
function botCheckHP(){
    for(var obj=0;obj<bots.length;obj++){
        if(bots[obj].getHitPoint()<=0){
            // CREATE DROP---------------------------------------
            if(bots[obj].getType()==='smart'){
                var id = helper.createUUID(),
                    type = 'piercing',
                    x = bots[obj].getX(),
                    y = bots[obj].getY(),
                    newDrop = new Drop(id, type, x, y);
                session.getDrop().push(newDrop);
                broadcastToRoom(session.getRoomID(),"new drop",{id: id,type: type,x: x,y: y});
            }
            for(var k=0; k<remotePlayers.length; k++) {
                if(lasers[i].getOriginID()===remotePlayers[k].getSocketID()) {
                    remotePlayers[k].setBotKill(remotePlayers[k].getBotKill()+1);
                    if(bots[obj].getType()==='smart') {
                        remotePlayers[k].setScore(remotePlayers[k].getScore()+1);
                    } else {
                        remotePlayers[k].setScore(remotePlayers[k].getScore()+5);
                    }
                    debug.log('player '+remotePlayers[k].getUsername()+' bot kill: '
                        +remotePlayers[k].getBotKill()+' score: '+remotePlayers[k].getScore());
                }
            }
            // MOVE THE ABOVE OUT-----------------------------------
            broadcastToRoom(session.getRoomID(),"bot die",{ count: bots[obj].id });
            bots.splice(obj, 1);
        }
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