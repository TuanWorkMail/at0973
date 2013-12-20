
function Bullet(id, x, y, direction) {
    var isRemoved = false,
        originID = 0,
        speed = 15,
        damage = 4;

    function getID() { return id; } function setID(para) { id = para; }
    function getX() { return x; } function setX(para) { x = para; }
    function getY() { return y; } function setY(para) { y = para; }
    function getDirection() { return direction; } function setDirection(para) { direction = para; }
    function getIsRemoved() { return isRemoved; } function setIsRemoved(para) { isRemoved = para; }
    function getOriginID() {return originID} function setOriginID(para) {originID = para}
    function getSpeed(){return speed} function setSpeed(para){speed=para}
    function getDamage(){return damage}function setDamage(para){damage=para}

    return {
        getID: getID, setID: setID,
        getX: getX, setX: setX,
        getY: getY, setY: setY,
        getDirection: getDirection, setDirection: setDirection,
        getIsRemoved: getIsRemoved, setIsRemoved: setIsRemoved,
        getOriginID: getOriginID, setOriginID: setOriginID,
        getSpeed: getSpeed, setSpeed: setSpeed,
        getDamage: getDamage, setDamage: setDamage,

        x: x,
        y: y,
        direction: direction,
        isRemoved: isRemoved
    }
}
if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
    exports.Bullet = Bullet;
}