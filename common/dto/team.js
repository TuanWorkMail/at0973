exports.Team = function(name){
    var kill = 0;

    function getName(){return name}function setName(para){name=para}
    function getKill(){return kill}function setKill(para){kill=para}
    return{
        getName:getName,setName:setName,

        getKill: getKill,setKill: setKill
    }
}