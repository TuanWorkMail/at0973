if(typeof require !== 'undefined' && typeof exports !== 'undefined') {
    var tmxloader = require('../../server/js/TMX_Engine').tmxloader;
    exports.Drop = Drop;
}
function Drop(_id, _type, _x, _y) {
    var id = _id,
        type = _type,
        x = _x,
        y = _y,
        width = tmxloader.map.objectgroup['dimension'].objects[0].width,
        height = tmxloader.map.objectgroup['dimension'].objects[0].height;
    function getID(){return id}function setID(para){id=para}
    function getType(){return type}function setType(para){type=para}
    function getX(){return x}function setX(para){x=para}
    function getY(){return y}function setY(para){y=para}
    function getWidth(){return width}function setWidth(para){width=para}
    function getHeight(){return height}function setHeight(para){height=para}
    return {
        getID:getID,setID:setID,
        getType:getType,setType:setType,
        getX:getX,setX:setX,
        getY:getY,setY:setY,
        getWidth:getWidth,setWidth:setWidth,
        getHeight:getHeight,setHeight:setHeight
    }
}