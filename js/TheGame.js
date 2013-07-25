
//The initial function called when the page first loads. Loads the ship, enemy and starfield images and adds the event listeners for the arrow keys. It then calls the gameLoop function.
function init() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    enemy = new Image();
    enemy.src = 'images/8bit_enemy.png';
    ship = new Image();
    ship.src = 'images/ship.png';
    ship_right = new Image();
    ship_right.src = 'images/ship_right.png';
    ship_left = new Image();
    ship_left.src = 'images/ship_left.png';
    ship_down = new Image();
    ship_down.src = 'images/ship_down.png';
    document.addEventListener('keydown', keyDown, false);
    document.addEventListener('keyup', keyUp, false);
    canvas.addEventListener('click', gameStart, false);
    tmxloader.load("map/" + whichMap + ".tmx");
    viewport = new Viewport(0, 0, ctx.canvas.width, ctx.canvas.height);
    spriteSheet = new Image();
    spriteSheet.src = "map/" + tmxloader.map.tilesets[0].src;

    enemiesGroup = tmxloader.map.objectgroup['bot'].objects;

    //array hold the world
    world = tmxloader.map.layers[1].data,

    gameLoop();
    //io.connect will connect you to a Socket.IO server by using 
    //the first parameter as the server address.
    socket = io.connect("http://localhost", { port: 8000, transports: ["websocket"] });
    // Start listening for events
    setEventHandlers();
    //where to spawn ship
    objGroup = tmxloader.map.objectgroup['spawn'].objects;
    ship_x = objGroup[1].x;
    ship_y = objGroup[1].y;
    console.log("Spawn: X=" + ship_x + "; Y=" + ship_y);
    ////array of coordinate the bot can randomly go to
    botDestination = tmxloader.map.objectgroup['destination'].objects;
}



//The main function of the game, it calls all the other functions needed to make the game run
function gameLoop() {
    clearCanvas();
    //call draw() from example.js
    draw();
    if (alive && gameStarted && lives > 0) {
        //shipCollision();
        moveEnemies();
        drawEnemies();
        hitTestEnemies();
        //map collision
        mapCollision();
        moveLaser();
        //hitTest();
        //check laser collide with wall
        laserCollision();
        drawShip();
        drawLaser();
        // Draw the remote players
        var i;
        for (i = 0; i < remotePlayers.length; i++) {
            remotePlayers[i].draw(ctx);
        };
        //call update function
        update();
    }
    scoreTotal();
    game = setTimeout(gameLoop, 1000 / fps);
}

//Checks to see which key has been pressed and either to move the ship or fire a laser
function keyDown(e) {
    if (e.keyCode == 39) rightKey = true;
    else if (e.keyCode == 37) leftKey = true;
    else if (e.keyCode == 38) upKey = true;
    else if (e.keyCode == 40) downKey = true;
    if (e.keyCode == 88 && lasers.length <= laserTotal) {
        if (direction == 0) {
            lasers.push([ship_x + 23, ship_y - 20, 0]);
        } else if (direction == 2) {
            lasers.push([ship_x + 23, ship_y + 51, 2]);
        } else if (direction == 1) {
            lasers.push([ship_x + 51, ship_y + 23, 1]);
        } else if (direction == -1) {
            lasers.push([ship_x - 20, ship_y + 23, -1]);
        }
        //update lasers shot
        socket.emit("move lasers", { x: ship_x, y: ship_y, direction: direction });
    }
}

//Checks to see if a pressed key has been released and stops the ships movement if it has
function keyUp(e) {
    if (e.keyCode == 39) rightKey = false;
    else if (e.keyCode == 37) leftKey = false;
    else if (e.keyCode == 38) upKey = false;
    else if (e.keyCode == 40) downKey = false;
}

window.onload = init;

//tmxloader.load("map/"+whichMap+".tmx");

//Clears the canvas so it can be updated
function clearCanvas() {
  ctx.clearRect(0,0,width,height);
}

//If an arrow key is being pressed, moves the ship in the right direction
function drawShip() {
    if (rightKey) {
		direction=1;
		ship_x += shipSpeed;
		if(mapCollision()) {
			ship_x -= shipSpeed;
		}
	} else if (leftKey) {
		direction=-1;
		ship_x -= shipSpeed;
		if(mapCollision()) {
			ship_x += shipSpeed;
		}
	} else if (upKey) {
		direction=0;
		ship_y -= shipSpeed;
		if(mapCollision()) {
			ship_y += shipSpeed;
		}
	} else if (downKey) {
		direction=2;
		ship_y += shipSpeed;
		if(mapCollision()) {
			ship_y -= shipSpeed;
		}
	}
  if (ship_x <= 0) ship_x = 0;
  if ((ship_x + ship_w) >= width) ship_x = width - ship_w;
  if (ship_y <= 0) ship_y = 0;
  if ((ship_y + ship_h) >= height) ship_y = height - ship_h;
  
	if (direction==1) {
		ctx.drawImage(ship_right, ship_x, ship_y);
	} else if (direction==-1) {
		ctx.drawImage(ship_left, ship_x, ship_y);
	} if (direction==0) {
		ctx.drawImage(ship, ship_x, ship_y);
	} else if (direction==2) {
		ctx.drawImage(ship_down, ship_x, ship_y);
	}
}

//If there are lasers in the lasers array, then this will draw them on the canvas
function drawLaser() {
    for (var i = 0; i < lasers.length; i++) {
      ctx.fillStyle = '#f00';
      ctx.fillRect(lasers[i][0],lasers[i][1],4,4)
    }
}

//If we're drawing lasers on the canvas, this moves them in the canvas
function moveLaser() {
  for (var i = 0; i < lasers.length; i++) {
		if (lasers[i][2]==0) {
			lasers[i][1] -= laserSpeed;
		} else if (lasers[i][2]==2) {
			lasers[i][1] += laserSpeed;
		} else if (lasers[i][2]==1) {
			lasers[i][0] += laserSpeed;
		} else if (lasers[i][2]==-1) {
			lasers[i][0] -= laserSpeed;
		}
    if (lasers[i][1] < 0 || lasers[i][1] > height || lasers[i][0] < 0 || lasers[i][0] > width) {
      lasers.splice(i, 1);
    }
  } 
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

//holds the cursors position
function cursorPosition(x,y) {
  this.x = x;
  this.y = y;
}

//finds the cursor's position after the mouse is clicked
function getCursorPos(e) {
  var x;
  var y;
  if (e.pageX || e.pageY) {
    x = e.pageX;
    y = e.pageY;
  } else {
    x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
  }
  x -= canvas.offsetLeft;
  y -= canvas.offsetTop;
  var cursorPos = new cursorPosition(x, y);
  return cursorPos;
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
