//Now, let�s get onto the part that will make this game run, the JavaScript. 
//First, we�ll get our ship working, so we need to set up some variables.

window.onload = init;

/************************
**** NAMESPACE
************************/

var canvas,
    ctx,
    canvasBg,
    contextBg,
    canvasOverhead,
    contextOverhead,
    whichMap = "classic2",
    shipSpeed = 5,
    enemySpeed = 5,
    fps = 60,
    ship_w = 40, ship_h = 40,
    //host = 'none',
    host = false,
    continueLoop = true,
    lastTick = Date.now(),//delta time
    lastTickBullet = 0,
    loopUnused = 0,//percent left of last loop
    width,
    height,
    //playerLength = 0,
    botsLength = 2,
    bots = [],
    remoteBots = [],
    //stupid bot shoot flag
    stupidShoot=false,
    //array of coordinate the bot can randomly go to
    botDestination,
    //which direction the ship is facing
    direction,
    //Add the socket variable to the file
    socket,
    //remotePlayers = [],
    //viewport for drawing map
    viewport,
    viewport_x = 0,
    viewport_y = 0,
    spriteSheet,
    spriteSheet2,
    ship, ship_right, ship_left, ship_down,
    bullet, bullet_right, bullet_left, bullet_down,
    ship_x, ship_y, 
    lasersLength = 1,
    //lasers = [],
    //laserSpeed = 15,
    score = 0,
    alive = true,
    lives = 3,
    gameStarted = false;
//The initial function called when the page first loads. Loads the ship, enemy and starfield images and adds the event listeners for the arrow keys. It then calls the gameLoop function.
function init() {
    tmxloader.load("map/" + whichMap + ".tmx");
    width = tmxloader.map.width * tmxloader.map.tileWidth;
    height = tmxloader.map.height * tmxloader.map.tileHeight;
    // Create a canvas and draw something in it.
    canvas = document.createElement("canvas");
    ctx = canvas.getContext("2d");
    document.body.appendChild(canvas);
    canvas.style.position = 'absolute';
    canvas.style.zIndex = 1;
    canvas.width = width;
    canvas.height = height;
    canvasBg = document.createElement("canvas");
    contextBg = canvasBg.getContext("2d");
    document.body.appendChild(canvasBg);
    canvasBg.style.position = 'absolute';
    canvasBg.style.zIndex = 0;
    canvasBg.width = width;
    canvasBg.height = height;
    contextBg.fillStyle = "#000";
    contextBg.fillRect(0, 0, width, height);
    canvasOverhead = document.createElement("canvas");
    contextOverhead = canvasOverhead.getContext("2d");
    document.body.appendChild(canvasOverhead);
    canvasOverhead.style.position = 'absolute';
    canvasOverhead.style.zIndex = 2;
    canvasOverhead.width = width;
    canvasOverhead.height = height;
    ship = new Image();
    ship.src = 'images/ship.png';
    ship_right = new Image();
    ship_right.src = 'images/ship_right.png';
    ship_left = new Image();
    ship_left.src = 'images/ship_left.png';
    ship_down = new Image();
    ship_down.src = 'images/ship_down.png';
    bullet = new Image();
    bullet.src = 'images/bullet.png';
    bullet_right = new Image();
    bullet_right.src = 'images/bulletRight.png';
    bullet_left = new Image();
    bullet_left.src = 'images/bulletLeft.png';
    bullet_down = new Image();
    bullet_down.src = 'images/bulletDown.png';
    //user input event listener
    document.addEventListener('keydown', keyDown, false);
    document.addEventListener('keyup', keyUp, false);
    canvasOverhead.addEventListener('click', gameStart, false);
    viewport = new Viewport(0, 0, ctx.canvas.width, ctx.canvas.height);
    spriteSheet = new Image();
    spriteSheet.src = "map/" + tmxloader.map.tilesets[0].src;
    spriteSheet2 = new Image();
    spriteSheet2.src = "images/tank5.png";
    enemiesGroup = tmxloader.map.objectgroup['bot'].objects;
    //io.connect will connect you to a Socket.IO server by using 
    //the first parameter as the server address.
    socket = io.connect("http://localhost", { port: 8000, transports: ["websocket"] });
    //socket = io.connect("125.212.217.58", { port: 8000, transports: ["websocket"] });
    //socket = io.connect("tuan.sytes.net", { port: 8000, transports: ["websocket"] });
    // Start listening for events
    setSocketEventHandlers();

    //where to spawn ship
    //reset();

    ////array of coordinate the bot can randomly go to
    //botDestination = tmxloader.map.objectgroup['destination'].object;
    drawMap();
    temporaryDrawOverhead();

    //START THE GAME
    gameLoop();
}
//Date.now() shim
(function() {
    if (!Date.now) {
        Date.now = function now() {
            return new Date().getTime();
        };
    }
}());
//BEGIN requestAnimationFrame polyfill
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
            || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = Date.now();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());
