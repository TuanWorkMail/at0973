//window.onload = init;

var canvas,
    ctx,
    canvasBg,
    contextBg,
    canvasOverhead,
    contextOverhead,
    shipSpeed = 5,
    fps = 60,
    ship_w = 40, ship_h = 40,
    lastTick = Date.now(),//delta time
    loopUnused = 0,//percent left of last loop
    width,
    height,
    bots = [],
    remoteBots = [],
    //which direction the ship is facing
    direction,
    //Add the socket variable to the file
    socket,
    //viewport for drawing map
    viewport,
    viewport_x = 0,
    viewport_y = 0,
    spriteSheet,
    spriteSheet2,
    bullet,
    ship_x, ship_y,
    score = 0,
    alive = true,
    lives = 3,
    gameStarted = false;

//io.connect will connect you to a Socket.IO server by using
//the first parameter as the server address.
socket = io.connect("http://localhost", { port: 8000, transports: ["websocket"] });
//socket = io.connect("125.212.217.58", { port: 8000, transports: ["websocket"] });
//socket = io.connect("tuan.sytes.net", { port: 8000, transports: ["websocket"] });
// Start listening for events
setSocketEventHandlers();
function init() {
    //tmxloader.load("map/" + whichMap + ".tmx");
    width = tmxloader.map.width * tmxloader.map.tileWidth;
    height = tmxloader.map.height * tmxloader.map.tileHeight;
    // pop up login
    var centerPlaceholder = document.getElementById('center'),
        loginBox = document.getElementById('login');
    centerPlaceholder.style.top = height/2+'px';
    centerPlaceholder.style.left = width/2+'px';
    loginBox.style.display = 'block';
    // create stacked canvases
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
    //user input event listener
    document.addEventListener('keydown', keyDown, false);
    document.addEventListener('keyup', keyUp, false);
    canvasOverhead.addEventListener('click', gameStart, false);
    viewport = new Viewport(0, 0, ctx.canvas.width, ctx.canvas.height);
    spriteSheet = new Image();
    spriteSheet.src = "../common/map/" + tmxloader.map.tilesets[0].src;
    spriteSheet2 = new Image();
    spriteSheet2.src = "images/tank5.png";

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
    var lastTime = 0, vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
            || window[vendors[x]+'CancelRequestAnimationFrame'];
    }if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback) {
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
    if (alive && gameStarted && lives > 0) {
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



