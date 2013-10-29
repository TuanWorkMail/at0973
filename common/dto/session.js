/**
 * Created with JetBrains WebStorm.
 * User: AnhTuan
 * Date: 10/15/13
 * Time: 11:28 AM
 * To change this template use File | Settings | File Templates.
 */
dto.Session = function() {
    var id,
        player,
        bot,
        bullet;

    var getID = function() {return id;},
        setID = function(para) {id = para;},
        getPlayer = function() {return player;},
        setPlayer = function(para) {player = para;},
        getBot = function() {return bot;},
        setBot = function(para) {bot = para;},
        getBullet = function() {return bullet;},
        setBullet = function(para) {bullet = para;};

    return {
        getID:getID,
        setID:setID,
        getPlayer:getPlayer,
        setPlayer:setPlayer,
        getBot:getBot,
        setBot:setBot,
        getBullet:getBullet,
        setBullet:setBullet
    }
}