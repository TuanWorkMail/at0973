/// <reference path="dto/Player.js" />
var checkHitPoint = function () {
    for (var i = 0; i < remotePlayers.length; ++i) {
        if (remotePlayers[i].getHitPoint() < 0) {
            checkLives(remotePlayers[i]);
        }
    }
}

//This function runs whenever the player's ship hits an enemy and either subtracts a life or sets the alive variable to false if the player runs out of lives
function checkLive(object) {
    object.setLive(object.getLive() - 1);
    if (object.getLive() > 0) {
        reset();
    } else if (object.getLive() == 0) {
        alive = false;
    }
}

//This simply resets the ship and enemies to their starting positions
function reset() {
    //where to spawn ship
    objGroup = tmxloader.map.objectgroup['spawn'].objects;

    ship_x = objGroup[1].x;
    ship_y = objGroup[1].y;
    direction = 'down';

    var newPlayer = new dto.Player(objGroup[1].x, objGroup[1].y, 'down');

    socket.emit("move player", { x: ship_x, y: ship_y, direction: direction });

    //debug
    //console.log("Spawn: X=" + ship_x + "; Y=" + ship_y);
}