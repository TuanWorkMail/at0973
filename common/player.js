if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
    var util = require('util'),
        main = require('../server/main'),
        broadcastToRoom = require('../server/js/socket').broadcastToRoom,
        tmxloader = require('../server/js/TMX_Engine').tmxloader,
        mapCollision = require('./collision_hitTest').mapCollision,
        Session = require('../common/dto/session').Session,
        lastRoomID = 0,                                             // auto increment roomID
        dto = {};
    dto.Player = require('./dto/Player').Player;
}
function checkHitPoint () {
    var remotePlayers = session.getRemotePlayers();
    for (var i = 0; i < remotePlayers.length; ++i) {
        if (remotePlayers[i].getHitPoint() <= 0 && alive) {
            util.log('player ' + remotePlayers[i].getUsername() + ' die');
            remotePlayers[i].setLive(remotePlayers[i].getLive() - 1);
            util.log('live: ' + remotePlayers[i].getLive());
            checkLive(remotePlayers[i]);
        }
    }
}
function checkLive(object) {
    var remotePlayers = session.getRemotePlayers();
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
        var data = { id1: id[0], id2:id[1], score1: score[0], score2: score[1] };
        main.onEndMatch(data);
        util.log('id1: '+id[0]+', id2:'+id[1]+', score1: '+score[0]+', score2: '+score[1]);
        reset('end match');
    }
}
function reset(para) {
    var remotePlayers = session.getRemotePlayers();
    for (var obj = 0; obj < bots.length; ++obj) {
        broadcastToRoom(session.getRoomID(),"bot die", { count: bots[obj].id });
    }
    bots.length = 0;
    whereSpawn = 0;
    lasers.length = 0;
    // respawn player
    for (var i = 0; i < remotePlayers.length; i++) {
        var result = spawnPlayer(i),
            x = result.x,
            y = result.y,
            direction = result.direction;
        remotePlayers[i].setX(x);
        remotePlayers[i].setY(y);
        remotePlayers[i].setDirection(direction);
        remotePlayers[i].setHitPoint(10);
        if(para=='end match') remotePlayers[i].setLive(2);
        broadcastToRoom(session.getRoomID(),"move player", { id: remotePlayers[i].getSocketID(),
            username: remotePlayers[i].getUsername(), x: x, y: y, direction: direction });
    }
}
function newPlayer(socketID, username, userID) {
    var result = spawnPlayer(allSession[allSession.length-1].getRemotePlayers().length),
        x = result.x,
        y = result.y,
        direction = result.direction;
    var player = addNewPlayer(socketID, username, x, y, direction);
    if (!player) return false;
    player.newPlayer.setUserID(userID);
    player.newPlayer.setPosition(result.name);
    return {newPlayer: player.newPlayer, roomID: player.roomID};
}
function spawnPlayer(position) {
    var spawn = tmxloader.map.objectgroup['spawn'].objects,
        x = spawn[position % spawn.length].x,
        y = spawn[position % spawn.length].y,
        name = spawn[position % spawn.length].name,
        direction;
    if (name == '0')
        direction = 'up';
    else
        direction = 'down';
    return {x: x, y: y, direction: direction, name: name}
}
//add new player to array
function addNewPlayer(id, username, x, y, direction) {
    // Initialise the new player
    var roomID = 0,
        newPlayer = new dto.Player(x, y, direction);
    newPlayer.setSocketID(id);
    newPlayer.setUsername(username);
    if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
        if(allSession[allSession.length-1].getRemotePlayers().length>=2) {
            roomID = newRoomID();
            newSession = new Session(roomID);
            allSession.push(newSession);
        }
        var remotePlayers = allSession[allSession.length - 1].getRemotePlayers();
        roomID = allSession[allSession.length - 1].getRoomID();
    } else {
        //WHY remotePlayers CHANGE, THIS IS A QUICK PATCH, NEED TO LOOK INTO IT
        //theres already remoteplayer up top, but i need to get it again here
        var remotePlayers = session.getRemotePlayers();
    }
    remotePlayers.push(newPlayer);
    return {newPlayer: remotePlayers[remotePlayers.indexOf(newPlayer)], roomID: roomID};
}
var lastDirection = 'left';
function movingPlayer() {
    var remotePlayers = session.getRemotePlayers();
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
function newRoomID() {
    lastRoomID++;
    return (lastRoomID);
}
// Find player by ID
function playerById(socketid) {
    var _allSession = [];
    if(typeof allSession==='undefined')
        _allSession.push(session);
    else
        _allSession = allSession;
    for (var j=0; j<_allSession.length; j++) {
        var remotePlayers = _allSession[j].getRemotePlayers();
        for (var i = 0; i < remotePlayers.length; i++) {
            if (remotePlayers[i].getSocketID() == socketid)
            // HACKY SOLUTION RETURN LASERS HERE
                return {players:remotePlayers[i],roomID: _allSession[j].getRoomID(), lasers: _allSession[j].getLasers()};
        }

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
    exports.newPlayer = newPlayer;
    exports.playerById = playerById;
}