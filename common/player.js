if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
    var util = require('util'),
        main = require('../server/js/main'),
        broadcastToRoom = require('../server/socket-listener').broadcastToRoom,
        tmxloader = require('../server/js/TMX_Engine').tmxloader,
        Session = require('../common/dto/session').Session,
        dto = {},
        character = {},
        helper = require('./helper'),
        debug = helper.debug,
        reset = require('./session.restart').reset,
        spawnPlayer = require('./player.add-new').spawnPlayer,
        characterMoving = require('./character.moving').character,
        teamSumKill = require('../server/js/team.sum-kill');
    dto.Player = require('./dto/Player').Player;
    character.moving = characterMoving.moving;
}
function checkHitPoint () {
    var remotePlayers = session.getRemotePlayers(),
        check = false;
    for (var i = 0; i < remotePlayers.length; ++i) {
        if (remotePlayers[i].getHitPoint() <= 0 && alive) {
            debug.log('player ' + remotePlayers[i].getUsername() + ' die');
            remotePlayers[i].setLive(remotePlayers[i].getLive() - 1);
            debug.log('live: ' + remotePlayers[i].getLive());
            remotePlayers[i].setDeaths(remotePlayers[i].getDeaths()+1);
            for(var k=0; k<remotePlayers.length; k++) {
                if(remotePlayers[i].getLastOriginID()===remotePlayers[k].getSocketID()) {
                    remotePlayers[k].setPlayersKilled(remotePlayers[k].getPlayersKilled()+1);
                    remotePlayers[k].setScore(remotePlayers[k].getScore()+5);
                }
            }
            check = true;
            checkLive(remotePlayers[i]);
        }
    }
    if(check)teamSumKill.totalKill();
}
function checkLive(object) {
    var remotePlayers = session.getRemotePlayers();
    //if (object.getLive() > 0) {
    if(true){
        var result = spawnPlayer(object.getSpawnPoint());
        object.setX(result.x);
        object.setY(result.y);
        object.setDirection(result.direction);
        object.setHitPoint(10);
        broadcastToRoom(main.session.getRoomID(), 'move character', {id: object.getID(),
            x: object.getX(), y: object.getY(), direction: object.getDirection()});
        //reset('');
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
        debug.log('id1: '+id[0]+', id2:'+id[1]+', score1: '+score[0]+', score2: '+score[1]);
        reset('end match');
    }
}
function movingPlayer() {
    var remotePlayers = session.getRemotePlayers();
    for (var i = 0; i < remotePlayers.length; i++) {
        if (remotePlayers[i].getMoving()){
            if(!character.moving(remotePlayers[i], 'tank')){
                broadcastToRoom(main.session.getRoomID(), 'move character', {id: remotePlayers[i].getID(),
                    x: remotePlayers[i].getX(), y: remotePlayers[i].getY(),
                    direction: remotePlayers[i].getDirection(), moving: false});
            }
        }
    }
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
if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
    exports.checkHitPoint = checkHitPoint;
    exports.movingPlayer = movingPlayer;
    exports.playerById = playerById;
}