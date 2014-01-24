var tmxloader = require('./TMX_Engine').tmxloader,
    broadcastToRoom = require('../socket-listener').broadcastToRoom,
    main = require('./main'),
    minimumNoPlayer = require('./main').minimumNoPlayer,
    endSession = require('../../common/session.restart').end;
exports.checkPlayerCount = function(){
    if(session.getStart()){
        var team = main.session.getTeam(),
            remotePlayers = main.session.getRemotePlayers(),
            teamPlayers = [];
        for(var j=0;j<team.length;j++){
            if(typeof teamPlayers[j] === 'undefined') teamPlayers.push(0);
            for(var i=0;i<remotePlayers.length;i++){
                if(remotePlayers[i].getTeamName()===team[j].getName()) teamPlayers[j]++;
            }
            if(teamPlayers[j]===0) var check = true;
        }
        if(check){
            for(i=0;i<teamPlayers.length;i++){
                if(teamPlayers[i]!==0) endSession(team[i].getName());
            }
        }
    } else {
    var now = Date.now();
    if(now-session.getLastCountdown()<6000) return;
    if(minimumNoPlayer===0) minimumNoPlayer = tmxloader.map.objectgroup['spawn'].objects.length;
    if(session.getRemotePlayers().length >= minimumNoPlayer){
        broadcastToRoom(main.session.getRoomID(), 'start count down');
        session.setLastCountdown(now);
        setTimeout(function(){
            session.setStart(true);
            broadcastToRoom(main.session.getRoomID(), 'hide popup');
        }, 3000);
    }
    }
};