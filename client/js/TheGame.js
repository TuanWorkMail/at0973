// GLOBAL SCOPE
window.onload = setSocketEventHandlers;
var tank5 = {},
    session,
    lasers;
// LOCAL SCOPE
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
        gameStarted = false;

    function init() {
        var width = tmxloader.map.width * tmxloader.map.tileWidth,
            height = tmxloader.map.height * tmxloader.map.tileHeight;
        session = new Session(0);
        lasers = session.getLasers();
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

        setTimeout(function() {
            drawMap();
            drawLayer(layerByName('overhead').data, contextOverhead);
            drawEagle();}, 2000);

        //START THE GAME
        gameLoop();
    }
//The main function of the game, it calls all the other functions needed to make the game run
    function gameLoop() {
        clearCanvas();
        scoreTotal();
        drawLayer(session.getDestructible(), ctx);
        drawLayer(session.getIndestructible(), ctx);
        if (gameStarted) {
            var now = Date.now(),
                fixedDelta = 1000/60,
                loopRounded,
                remainder,
                delta = now - lastTick;
            lastTick = now;
            var loopUnrounded = delta/fixedDelta + loopUnused;
            loopRounded = Math.round(loopUnrounded);
            loopUnused = loopUnrounded - loopRounded;
            for(var i=0;i<loopRounded;i++) {
                movingPlayer();
                moveLaser();
                outOfMapBullet();
                shootDestruction();
                removeBullet();
            }
            //drawMap();
            //shipCollision();
            updateInput();
            document.getElementById('showfps').innerHTML = 'fps: ' + Math.floor(1000/delta);
            drawBot();
            drawPlayer();
            drawLaser();
            drawDrop();
        }
        requestAnimationFrame(gameLoop);
    }
    function getGameStarted() {return gameStarted}
    function setGameStarted(para) {gameStarted=para}
    return {
        getGameStarted: getGameStarted,
        setGameStarted: setGameStarted,
        init: init
    }
}());