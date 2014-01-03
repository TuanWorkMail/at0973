exports.InputQueue = function(socketID, eventName, data){
    function getSocketID(){return socketID}
    function getEventName(){return eventName}
    function getData(){return data}
    return{
        getSocketID:getSocketID,
        getEventName:getEventName,
        getData:getData
    }
};