var remoteBots = [];
function onBotBroadcast(data) {
    var bot = botById(data.id);
    if (bot!=false) {
        bot.setX(data.x);
        bot.setY(data.y);
        bot.setDirection(data.direction);
        bot.type = data.type;
        return;
    }
    var newBot = new Bot(data.id, data.x, data.y, data.type);
    newBot.setDirection(data.direction);
    remoteBots.push(newBot);
}
function onBotDie(data) {
    var bot = botById(data.count);
    if (bot!=false) {
        for (var i = 0; i < remoteBots.length; i++) {
            if (remoteBots[i].id == data.count)
                remoteBots.splice(i, 1);
        }
        return;
    }
    console.log('bot '+data.count+' not found');
    console.log(remoteBots.length);
}
function drawBot() {
    for (var i = 0; i < remoteBots.length; i++) {
        //drawByDirection(array[i]);
        drawingBot(remoteBots[i]);
    }
    //drawPath();
}
function botById(id) {
    for (var i = 0; i < remoteBots.length; i++) {
        if (remoteBots[i].id == id)
            return remoteBots[i];
    }
    return false;
}