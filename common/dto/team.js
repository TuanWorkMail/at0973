exports.Team = function(name){
    var kill = 0,
        playerKill = 0,
        score = 0;

    function getName(){return name}function setName(para){name=para}
    function getKill(){return kill}function setKill(para){kill=para}
    function getPlayerKill(){return playerKill}function setPlayerKill(para){playerKill=para}
    function getScore(){return score}function setScore(para){score=para}
    return{
        getName:getName,setName:setName,
        getScore:getScore,setScore:setScore,
        getPlayerKill:getPlayerKill,setPlayerKill:setPlayerKill,

        getKill: getKill,setKill: setKill
    }
};