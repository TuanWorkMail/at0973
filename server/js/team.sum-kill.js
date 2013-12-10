var getSession = require('./main').getSession,
    lastTeamKills = [],
    debug = require('../../common/helper').debug;
lastTeamKills[0]=0;
lastTeamKills[1]=0;
exports.totalKill = function(){
    var session = getSession(),
        team = session.getTeam(),
        remotePlayers = session.getRemotePlayers();
    for(var j=0;j<team.length;j++){
        team[j].setKill(0);
        for(var i=0;i<remotePlayers.length;i++){
            if(remotePlayers[i].getTeamName()===team[j].getName()) {
                team[j].setKill(team[j].getKill()+remotePlayers[i].getBotKill());
            }
        }
        if(team[j].getKill()!==lastTeamKills[j]){
            lastTeamKills[j]=team[j].getKill();
            debug.log('team '+team[j].getName()+' kills: '+team[j].getKill());
        }
    }
};