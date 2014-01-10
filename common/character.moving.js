if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
    var mapCollision = require('./collision_hitTest').mapCollision,
        debug = require('./helper').debug;
}
var character = {};
character.moving = function (object, type) {
    var newX = object.getX(),
        newY = object.getY();
    switch (object.getDirection()) {
        case 1:     newX += object.getSpeed(); break;     //right
        case -1:    newX -= object.getSpeed(); break;     //left
        case 0:     newY -= object.getSpeed(); break;     //up
        case 2:     newY += object.getSpeed(); break;     //down
        default :
            debug.log('moving: not a direction: '+object.getDirection());
    }
    if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
        if (!mapCollision(newX, newY, object.getWidth(), object.getHeight(), type)) {
            object.setX(newX);
            object.setY(newY);
            return true;
        }
    } else {
        object.setX(newX);
        object.setY(newY);
    }
    return false;
};
if (typeof require !== 'undefined' && typeof exports !== 'undefined') exports.character = character;