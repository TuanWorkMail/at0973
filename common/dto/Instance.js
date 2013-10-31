if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
    exports.Instance = Instance;
}
function Instance() {
    // Bot
    var
    // Player
        remotePlayers = [];

    function getRemotePlayer() { return remotePlayers; }

    return {

        getRemotePlayer: getRemotePlayer
    }
}