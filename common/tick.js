var tick = (function(){
    var now = Date.now(),
        fixedDelta = 1000/60,
        loopRounded,
        delta = now - lastTick;
    lastTick = now;
    var loopUnrounded = delta/fixedDelta + loopUnused;
    loopRounded = Math.round(loopUnrounded);
    loopUnused = loopUnrounded - loopRounded;
        for(var i=0;i<loopRounded;i++) {

        }

})();
if(typeof require!=='undefined' && typeof define!=='undefined'){
    exports.tick = tick;
}