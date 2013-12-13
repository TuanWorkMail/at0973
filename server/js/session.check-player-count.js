var tmxloader = require('./TMX_Engine').tmxloader,
    broadcastToRoom = require('../socket-listener').broadcastToRoom,
    main = require('./main'),
    startCount = 0;
exports.checkPlayerCount = function(){
    if(session.getStart()) return;
    if(startCount===0) startCount = tmxloader.map.objectgroup['spawn'].objects.length;
    if(session.getRemotePlayers().length >= startCount){
        broadcastToRoom(main.session.getRoomID(), 'start count down');
        setTimeout(function(){session.setStart(true)}, 5000);
    }
};