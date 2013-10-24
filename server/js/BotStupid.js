/**
 * Created with JetBrains WebStorm.
 * User: AnhTuan
 * Date: 9/20/13
 * Time: 9:40 PM
 * To change this template use File | Settings | File Templates.
 */
exports.goStraight=goStraight;
exports.BotShootInterval=BotShootInterval;
//stupid bot just go straight, if stuck turn randomly
function goStraight(bot) {
    //flag to check if hit the wall
    var flag = false;
    switch (bots[bot].direction) {
        case 'up':
            bots[bot].setY(bots[bot].getY() - bots[bot].speed);
            if (mapCollision(bots[bot].getX(), bots[bot].getY(), bots[bot].getWidth(), bots[bot].getHeight(), 'tank')) {
                bots[bot].setY(bots[bot].getY() + bots[bot].speed);
                flag = true;
            }
            break;
        case 'down':
            bots[bot].setY(bots[bot].getY() + bots[bot].speed);
            if (mapCollision(bots[bot].getX(), bots[bot].getY(), bots[bot].getWidth(), bots[bot].getHeight(), 'tank')) {
                bots[bot].setY(bots[bot].getY() - bots[bot].speed);
                flag = true;
            }
            break;
        case 'left':
            bots[bot].setX(bots[bot].getX() - bots[bot].speed);
            if (mapCollision(bots[bot].getX(), bots[bot].getY(), bots[bot].getWidth(), bots[bot].getHeight(), 'tank')) {
                bots[bot].setX(bots[bot].getX() + bots[bot].speed);
                flag = true;
            }
            break;
        case 'right':
            bots[bot].setX(bots[bot].getX() + bots[bot].speed);
            if (mapCollision(bots[bot].getX(), bots[bot].getY(), bots[bot].getWidth(), bots[bot].getHeight(), 'tank')) {
                bots[bot].setX(bots[bot].getX() - bots[bot].speed);
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

//input: bot array, interval in SECOND
//call this function outside of gameLoop
//every predefine time, stupid bot will shoot
function BotShootInterval(bots, interval) {
    if(stupidShoot) {
        for(var i=0;i<bots.length;i++) {
            if(bots[i].type=='dumb') {
                switch (bots[i].direction) {
                    case 'up':
                        shooting(bots[i].getX() + bots[i].getWidth() / 2, bots[i].getY() - 1, bots[i].direction);
                        break;
                    case 'down':
                        shooting(bots[i].getX() + bots[i].getWidth() / 2, bots[i].getY() + bots[i].getHeight() + 1, bots[i].direction);
                        break;
                    case 'right':
                        shooting(bots[i].getX() + bots[i].getWidth() + 1, bots[i].getY() + bots[i].getHeight() / 2, bots[i].direction);
                        break;
                    case 'left':
                        shooting(bots[i].getX() - 1, bots[i].getY() + bots[i].getHeight() / 2, bots[i].direction);
                        break;
                }
            }
        }
    }
    stupidShoot=false;
}