//Now, let�s make our ship move. Add these to the variables at the top:
var shootKey = false,
    rightKey = false,
    leftKey = false,
    upKey = false,
    downKey = false;
//Checks to see which key has been pressed and either to move the ship or fire a laser
function keyDown(e) {
    if (e.keyCode == 39) {
        rightKey = true;
    } else if (e.keyCode == 37) {
        leftKey = true;
    } else if (e.keyCode == 38) {
        upKey = true;
    } else if (e.keyCode == 40) {
        downKey = true;
    }
    if (e.keyCode == 32) {
        shootKey = true;
        var player = playerById(mySocketID);
        if(!player) {
            console.log('keydown: player not found');
            return;
        }
        var ship_x = player.getX(),
            ship_y = player.getY(),
            ship_w = player.getWidth(),
            ship_h = player.getHeight(),
            x, y,
            direction = player.getDirection();
        if (direction == 'up') {
            x = ship_x + ship_w / 2;
            y = ship_y - 1;
        } else if (direction == 'down') {
            x = ship_x + ship_w / 2;
            y = ship_y + ship_h + 1;
        } else if (direction == 'right') {
            x = ship_x + ship_w + 1;
            y = ship_y + ship_h / 2;
        } else if (direction == 'left') {
            x = ship_x - 1;
            y = ship_y + ship_h / 2;
        }
        shooting(x, y, direction);
        socket.emit("shoot key down", { x: x, y: y, direction: direction });
    }
}
//Checks to see if a pressed key has been released and stops the ships movement if it has
function keyUp(e) {
    var check = false;
    if (e.keyCode == 39) {
        rightKey = false;
        check = true;
    } else if (e.keyCode == 37) {
        leftKey = false;
        check = true;
    } else if (e.keyCode == 38) {
        upKey = false;
        check = true;
    } else if (e.keyCode == 40) {
        downKey = false;
        check = true;
    }
    if(check)
        socket.emit("move key up");
    var player = playerById(mySocketID);
    if(!player) {
        console.log('movekeyup: player not found');
        return;
    }
    player.setMoving(false);
}
function updateInput() {
    if (rightKey || leftKey || upKey || downKey) {
        var move;
        if(rightKey) move='right';
        else if(leftKey) move='left';
        else if(upKey) move='up';
        else if(downKey) move='down';
        socket.emit("move key down", { move: move });
        var player = playerById(mySocketID);
        if(!player) {
            console.log('updateInput: player not found');
            return;
        }
        player.setDirection(move);
        player.setMoving(true);
    }
}

//holds the cursors position
function CursorPosition(x, y) {
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
    x -= canvasOverhead.offsetLeft;
    y -= canvasOverhead.offsetTop;
    return new CursorPosition(x, y);
}