var animationQueue = [];
animation = (function(){
    function Animation(animation_name, x, y, start_time){
        this.animation_name = animation_name;
        this.x = x;
        this.y = y;
        if(typeof start_time==='undefined'){
            this.start_time = Date.now();
        } else {
            this.start_time = start_time
        }
    }
    var all_animation = {};
    all_animation.explosion = [
        [33,1000/15],
        [34,1000/15],
        [41,1000/15]
    ];
    function renderAnimation() {
        for(var i=0;i<animationQueue.length;i++){
            if(animationQueue[i].start_time>Date.now()) continue;
            var timeElapsed = Date.now() - animationQueue[i].start_time,  // time elapsed from when the animation was created
                animation = all_animation[''+animationQueue[i].animation_name];
            for(var j=0;j<animation.length;j++){
                if(timeElapsed<animation[j][1]){
                    drawTile(animation[j][0], animationQueue[i].x, animationQueue[i].y);
                    j=animation.length;
                }else{
                    timeElapsed = timeElapsed - animation[j][1];
                }
                if(j===animation.length-1 && timeElapsed>0) animationQueue.splice(i,1);
            }
        }
    }
    return {
        renderAnimation:renderAnimation,
        Animation:Animation
    }
})();