//Cycles through the array and draws the updated enemy position
function drawBot() {
    for (var i = 0; i < bots.length; i++) {
        ctx.drawImage(bot, bots[i].getX(), bots[i].getY());
    }
}
