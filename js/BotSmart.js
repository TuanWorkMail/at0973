//input: bot array
//move the bot according to there foundPath
function movingBot(bots) {
    //bot current coordianate is calculate base on ship_w/h, not tileWidth/height
    var pixelX = bots.pathFound[bots.whereNow + 1][0] * ship_w,
        pixelY = bots.pathFound[bots.whereNow + 1][1] * ship_h,
        differenceX = bots.getX() - pixelX,
        differenceY = bots.getY() - pixelY;
    //go vertically
    if (differenceX == 0 && differenceY != 0) {
        //down or up
        if (differenceY > 0) {
            bots.setY(bots.getY() - bots.speed);
            bots.direction = 'up';
        } else {
            bots.setY(bots.getY() + bots.speed);
            bots.direction = 'down';
        }
        //go horizontally
    } else if (differenceY == 0 && differenceX != 0) {
        //right or left
        if (differenceX > 0) {
            bots.setX(bots.getX() - bots.speed);
            bots.direction = 'left';
        } else {
            bots.setX(bots.getX() + bots.speed);
            bots.direction = 'right';
        }
    } else {
        bots.whereNow++;
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