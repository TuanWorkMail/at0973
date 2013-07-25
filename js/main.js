//Now, let’s get onto the part that will make this game run, the JavaScript. 
//First, we’ll get our ship working, so we need to set up some variables.
var canvas,
    ctx,

	whichMap = "map2",
	shipSpeed = 6,
	enemySpeed = 4,
	tmxloader = {},

    width = 640,
    height = 640,
    enemyTotal = 5,
    enemies = [],
    enemy_w = 32,
    enemy_h = 32,
    enemy,
    //Now, let’s make our ship move. Add these to the variables at the top:
    rightKey = false,
    leftKey = false,
    upKey = false,
    downKey = false,
    //which direction the ship is facing
	direction = 0,
	//Add the socket variable to the file
    socket,
	//remote player
	remotePlayers,
	remotePlayers = [],
	//viewport for drawing map
	viewport,
	viewport_x = 0,
	viewport_y = 0,

	ship,
    ship_x, ship_y, ship_w = 32, ship_h = 32,
    laserTotal = 6,
    lasers = [],
	laserSpeed = 16,
    score = 0,
    alive = true,
    lives = 3,
	gameStarted = false;

//The initial function called when the page first loads. Loads the ship, enemy and 
//adds the event listeners for the arrow keys. It then calls the gameLoop function.
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
    game = setTimeout(gameLoop, 1000 / 60);
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