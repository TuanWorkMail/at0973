window.onload = setSocketEventHandlers;
var tank5 = {};
tank5.main = (function() {
var shipSpeed = 5,
    fps = 60,
    ship_w = 40, ship_h = 40,
    lastTick = Date.now(),//delta time
    loopUnused = 0,//percent left of last loop
    //which direction the ship is facing
    direction,
    bullet,
    ship_x, ship_y,
    score = 0,
    gameStarted = true;

function init() {
    var width = tmxloader.map.width * tmxloader.map.tileWidth,
        height = tmxloader.map.height * tmxloader.map.tileHeight;
    createStackedCanvases();
    // pop up login
    var centerPlaceholder = document.getElementById('center'),
        loginBox = document.getElementById('login');
    centerPlaceholder.style.top = height/2+'px';
    centerPlaceholder.style.left = width/2+'px';
    loginBox.style.display = 'block';
    //user input event listener
    document.addEventListener('keydown', keyDown, false);
    document.addEventListener('keyup', keyUp, false);

    drawMap();
    temporaryDrawOverhead();

    //START THE GAME
    gameLoop();
}

//The main function of the game, it calls all the other functions needed to make the game run
function gameLoop() {
    if (gameStarted) {
        clearCanvas();
        var now = Date.now(),
            fixedDelta = 1000/60,
            loopRounded,
            remainder,
            delta = now - lastTick;
        lastTick = now;
        var loopUnrounded = delta/fixedDelta + loopUnused;
        remainder = loopUnrounded - Math.floor(loopUnrounded);
        if(remainder>0.5) {
            loopRounded = Math.floor(loopUnrounded) + 1;
        } else
            loopRounded = Math.floor(loopUnrounded);
        loopUnused = loopUnrounded - loopRounded;
        for(var i=0;i<loopRounded;i++) {
            movingPlayer();
            moveLaser();
        }
        //drawMap();
            //shipCollision();
        updateInput();
        document.getElementById('showfps').innerHTML = 'fps: ' + Math.floor(1000/delta);
        shootDestruction();
        drawBot();
        drawPlayer();
        drawLaser();
    }
    scoreTotal();
    requestAnimationFrame(gameLoop);
}
    return {
        gameStarted: gameStarted,
        init: init
    }
}());