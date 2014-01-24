//RESTART server for changes to applied
var mapName = 'classic_small';
debugLogLevel = 0;
exports.minimumNoPlayer = 2;
exports.mapName = mapName;
exports.score = 1;
setTimeout = setTimeout;
function init() {
    //create a new blank session
    var newSession = new Session(0);
    allSession.push(newSession);
    setTimeout(loop, 1000);
}
function loop() {
    tick(function(){
    var now = Date.now(),
        d1second = now - last1second;
    for(var j=0; j<allSession.length; j++) {
        session = allSession[j];
        bots = allSession[j].bots;
        lasers = allSession[j].getLasers();
        //todo all socket event QUEUE to process in loop(), make allSession private
        exports.session = allSession[j];
        checkPlayerCount();
        //exports.inputQueue = inputQueue;//todo move inputQueue to socket-listener to trigger export when have new info
        if(!allSession[j].getStart()) continue;

        moveKeyDown();
        moveKeyUp();
        player.movingPlayer();
        bulletMain.moveLaser();
        bulletMain.removeBullet_old();
        botClass.moveBot();//ERROR smartbot on classic bug cannot move
        shootDestroyBrick();

        if(d1second>1000) session.setCombinedLayer(combine16to1tile());
        hitTest.hitTestBot();
        //TODO: change 1000 to 500 will throw error,
        if(now-lastBotTick>=1000) botStupid.BotShootInterval(bots);
        hitTest.hitTestPlayer();
        hitTest.hitTestEagle();
        dropcheck.collideDrop();
        player.checkHitPoint();
        botClass.botCheckHP();
        if(allSession[j].getIsRemoved()) {
            allSession.splice(j, 1);
            j--;
        }
    }
    if(d1second>1000) last1second = now;
    if(now-lastBotTick>=1000) lastBotTick = now;
    });
    setTimeout(loop, 1000/60);
}
exports.queuePlayerInput = function(socketID, eventName, data){
    session.getInputQueue().push(new InputQueue(socketID, eventName, data));
};
exports.onEndMatch = function(data) {
    var that = this,
        wonID,
        point = data.score1-data.score2;
    if(data.id1==data.id2) {
        debug.log('same id, app error, not stored on database');
        return;
    }
    if(data.score1-data.score2>0)
        wonID= data.id1;
    else if(data.score2-data.score1>0)
        wonID=data.id2;
    else {
        debug.log('no winner specify, app error, not stored on database');
        return;
    }
    //connection.connect();
    connection.query('INSERT INTO `tank5`.`matchhistory`(`Competitor1`,`Competitor2`,`PointLeft`)VALUES(?,?,?);',
        [data.id1,data.id2,point], function (err, rows, fields) {
        if (err) util.log(err);
    });
    connection.query('UPDATE `tank5`.`user` SET `Won` = `Won`+1 WHERE `ID` = ?;', [wonID], function (err, rows, fields) {
        if (err) util.log(err);
    });
    //connection.end();
};
exports.sessionByRoomID = function(roomID){
    for(var i=0; i<allSession.length; i++){
        if(allSession[i].getRoomID()===roomID) return allSession[i];
    }
    return false;       // no session found
};
exports.getSession = function(that){
    for (var key in that.manager.rooms) {
        if (that.manager.rooms.hasOwnProperty(key)) {
            if(key!=='') var roomID = key.replace('/r','');
        }
    }
    for(var i=0; i<allSession.length; i++){
        if(allSession[i].getRoomID()==roomID) return allSession[i];     // compare string to number use == instead of ===
    }
    return false;
};
// LOCAL SCOPE
var util = require("util"),
    helper = require('../../common/helper'),
    botClass = require('./BotClass.js'),
    botStupid = require('./BotStupid'),
    hitTest = require('../../common/collision_hitTest'),
    sockets = require('./socket').sockets,
    player = require('../../common/player'),
    Session = require('../../common/dto/session').Session,
    bulletMain = require('../../common/bulletMain'),
    Bullet = require('../../common/dto/bullet').Bullet,
    dropcheck = require('./drop-check'),
    combine16to1tile = require('../../common/combine-layer').combine16to1tile,
    checkPlayerCount = require('./session.check-player-count.js').checkPlayerCount,
    debug = require('../../common/helper').debug,
    shootDestroyBrick = require('../../common/shoot-destroy-brick').shootDestroyBrick,
    InputQueue = require('./InputQueue').InputQueue,
    moveKeyDown = require('./player.move-key-down').moveKeyDown,
    moveKeyUp = require('./player.move-key-up').moveKeyUp,
    tick = require('../../common/tick').tick,
    loginRegister = require('./login-register'),
    inputQueueSwitch = require('./inputQuere.switch').inputQueueSwitch,
    last1second = Date.now(),
    lastBotTick = Date.now();                                            // for stupid bot auto shoot


// GLOBAL SCOPE
allSession = [];// array contain all session
session = {};
bots = [];
alive = true;
lasers = [];
if(typeof local_remote==='undefined') {
    local_remote='remote';
    util.log('debugging environment');
}


require('./TMX_Engine.js').loadMap('../common/map/'+mapName+'.tmx', init);