//END requestAnimationFrame polyfill

//The main function of the game, it calls all the other functions needed to make the game run
function gameLoop() {
    if (continueLoop) {

    var now = Date.now(),
        fixedDelta = 1000/60,
        loopRounded,
        remainder,
        delta = now - lastTick;
    lastTick = Date.now();
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
    document.getElementById('showfps').innerHTML = 'fps: ' + Math.floor(1000/delta);
    //console.log('delta: '+delta);
    shootDestruction();
    if (host && remotePlayers.length>1) {
        /*
        moveBot();
        hitTestBot();
        //shoot must behind check and move
        BotShootInterval(bots, 1);
        hitTestPlayer();
        checkHitPoint();
        */
    }
    if(!host) {
        clearCanvas();
        //drawMap();
        if (alive && gameStarted && lives > 0) {
            //shipCollision();

            //COMBINE BOTS AND REMOTEBOTS, NOW DEPEND ON HOST
            drawBot();

            drawShip();
            drawLaser();
            // Draw the remote players
            for (var i = 0; i < remotePlayers.length; i++) {
                remotePlayers[i].draw(ctx);
            }
            updateInput();
        }
        scoreTotal();
    }
    }
    //var game = setTimeout(gameLoop, 1000 / fps);
    requestAnimationFrame(gameLoop);
}

//This simply resets the ship and enemies to their starting positions
function reset_old() {
    //where to spawn ship
    objGroup = tmxloader.map.objectgroup['spawn'].objects;

    ship_x = objGroup[1].x;
    ship_y = objGroup[1].y;
    direction = 'down';

    var newPlayer = new dto.Player(objGroup[1].x, objGroup[1].y, 'down');

    socket.emit("move player", { x: ship_x, y: ship_y, direction: direction });

}






























//Similar to the laser hit test, this function checks to see if the player's ship collides with any of the enemies
function shipCollision() {
  var ship_xw = ship_x + ship_w,
      ship_yh = ship_y + ship_h;
  for (var i = 0; i < remotePlayers.length; i++) {
    if (ship_x > remotePlayers[i].getX() && ship_x < remotePlayers[i].getX() + enemy_w && ship_y > remotePlayers[i].getY() && ship_y < remotePlayers[i].getY() + enemy_h) {
      checkLives();
    }
    if (ship_xw < remotePlayers[i].getX() + enemy_w && ship_xw > remotePlayers[i].getX() && ship_y > remotePlayers[i].getY() && ship_y < remotePlayers[i].getY() + enemy_h) {
      checkLives();
    }
    if (ship_yh > remotePlayers[i].getY() && ship_yh < remotePlayers[i].getY() + enemy_h && ship_x > remotePlayers[i].getX() && ship_x < remotePlayers[i].getX() + enemy_w) {
      checkLives();
    }
    if (ship_yh > remotePlayers[i].getY() && ship_yh < remotePlayers[i].getY() + enemy_h && ship_xw < remotePlayers[i].getX() + enemy_w && ship_xw > remotePlayers[i][0]) {
      checkLives();
    }
  }
}



