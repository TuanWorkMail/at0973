function Character(id, x, y, direction, speed, type){
    var gid,
        name,
        moving;
    this.getDirection = function(){return direction};
    this.setDirection = function(para){direction=para};
    this.getType = function(){return type};
    this.setType = function(para){type=para};
    this.getX=function () { return x; };
    this.setX=function (para) { x = para; };
    this.getY=function getY() { return y; };
    this.setY=function setY(para) { y = para; };
    this.getID=function getID() { return id; };
    this.setID=function (para) { id = para; };
    this.getGid=function () { return gid; };
    this.setGid=function (para) { gid = para; };
    this.getSpeed=function () { return speed; };
    this.setSpeed=function (para) { speed = para; };
    this.getMoving=function (){return moving};
    this.setMoving=function (para){moving=para};
    this.getName=function (){return name};
    this.setName=function (para){name=para};
}