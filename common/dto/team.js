exports.Team = function(name){
    var remotePlayers = [],
        kill = 0;

    function getName(){return name}function setName(para){name=para}
    function getRemotePlayers() { return remotePlayers; }
    function getKill(){return kill}function setKill(para){kill=para}
    return{
        getRemotePlayers: getRemotePlayers,
        getName:getName,setName:setName,

        getKill: getKill,setKill: setKill
    }
}