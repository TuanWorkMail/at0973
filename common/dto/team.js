exports.Team = function(){
    var id;

    function getID() {return id}
    return{
        getID: getID
    }
}