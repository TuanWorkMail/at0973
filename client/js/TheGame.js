// GLOBAL SCOPE
window.onload = setSocketEventHandlers;
var debugLogLevel = 1,
    tank5 = {},
    session,
    lasers,
    gameStarted = false;
// LOCAL SCOPE
tank5.main = (function() {
    var fps = 60,
        lastTick = Date.now(),//delta time
        lastfpstick = Date.now();

    function init() {
        var width = tmxloader.map.width * tmxloader.map.tileWidth,
            height = tmxloader.map.height * tmxloader.map.tileHeight;
        //session = new Session(0);
        //lasers = session.getLasers();
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
            //drawEagle();
        }, 500);

        //START THE GAME
        gameLoop();
    }
//The main function of the game, it calls all the other functions needed to make the game run
    function gameLoop() {
        clearCanvas();
        drawLayer(session.getDestructible(), ctx);
        drawLayer(session.getIndestructible(), ctx);
        scoreTotal();
        if (gameStarted) {
            var now = Date.now(),
                delta = now - lastTick;
            lastTick = now;
            tick(function(){
                moveCharacter();
            });
            if(now-lastfpstick>500){
                document.getElementById('showfps').innerHTML = 'fps: ' + Math.floor(1000/delta);
                lastfpstick = now;
            }
            renderCharacter();
            //drawBot();
            //drawDrop();
            animation.renderAnimation();
        }
        requestAnimationFrame(gameLoop);
    }
    function moveCharacter(){
        for(var i=0;i<session.getCharacters().length;i++){
            if(session.getCharacters()[i].getMoving()) character.moving(session.getCharacters()[i], '');
        }
    }

    return {
        init: init
    }
}());