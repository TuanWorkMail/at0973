var tick = (function(){
    var lastTick = Date.now(),
        skipTick = 0;
    return function(callback, fixedDelta){
        var delta = Date.now() - lastTick;
        if(typeof fixedDelta==='undefined') fixedDelta = 1000/60;
        lastTick = Date.now();
        var loopUnRounded = (delta + skipTick)/fixedDelta;
        var loopRounded = Math.round(loopUnRounded);
        skipTick = delta + skipTick - loopRounded * fixedDelta;
        if(loopRounded>10) loopRounded = 10;    // frame skipping
        for(var i=0;i<loopRounded;i++) {
            callback();
        }
    }
})();
if(typeof require!=='undefined' && typeof exports!=='undefined'){
    exports.tick = tick;
}