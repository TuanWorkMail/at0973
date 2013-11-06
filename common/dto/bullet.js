/**
 * Created with JetBrains WebStorm.
 * User: AnhTuan
 * Date: 9/26/13
 * Time: 2:33 PM
 * To change this template use File | Settings | File Templates.
 */

function Bullet(id, x, y, direction, isRemoved) {
    /*
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.isRemoved = isRemoved;
    */
    var x = x,
        y = y,
        direction = direction,
        isRemoved = isRemoved;

    function getID() { return id; }
    function setID(para) { id = para; }
    function getX() { return x; }
    function setX(para) { x = para; }
    function getY() { return y; }
    function setY(para) { y = para; }
    function getDirection() { return direction; }
    function setDirection(para) { direction = para; }
    function getIsRemoved() { return isRemoved; }
    function setIsRemoved(para) { isRemoved = para; }

    return {
        getID: getID,
        setID: setID,
        getX: getX,
        setX: setX,
        getY: getY,
        setY: setY,
        getDirection: getDirection,
        setDirection: setDirection,
        getIsRemoved: getIsRemoved,
        setIsRemoved: setIsRemoved,

        x: x,
        y: y,
        direction: direction,
        isRemoved: isRemoved,
    }
}
if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
    exports.Bullet = Bullet;
}