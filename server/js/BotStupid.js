/**
 * Created with JetBrains WebStorm.
 * User: AnhTuan
 * Date: 9/20/13
 * Time: 9:40 PM
 * To change this template use File | Settings | File Templates.
 */
var mapCollision = require('./../../common/collision_hitTest').mapCollision,
    shooting = require('../../common/bulletMain').shooting,
    character = require('../../common/character.moving').character;
//stupid bot just go straight, if stuck turn randomly
exports.goStraight = function (object) {
    //flag to check if hit the wall
    var flag = character.moving(object, 'tank');
    if(!flag) {
        var direction = require('./../../common/helper').randomNumber(0, 3);
        if(direction===3) object.setDirection(-1);    //left
        else object.setDirection(direction);
    }
};

//input: bot array, interval in SECOND
//call this function outside of gameLoop
//every predefine time, stupid bot will shoot
exports.BotShootInterval=function (bots) {
    for(var i=0;i<bots.length;i++) {
        if(bots[i].type=='dumb') {
            var x, y;
            switch (bots[i].getDirection()) {
                case 0:     //up
                    x = bots[i].getX() + bots[i].getWidth() / 2;
                    y = bots[i].getY() - 1;
                    break;
                case 2:     //down
                    x = bots[i].getX() + bots[i].getWidth() / 2;
                    y = bots[i].getY() + bots[i].getHeight() + 1;
                    break;
                case 1:     //right
                    x = bots[i].getX() + bots[i].getWidth() + 1;
                    y = bots[i].getY() + bots[i].getHeight() / 2;
                    break;
                case -1:    //left
                    x = bots[i].getX() - 1;
                    y = bots[i].getY() + bots[i].getHeight() / 2;
                    break;
            }
            shooting(x, y, bots[i].getDirection(), bots[i].getID(), '', session.getRoomID());
        }
    }
};