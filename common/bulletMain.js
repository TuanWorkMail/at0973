if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
    var helper = require('./helper'),
        hitTest = require('./collision_hitTest'),
        mapCollision = hitTest.mapCollision,
        Bullet = require('./dto/bullet').Bullet,
        tmxloader = require('../server/js/TMX_Engine').tmxloader,
        socket = require('../server/js/socket').socket,
        playerById = require('./player').playerById,
        broadcastToRoom = require('../server/socket-listener').broadcastToRoom,
        main = require('../server/js/main');
    exports.moveLaser = moveLaser;
    exports.shooting = shooting;
    exports.removeBullet_old = removeBullet_old;
    exports.removeBullet = removeBullet;
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
        broadcastToRoom(roomid, "new bullet", {id: _id, x: x, y: y, direction: direction, originID: originID});
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
    }
    //removeBullet();
}

function removeBullet(counter) {
    broadcastToRoom(main.session.getRoomID(), "remove bullet", {id: lasers[counter].getID() });
    lasers.splice(counter, 1);
}

function removeBullet_old() {
    //todo combine client and server
    var lasers = main.session.getLasers();
        for (var i = 0; i < lasers.length; i++) {
            if(lasers[i].getIsRemoved() || lasers[i].isRemoved) {
                broadcastToRoom(main.session.getRoomID(), "remove bullet", {id: lasers[i].getID() });
                lasers.splice(i, 1);
                i--;    // after splice i might be out of lasers.length, so take it down a notch
            }
        }

}