//RESTART server for changes to applied
var mapName = 'classic_small';
debugLogLevel = 0;
exports.minimumNoPlayer = 2;
exports.mapName = mapName;
setTimeout = setTimeout;
function init() {
    require('./TMX_Engine.js').loadMap('../common/map/'+mapName+'.tmx');
    //create a new blank session
    var newSession = new Session(0);
    allSession.push(newSession);
    setTimeout(loop, 1000);
}
function loop() {
    var now = Date.now(),
        fixedDelta = 1000/60,
        loopRounded,
        delta = now - lastTick,
        d1second = now - last1second;
    lastTick = now;
    var loopUnrounded = delta/fixedDelta + loopUnused;
    loopRounded = Math.round(loopUnrounded);
    loopUnused = loopUnrounded - loopRounded;
    for(var j=0; j<allSession.length; j++) {
        session = allSession[j];
        exports.session = allSession[j];
        //todo all socket event QUEUE to process in loop(), make allSession private
        bots = allSession[j].bots;
        lasers = allSession[j].getLasers();
        if(d1second>1000) session.setCombinedLayer(combine16to1tile());
        checkPlayerCount();
        if(!allSession[j].getStart()) continue;
        for(var i=0;i<loopRounded;i++) {
            player.movingPlayer();
            bulletMain.moveLaser();
            hitTest.bulletCollision();
            botClass.moveBot();
            shootDestroyBrick();
            bulletMain.removeBullet();
        }
        if(loopRounded < 1) continue;
        hitTest.hitTestBot();
        teamSumKill.totalKill();
        //TODO: change 1000 to 500 will throw error,
        if(now-lastBotTick>=1000) botStupid.BotShootInterval(bots);
        hitTest.hitTestPlayer();
        hitTest.hitTestEagle();
        dropcheck.collideDrop();
        player.checkHitPoint();
    }
    if(d1second>1000) last1second = now;
    if(now-lastBotTick>=1000) lastBotTick = now;
    setTimeout(loop, 1000/60);
}

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
    teamSumKill = require('./team.sum-kill'),
    checkPlayerCount = require('./session.check-player-count.js').checkPlayerCount,
    debug = require('../../common/helper').debug,
    shootDestroyBrick = require('../../common/shoot-destroy-brick').shootDestroyBrick,
    lastTick = Date.now(),                                  // calculate delta time
    last1second = Date.now(),
    lastBotTick = Date.now(),                                            // for stupid bot auto shoot
    loopUnused = 0;                                         // % of loop left


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



init();