if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
    var helper = require('./helper'),
        hitTest = require('./collision_hitTest'),
        mapCollision = hitTest.mapCollision,
        Bullet = require('./dto/bullet').Bullet,
        tmxloader = require('../server/js/TMX_Engine').tmxloader,
        socket = require('../server/js/socket').socket;
} else {
    lasers = [];
}
//input: x,y,direction of the bullet
//push new bullet into array and emit to server
//client only
function shooting(x,y,direction) {
    var id = helper.createUUID('xxxx');
    var newBullet = new Bullet(id, x, y, direction);
    lasers.push(newBullet);
    return id;
}


//If we're drawing lasers on the canvas, this moves them in the canvas
function moveLaser() {
    for (var i = 0; i < lasers.length; i++) {
        var laser = lasers[i];
        switch (laser.getDirection()){
            case 'up':
                laser.y -= laser.getSpeed();
                laser.setY(laser.getY() - laser.getSpeed());
                break;
            case 'down':
                laser.y += laser.getSpeed();
                laser.setY(laser.getY() + laser.getSpeed());
                break;
            case 'right':
                laser.x += laser.getSpeed();
                laser.setX(laser.getX() + laser.getSpeed());
                break;
            case 'left':
                laser.x -= laser.getSpeed();
                laser.setX(laser.getX() - laser.getSpeed());
                break;
        }
        if (mapCollision(laser.getX(), laser.getY(), 4, 4, 'bullet')) {
            laser.setIsRemoved(true);
        } else if (laser.getY() < 0 || laser.getY() > tmxloader.map.height * tmxloader.map.tileHeight || laser.getX() < 0 || laser.getX() > tmxloader.map.width * tmxloader.map.tileWidth) {
            laser.setIsRemoved(true);
        }
    }
    removeBullet(lasers);
}

function renderBulletDestroyed(bulletObject) {

}

function removeBullet(lasers) {
    if(lasers.length==0) return;
    var endOfArray = false;
    while(!endOfArray) {
        for (var i = 0; i < lasers.length; i++) {
            if(i==lasers.length-1) {
                endOfArray=true;
            }
            if(lasers[i].getIsRemoved()) {
                if(lasers[i].getType()==='piercing') return;
                lasers.splice(i, 1);
                //get out of loop
                i = lasers.length;
            } else if(lasers[i].isRemoved) {
                if(lasers[i].getType()==='piercing') return;
                lasers.splice(i, 1);
                //get out of loop
                i = lasers.length;
            }
        }
    }
}

if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
    exports.moveLaser = moveLaser;
}