//Now, let�s get onto the part that will make this game run, the JavaScript. 
//First, we�ll get our ship working, so we need to set up some variables.

window.onload = init;

/************************
**** NAMESPACE
************************/
window.dto = {};

var canvas,
    ctx,
    whichMap = "classic1",
    shipSpeed = 5,
    enemySpeed = 5,
    fps = 60,
    ship_w = 40, ship_h = 40,
    host = 'none',
    continueLoop = true,
    width,
    height,
    playerLength = 0,
    tmxloader = {},
    botsLength = 2,
    bots = [],
    remoteBots = [],
    //stupid bot shoot flag
    stupidShoot=false,
    //array of coordinate the bot can randomly go to
    botDestination,
    //Now, let�s make our ship move. Add these to the variables at the top:
    rightKey = false,
    leftKey = false,
    upKey = false,
    downKey = false,
    //which direction the ship is facing
    direction,
    //Add the socket variable to the file
    socket,
    remotePlayers = [],
    //viewport for drawing map
    viewport,
    viewport_x = 0,
    viewport_y = 0,
    ship, ship_right, ship_left, ship_down,
    bullet, bullet_right, bullet_left, bullet_down,
    ship_x, ship_y, 
    lasersLength = 1,
    lasers = [],
    laserSpeed = 15,
    score = 0,
    alive = true,
    lives = 3,
    gameStarted = false;
//The initial function called when the page first loads. Loads the ship, enemy and starfield images and adds the event listeners for the arrow keys. It then calls the gameLoop function.
function init() {
    tmxloader.load("map/" + whichMap + ".tmx");
    width = tmxloader.map.width * tmxloader.map.tileWidth;
    height = tmxloader.map.height * tmxloader.map.tileHeight;
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    canvas.setAttribute("width", width);
    canvas.setAttribute("height", height);
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
    canvas.addEventListener('click', gameStart, false);
    viewport = new Viewport(0, 0, ctx.canvas.width, ctx.canvas.height);
    spriteSheet = new Image();
    spriteSheet.src = "map/" + tmxloader.map.tilesets[0].src;
    enemiesGroup = tmxloader.map.objectgroup['bot'].objects;
    //io.connect will connect you to a Socket.IO server by using 
    //the first parameter as the server address.
    socket = io.connect("http://localhost", { port: 8000, transports: ["websocket"] });
    //socket = io.connect("125.212.217.58", { port: 8000, transports: ["websocket"] });
    // Start listening for events
    setSocketEventHandlers();

    //where to spawn ship
    //reset();

    ////array of coordinate the bot can randomly go to
    botDestination = tmxloader.map.objectgroup['destination'].objects;


    //stupid bot shooting
    setInterval(function() {stupidShoot=true;}, 1000 * 1);

    document.getElementById('init').style.display = 'none';
    document.getElementById('login').style.display = 'block';

    //gameLoop();
}

//The main function of the game, it calls all the other functions needed to make the game run
function gameLoop() {
    if (continueLoop) {

    clearCanvas();
    moveLaser();
    if (host && remotePlayers.length==2) {
        moveBot();
        hitTestBot();
        //shoot must behind check and move
        BotShootInterval(bots, 1);
        hitTestPlayer();
        checkHitPoint();
    }
    if(!host) {
        drawMap();
        if (alive && gameStarted && lives > 0) {
            //shipCollision();

            //COMBINE BOTS AND REMOTEBOTS, NOW DEPEND ON HOST
            drawBot();

            shootDestruction();
            //moveShip();
            //drawShip();
            drawLaser();
            // Draw the remote players
            for (var i = 0; i < remotePlayers.length; i++) {
                remotePlayers[i].draw(ctx);
            }
            //call update function
            //updatePlayer();

        }
    }
    scoreTotal();
    game = setTimeout(gameLoop, 1000 / fps);
    }
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



