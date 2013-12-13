var tmxloader = require('./TMX_Engine').tmxloader,
    broadcastToRoom = require('../socket-listener').broadcastToRoom,
    main = require('./main'),
    startCount = 2;//tmxloader.map.objectgroup['spawn'].objects.length;
exports.checkPlayerCount = function(){
    if(session.getRemotePlayers().length >= startCount){
        broadcastToRoom(main.session.getRoomID(), 'start count down');
        setTimeout(function(){session.setStart(true)}, 5000);
    }
};