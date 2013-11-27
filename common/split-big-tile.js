if(typeof require !== 'undefined' && typeof exports !== 'undefined'){
    exports.splitBigTile = splitBigTile;
}
function splitBigTile(array) {
    if(array.length===0) return false;
    // first, create a blank blown-up array
    var smaller = new Array(array.length*4);
    for(var k=0; k<smaller.length; k++){
        smaller[k] = new Array(array[0].length*4);
    }
    for(var i=0; i<array.length; i++){
        for(var j=0; j<array[i].length; j++) {
            // duplicate each one to 4x4
            for(var m=i*4; m<i*4+4; m++) {
                for(var n=j*4; n<j*4+4; n++) {
                    smaller[m][n] = array[i][j];
                }
            }
        }
    }
    return smaller;
}