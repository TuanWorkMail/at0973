function Character(id, x, y, gid, speed, moving, name){
    function getX() { return x; }
    function setX(para) { x = para; }
    function getY() { return y; }
    function setY(para) { y = para; }
    function getID() { return id; }
    function setID(para) { id = para; }
    function getGid() { return gid; }
    function setGid(para) { gid = para; }
    function getSpeed() { return speed; }
    function setSpeed(para) { speed = para; }
    function getMoving(){return moving}
    function setMoving(para){moving=para}
    function getName(){return name}
    function setName(para){name=para}
    return{
        getX: getX,
        setX: setX,
        getY: getY,
        setY: setY,
        getID: getID,
        setID: setID,
        getSpeed: getSpeed,
        setSpeed: setSpeed,
        getGid:getGid,setGid:setGid,
        getMoving:getMoving,setMoving:setMoving,
        getName:getName,setName:setName
    }
}