if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
    var helper = require('./helper'),
        hitTest = require('./collision_hitTest'),
        mapCollision = hitTest.mapCollision,
        Bullet = require('./dto/bullet').Bullet,
        tmxloader = require('../server/js/TMX_Engine').tmxloader,
        socket = require('../server/js/socket').socket,
        playerById = require('./player').playerById,
        broadcastToRoom = require('../server/socket-listener').broadcastToRoom,
        main = require('../server/js/main'),
        character = {},
        characterMoving = require('./character.moving').character;
    character.moving = characterMoving.moving;
    exports.moveLaser = moveLaser;
    exports.shooting = shooting;
    exports.removeBullet_old = removeBullet_old;
    exports.removeBullet = removeBullet;
}
function shooting(x,y,direction, originID, bulletid, roomid) {
    var _id;
    if(typeof bulletid==='undefined' || bulletid == ''){
        _id = helper.createUUID();
    } else {
        _id = bulletid;
    }
    var newBullet = new Bullet(_id, x, y, direction);
    newBullet.setOriginID(originID);
    lasers.push(newBullet);
    if(typeof roomid!=='undefined' && typeof require !== 'undefined' && typeof exports !== 'undefined'){
        broadcastToRoom(roomid, "new character", {id: _id, x: x, y: y,
            direction: direction, speed: newBullet.getSpeed(), type: 'bullet', moving: true});
    }
    return _id;
}
function moveLaser() {
    if (typeof require !== 'undefined' && typeof exports !== 'undefined') lasers = main.session.getLasers();
    for (var i = 0; i < lasers.length; i++) {
        var check = character.moving(lasers[i], 'bullet');
        if(!check) lasers[i].setIsRemoved(true);
    }
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
                broadcastToRoom(main.session.getRoomID(), "remove character", {id: lasers[i].getID() });
                lasers.splice(i, 1);
                i--;    // after splice i might be out of lasers.length, so take it down a notch
            }
        }

}