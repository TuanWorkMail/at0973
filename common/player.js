if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
    var util = require('util'),
        socket = require('../server/js/socket').socket,
        tmxloader = require('../server/js/TMX_Engine').tmxloader,
        mapCollision = require('./collision_hitTest').mapCollision,
        Session = require('./dto/session').Session,
        remotePlayers = require('../server/main').remotePlayers,
        dto = {};
    dto.Player = require('./dto/Player').Player;
} else {
    var remotePlayers = session.getRemotePlayers();
}
var playerLength = 0;

function checkHitPoint () {
    for (var i = 0; i < remotePlayers.length; ++i) {
        if (remotePlayers[i].getHitPoint() < 0 && alive) {
            console.log('player ' + remotePlayers[i].getUsername() + ' die');
            checkLive(remotePlayers[i]);
        }
    }
}

//This function runs whenever the player's ship hits an enemy and either subtracts a life or sets the alive variable to false if the player runs out of lives
function checkLive(object) {
    object.setLive(object.getLive() - 1);
    console.log('live: ' + object.getLive());
    if (object.getLive() > 0) {
        reset('');
    } else if (object.getLive() <= 0) {
        //alive = false;
        //continueLoop = false;
        var id = [], score = [];
        for(var i=0;i<2;i++) {
            id[i]=remotePlayers[i].getUserID();
            score[i]=remotePlayers[i].getLive();
        }
        socket.emit("end match", { id1: id[0], id2:id[1], score1: score[0], score2: score[1] });
        console.log('id1: '+id[0]+', id2:'+id[1]+', score1: '+score[0]+', score2: '+score[1]);
        reset('end match');
    }
}

function reset(para) {
    for (var obj = 0; obj < bots.length; ++obj) {
        socket.emit("bot die", { count: bots[obj].id });
    }
    bots.length = 0;
    whereSpawn = 0;
    lasers.length = 0;
    // respawn player
    playerLength = 0;
    var objGroup = tmxloader.map.objectgroup['spawn'].objects;
    for (var i = 0; i < remotePlayers.length; i++) {
        var x = objGroup[playerLength % objGroup.length].x,
            y = objGroup[playerLength % objGroup.length].y,
            direction;
        if (playerLength % objGroup.length == 0)
            direction = 'up';
        else
            direction = 'down';
        remotePlayers[i].setX(x);
        remotePlayers[i].setY(y);
        remotePlayers[i].setDirection(direction);
        remotePlayers[i].setHitPoint(10);
        if(para=='end match') remotePlayers[i].reset();
        socket.emit("move player", { id: remotePlayers[i].getSocketID(), username: remotePlayers[i].getUsername(), x: x, y: y, direction: direction });
        playerLength++;
    }
}

function movingPlayer() {
    if (typeof require !== 'undefined' && typeof exports !== 'undefined')
        remotePlayers = require('../server/main').remotePlayers;
    for(var i = 0;i < remotePlayers.length; i++) {
        if(remotePlayers[i].getMoving())
        switch (remotePlayers[i].getDirection()) {
            case 'right':
                remotePlayers[i].setX(remotePlayers[i].getX() + remotePlayers[i].getSpeed());
                if (mapCollision(remotePlayers[i].getX(), remotePlayers[i].getY(), remotePlayers[i].getWidth(), remotePlayers[i].getHeight(), 'tank')) {
                    remotePlayers[i].setX(remotePlayers[i].getX() - remotePlayers[i].getSpeed());
                }
                break;
            case 'left':
                remotePlayers[i].setX(remotePlayers[i].getX() - remotePlayers[i].getSpeed());
                if (mapCollision(remotePlayers[i].getX(), remotePlayers[i].getY(), remotePlayers[i].getWidth(), remotePlayers[i].getHeight(), 'tank')) {
                    remotePlayers[i].setX(remotePlayers[i].getX() + remotePlayers[i].getSpeed());
                }
                break;
            case 'up':
                remotePlayers[i].setY(remotePlayers[i].getY() - remotePlayers[i].getSpeed());
                if (mapCollision(remotePlayers[i].getX(), remotePlayers[i].getY(), remotePlayers[i].getWidth(), remotePlayers[i].getHeight(), 'tank')) {
                    remotePlayers[i].setY(remotePlayers[i].getY() + remotePlayers[i].getSpeed());
                }
                break;
            case 'down':
                remotePlayers[i].setY(remotePlayers[i].getY() + remotePlayers[i].getSpeed());
                if (mapCollision(remotePlayers[i].getX(), remotePlayers[i].getY(), remotePlayers[i].getWidth(), remotePlayers[i].getHeight(), 'tank')) {
                    remotePlayers[i].setY(remotePlayers[i].getY() - remotePlayers[i].getSpeed());
                }
                break;
            default :
                console.log('movingPlayer: un-recognized direction');
        }
    }
}

