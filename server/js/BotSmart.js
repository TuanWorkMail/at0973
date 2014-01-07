var tmxloader = require('./TMX_Engine').tmxloader,
    helper = require('../../common/helper');
//input: bot array
//move the bot according to there foundPath
exports.movingBot = function (bots) {
    if(bots.pathFound.length===0) return;
    //bot current coordianate is calculate base on ship_w/h, not tileWidth/height
    var pixelX = bots.pathFound[bots.whereNow + 1][0] * bots.getWidth(),
        pixelY = bots.pathFound[bots.whereNow + 1][1] * bots.getHeight(),
        differenceX = bots.getX() - pixelX,
        differenceY = bots.getY() - pixelY;
    //go vertically
    if (differenceX == 0 && differenceY != 0) {
        //down or up
        if (differenceY > 0) {
            bots.setY(bots.getY() - bots.speed);
            bots.setDirection(0);//up
        } else {
            bots.setY(bots.getY() + bots.speed);
            bots.setDirection(2);//down
        }
        //go horizontally
    } else if (differenceY == 0 && differenceX != 0) {
        //right or left
        if (differenceX > 0) {
            bots.setX(bots.getX() - bots.speed);
            bots.setDirection(-1);//left
        } else {
            bots.setX(bots.getX() + bots.speed);
            bots.setDirection(1);//right
        }
    } else {
        bots.whereNow++;
    }
};

//input: current location
//output: array of path to a random point
exports.botRandomPath = function (object) {
    var check = true,
        count = 0,
        randomNumber = require('./../../common/helper').randomNumber,
        pathFinder = require('./BotPathFinder').pathFinder,
        botDestination;
    if(typeof tmxloader.map.objectgroup['destination']==='undefined')
        return [];
    else
        botDestination = tmxloader.map.objectgroup['destination'].objects;
    while (check && count < 1) {
        //pathStart/end calculate base on ship_w/h, not tileWidth/Height
        pathStart = [Math.floor(object.getX() / object.getWidth()), Math.floor(object.getY() / object.getHeight())];
        var random = randomNumber(0, botDestination.length - 1);
        pathEnd = [Math.floor(botDestination[random].x / object.getWidth()), Math.floor(botDestination[random].y / object.getHeight())];
        if (pathStart[0] != pathEnd[0] || pathStart[1] != pathEnd[1]) {
            check = false;
        } else {
            count++;
        }
    }
    return pathFinder(session.getCombinedLayer(), pathStart, pathEnd);
}

