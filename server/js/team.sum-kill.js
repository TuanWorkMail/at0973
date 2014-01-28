var main = require('./main'),
    lastTeamKills = [],
    lastTeamScore = [],
    debug = require('../../common/helper').debug,
    broadcastToRoom = require('../socket-listener').broadcastToRoom,
    endSession = require('../../common/session.restart').end,
    config = require('./loadConfig');
lastTeamKills[0]=0;
lastTeamKills[1]=0;
lastTeamScore[0]=0;
lastTeamScore[1]=0;

exports.totalKill = function(){
    var team = main.session.getTeam(),
        remotePlayers = main.session.getRemotePlayers();
    for(var j=0;j<team.length;j++){
        team[j].setKill(0);
        team[j].setScore(0);
        for(var i=0;i<remotePlayers.length;i++){
            if(remotePlayers[i].getTeamName()===team[j].getName()) {
                team[j].setKill(team[j].getKill()+remotePlayers[i].getBotKill());
                team[j].setScore(team[j].getScore()+remotePlayers[i].getScore());
            }
        }
        if(team[j].getScore()>=config.score) endSession(team[j].getName());
        //if(team[j].getKill()!==lastTeamKills[j] || team[j].getScore()!==lastTeamScore[j]){
        else{
            lastTeamKills[j]=team[j].getKill();
            lastTeamScore[j]=team[j].getScore();
            debug.log('team '+team[j].getName()+' kills: '+team[j].getKill()+' score: '+team[j].getScore(), 1);
            broadcastToRoom(main.session.getRoomID(), 'team score', {team:team[j].getName(),score:team[j].getScore()});
        }
    }
};