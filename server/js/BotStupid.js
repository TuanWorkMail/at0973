/**
 * Created with JetBrains WebStorm.
 * User: AnhTuan
 * Date: 9/20/13
 * Time: 9:40 PM
 * To change this template use File | Settings | File Templates.
 */
var mapCollision = require('./../../common/collision_hitTest').mapCollision,
    stupidShoot=false;
//stupid bot just go straight, if stuck turn randomly
exports.goStraight = function (object) {
    //flag to check if hit the wall
    var flag = false;
    switch (object.direction) {
        case 'up':
            object.setY(object.getY() - object.speed);
            if (mapCollision(object.getX(), object.getY(), object.getWidth(), object.getHeight(), 'tank')) {
                object.setY(object.getY() + object.speed);
                flag = true;
            }
            break;
        case 'down':
            object.setY(object.getY() + object.speed);
            if (mapCollision(object.getX(), object.getY(), object.getWidth(), object.getHeight(), 'tank')) {
                object.setY(object.getY() - object.speed);
                flag = true;
            }
            break;
        case 'left':
            object.setX(object.getX() - object.speed);
            if (mapCollision(object.getX(), object.getY(), object.getWidth(), object.getHeight(), 'tank')) {
                object.setX(object.getX() + object.speed);
                flag = true;
            }
            break;
        case 'right':
            object.setX(object.getX() + object.speed);
            if (mapCollision(object.getX(), object.getY(), object.getWidth(), object.getHeight(), 'tank')) {
                object.setX(object.getX() - object.speed);
                flag = true;
            }
            break;
    }
    if(flag)
        switch (require('./../../common/helper').randomNumber(1, 4)) {
            case 1:
                object.direction = 'up';
                break;
            case 2:
                object.direction = 'down';
                break;
            case 3:
                object.direction = 'left';
                break;
            case 4:
                object.direction = 'right';
                break;
        }

}

//input: bot array, interval in SECOND
//call this function outside of gameLoop
//every predefine time, stupid bot will shoot
exports.BotShootInterval=function (bots, interval) {
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

exports.stupidShoot=stupidShoot;