function addPlayer(socketID, username, userID) {
    //copied from Multiplayer.js
    //where to spawn ship
    var spawn = tmxloader.map.objectgroup['spawn'].objects;
    var x = spawn[playerLength % spawn.length].x,
        y = spawn[playerLength % spawn.length].y,
        direction;
    if (playerLength % spawn.length == 0)
        direction = 'up';
    else
        direction = 'down';
    var player = addNewPlayer(socketID, username, x, y, direction);
    player.setUserID(userID);
    playerLength++;
    return player;
}

//add new player to array
function addNewPlayer(id, username, x, y, direction) {
    console.log("New player connected: " + id);

    // Initialise the new player
    var newPlayer = new dto.Player(x, y, direction);
    newPlayer.setSocketID(id);
    newPlayer.setUsername(username);

    // Add new player to the remote players array
    remotePlayers.push(newPlayer);

    for(var i=0;i<remotePlayers.length;i++)
        if(remotePlayers[i].getUsername()==username)
            return remotePlayers[i];
    return false;
}

// Find player by ID
function playerById(id) {
    for (var i = 0; i < remotePlayers.length; i++) {
        if (remotePlayers[i].getSocketID() == id)
            return remotePlayers[i];
    }
    return false;
}

//If an arrow key is being pressed, moves the ship in the right direction
function moveShip() {
    //if ship cross the map border, throw it back in
    if (ship_x <= 0) ship_x = 0;
    if ((ship_x + ship_w) >= width) ship_x = width - ship_w;
    if (ship_y <= 0) ship_y = 0;
    if ((ship_y + ship_h) >= height) ship_y = height - ship_h;
    //THERE ALREADY DIRECTION NO NEED FOR LASTKEY, AND CHANGE DIRECTION TO STRING NOT SOME NUMBER
    /*if (rightKey == false && leftKey == false && upKey == false && downKey == false) {
        if (ship_x % (ship_w / 2) != 0 || ship_y % (ship_h / 2) != 0) {
            //debug
            //console.log(ship_x + ' ' + ship_x % (ship_w / 2) + ' ' + ship_y + ' ' + ship_y % (ship_h / 2));
            switch (direction) {
                case 'right':
                    ship_x += shipSpeed;
                    if (mapCollision(ship_x, ship_y, ship_w, ship_h, 'tank')) {
                        ship_x -= shipSpeed;
                    }
                    break;
                case 'left':
                    ship_x -= shipSpeed;
                    if (mapCollision(ship_x, ship_y, ship_w, ship_h, 'tank')) {
                        ship_x += shipSpeed;
                    }
                    break;
                case 'up':
                    ship_y -= shipSpeed;
                    if (mapCollision(ship_x, ship_y, ship_w, ship_h, 'tank')) {
                        ship_y += shipSpeed;
                    }
                    break;
                case 'down':
                    ship_y += shipSpeed;
                    if (mapCollision(ship_x, ship_y, ship_w, ship_h, 'tank')) {
                        ship_y -= shipSpeed;
                    }
                    break;
            }
        }
    }*/
    if (rightKey) {
        direction = 'right';
        ship_x += shipSpeed;
        if (mapCollision(ship_x, ship_y, ship_w, ship_h, 'tank')) {
            ship_x -= shipSpeed;
        }
    } else if (leftKey) {
        direction = 'left';
        ship_x -= shipSpeed;
        if (mapCollision(ship_x, ship_y, ship_w, ship_h, 'tank')) {
            ship_x += shipSpeed;
        }
    } else if (upKey) {
        direction = 'up';
        ship_y -= shipSpeed;
        if (mapCollision(ship_x, ship_y, ship_w, ship_h, 'tank')) {
            ship_y += shipSpeed;
        }
    } else if (downKey) {
        direction = 'down';
        ship_y += shipSpeed;
        if (mapCollision(ship_x, ship_y, ship_w, ship_h, 'tank')) {
            ship_y -= shipSpeed;
        }
    }
}

if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
    exports.checkHitPoint = checkHitPoint;
    exports.movingPlayer = movingPlayer;
    exports.addPlayer = addPlayer;
    //exports.remotePlayers = remotePlayers;
    exports.playerById = playerById;
}