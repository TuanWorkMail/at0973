if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
    var mapCollision = require('./collision_hitTest').mapCollision,
        debug = require('./helper').debug;
}
var character = {};
character.moving = function (array) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].getMoving()){
            var newX = array[i].getX(),
                newY = array[i].getY();
            switch (array[i].getDirection()) {
                case 1:     newX += array[i].getSpeed(); break;     //right
                case -1:    newX -= array[i].getSpeed(); break;     //left
                case 0:     newY -= array[i].getSpeed(); break;     //up
                case 2:     newY += array[i].getSpeed(); break;     //down
                default :
                    debug.log('moving: un-recognized direction');
            }
            if (!mapCollision(newX, newY, array[i].getWidth(), array[i].getHeight(), 'tank')) {
                array[i].setX(newX);
                array[i].setY(newY);
            }
        }
    }
};
if (typeof require !== 'undefined' && typeof exports !== 'undefined') exports.character = character;