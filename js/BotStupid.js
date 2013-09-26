/**
 * Created with JetBrains WebStorm.
 * User: AnhTuan
 * Date: 9/20/13
 * Time: 9:40 PM
 * To change this template use File | Settings | File Templates.
 */

//input: bot array, interval in SECOND
//call this function outside of gameLoop
//every predefine time, stupid bot will shoot
function BotShootInterval(bots, interval) {
    if(stupidShoot) {
        for(var i=0;i<bots.length;i++) {
            if(bots[i].intel=='dumb') {
                switch (bots[i].direction) {
                    case 'up':
                        shooting(bots[i].getX() + bot_w / 2, bots[i].getY() - 1, bots[i].direction);
                        break;
                    case 'down':
                        shooting(bots[i].getX() + bot_w / 2, bots[i].getY() + bot_h + 1, bots[i].direction);
                        break;
                    case 'right':
                        shooting(bots[i].getX() + bot_w + 1, bots[i].getY() + bot_h / 2, bots[i].direction);
                        break;
                    case 'left':
                        shooting(bots[i].getX() - 1, bots[i].getY() + bot_h / 2, bots[i].direction);
                        break;
                }
            }
        }
    }
    stupidShoot=false;
}