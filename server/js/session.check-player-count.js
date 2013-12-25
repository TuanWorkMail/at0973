var tmxloader = require('./TMX_Engine').tmxloader,
    broadcastToRoom = require('../socket-listener').broadcastToRoom,
    main = require('./main'),
    minimumNoPlayer = require('./main').minimumNoPlayer;
exports.checkPlayerCount = function(){
    if(session.getStart()) return;
    var now = Date.now();
    if(now-session.getLastCountdown()<6000) return;
    if(minimumNoPlayer===0) minimumNoPlayer = tmxloader.map.objectgroup['spawn'].objects.length;
    if(session.getRemotePlayers().length >= minimumNoPlayer){
        broadcastToRoom(main.session.getRoomID(), 'start count down');
        session.setLastCountdown(now);
        setTimeout(function(){session.setStart(true)}, 5000);
    }
};