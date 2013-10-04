//Now, let�s get onto the part that will make this game run, the JavaScript. 
//First, we�ll get our ship working, so we need to set up some variables.

//window.onload = init;

var canvas,
    ctx,
    whichMap = "classic1",
    shipSpeed = 5,
    enemySpeed = 5,
    fps = 60,
    ship_w = 40, ship_h = 40,
    width,
    height,
    tmxloader = {},
    botsLength = 8,
    bots = [],
    remoteBots = [],
    bot_w = 40,
    bot_h = 40,
    bot,
    bot2,
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
    direction = 0,
    //Add the socket variable to the file
    socket,
    remotePlayers = [],
    //check if gameLoop is over or not, for onBotBroadcast(Multiplayer)
    checkGameLoop = false,
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
    lastKey = 'left',
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
    bot = new Image();
    bot.src = 'images/8bit_enemy.png';
    bot2 = new Image();
    bot2.src = 'images/bot2.png';
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
    // Start listening for events
    setSocketEventHandlers();
    //where to spawn ship
    objGroup = tmxloader.map.objectgroup['spawn'].objects;
    ship_x = objGroup[1].x;
    ship_y = objGroup[1].y;
    console.log("Spawn: X=" + ship_x + "; Y=" + ship_y);
    ////array of coordinate the bot can randomly go to
    botDestination = tmxloader.map.objectgroup['destination'].objects;

    //debug
    //drawTileLayerRaw(combine16to1tile(combineTileLayer()));

    //stupid bot shooting
    setInterval(function() {stupidShoot=true;}, 1000 * 1);

    gameLoop();
}

//The main function of the game, it calls all the other functions needed to make the game run
function gameLoop() {
    //a new loop
    checkGameLoop = true;
    clearCanvas();
    //draw the map
    draw();
    if (alive && gameStarted && lives > 0) {
        //shipCollision();
        hitTestBot();
        moveBot();
        //shoot must behind check and move
        BotShootInterval(bots, 1);
        drawBot(host);
        moveLaser();
        shootDestruction();
        //hitTest();
        drawShip();
        drawLaser();
        // Draw the remote players
        for (var i = 0; i < remotePlayers.length; i++) {
            remotePlayers[i].draw(ctx);
        }
        //call update function
        update();
        //debug
        //socket.emit("test", { test:'test' });
    }
    scoreTotal();
    game = setTimeout(gameLoop, 1000 / fps);
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


//This function runs whenever the player's ship hits an enemy and either subtracts a life or sets the alive variable to false if the player runs out of lives
function checkLives() {
  lives -= 1;
  if (lives > 0) {
    reset();
  } else if (lives == 0) {
    alive = false;
  }
}

//This simply resets the ship and enemies to their starting positions
function reset() {
	//where to spawn ship
	objGroup = tmxloader.map.objectgroup['spawn'].objects;
	ship_x = objGroup[1].x;
	ship_y = objGroup[1].y;
	console.log("Spawn: X="+ship_x+"; Y="+ship_y);
}

//After the player loses all their lives, the continue button is shown and if clicked, it resets the game and removes the event listener for the continue button
function continueButton(e) {
  var cursorPos = getCursorPos(e);
  if (cursorPos.x > (width / 2) - 53 && cursorPos.x < (width / 2) + 47 && cursorPos.y > (height / 2) + 10 && cursorPos.y < (height / 2) + 50) {
    alive = true;
    lives = 3;
    reset();
    canvas.removeEventListener('click', continueButton, false);
  }
}



//Draws the text for the score and lives on the canvas and if the player runs out of lives, it's draws the game over text and continue button as well as adding the event listener for the continue button
function scoreTotal() {
  ctx.font = 'bold 20px VT323';
  ctx.fillStyle = '#fff';
  ctx.fillText('Score: ', 10, 55);
  ctx.fillText(score, 70, 55);
  ctx.fillText('Lives:', 10, 30);
  ctx.fillText(lives, 68, 30);
		if (!gameStarted) {
    ctx.font = 'bold 50px VT323';
    ctx.fillText('Canvas Shooter', width / 2 - 150, height / 2);
    ctx.font = 'bold 20px VT323';
    ctx.fillText('Click to Play', width / 2 - 56, height / 2 + 30);
    ctx.fillText('Use arrow keys to move', width / 2 - 100, height / 2 + 60);
    ctx.fillText('Use the x key to shoot', width / 2 - 100, height / 2 + 90);
  }
  if (!alive) {
    ctx.fillText('Game Over!', 245, height / 2);
    ctx.fillRect((width / 2) - 60, (height / 2) + 10,100,40);
    ctx.fillStyle = '#000';
    ctx.fillText('Continue?', 250, (height / 2) + 35);
    canvas.addEventListener('click', continueButton, false);
  }
}


function gameStart() {
  gameStarted = true;
  canvas.removeEventListener('click', gameStart, false);
}
