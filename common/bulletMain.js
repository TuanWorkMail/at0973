if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
    var helper = require('./helper'),
        hitTest = require('./collision_hitTest'),
        mapCollision = hitTest.mapCollision,
        Bullet = require('./dto/bullet').Bullet,
        tmxloader = require('../server/js/TMX_Engine').tmxloader,
        socket = require('../server/js/socket').socket,
        playerById = require('./player').playerById,
        sockets = require('../server/js/socket').sockets;
    exports.moveLaser = moveLaser;
    exports.shooting = shooting;
}
function shooting(x,y,direction, originID, bulletid, roomid) {
    var _id;
    if(typeof bulletid==='undefined' || bulletid == ''){
        _id = helper.createUUID('xxxx')
    } else {
        _id = bulletid;
    }
    var newBullet = new Bullet(_id, x, y, direction);
    newBullet.setOriginID(originID);
    lasers.push(newBullet);
    if(typeof roomid!=='undefined' && typeof require !== 'undefined' && typeof exports !== 'undefined'){
        sockets.in('r'+roomid).emit("new bullet", { id: _id, x: x, y: y, direction: direction, originID: originID });
    }
    return _id;
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
            if(lasers[i].getIsRemoved() || lasers[i].isRemoved) {
                //if(result.players.getBulletType()==='piercing') continue;
                lasers.splice(i, 1);
                //get out of loop
                i = lasers.length;
            }
        }
    }
}