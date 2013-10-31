if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
    exports.getRemotePlayer = Instance.getRemotePlayer;
}
function Instance() {
    // Bot
    var
    // Player
        remotePlayers = [];

    function getRemotePlayer() { return remotePlayers }

    return {

        getRemotePlayer: getRemotePlayer
    }
}