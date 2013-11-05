//Now, let�s make our ship move. Add these to the variables at the top:
var rightKey = false,
    leftKey = false,
    upKey = false,
    downKey = false;
//Checks to see which key has been pressed and either to move the ship or fire a laser
function keyDown(e) {
    var move, shoot = false;
    if (e.keyCode == 39) {
        rightKey = true;
    } else if (e.keyCode == 37) {
        leftKey = true;
    } else if (e.keyCode == 38) {
        upKey = true;
    } else if (e.keyCode == 40) {
        downKey = true;
    }
    if (e.keyCode == 88 && lasers.length <= lasersLength) {
        shoot = true;
        if (direction == 'up') {
            shooting(ship_x + ship_w / 2, ship_y - 1, direction);
        } else if (direction == 'down') {
            shooting(ship_x + ship_w / 2, ship_y + ship_h + 1, direction);
        } else if (direction == 'right') {
            shooting(ship_x + ship_w + 1, ship_y + ship_h / 2, direction);
        } else if (direction == 'left') {
            shooting(ship_x - 1, ship_y + ship_h / 2, direction);
        }
    }

}

//Checks to see if a pressed key has been released and stops the ships movement if it has
function keyUp(e) {
    if (e.keyCode == 39) {
        rightKey = false;
    } else if (e.keyCode == 37) {
        leftKey = false;
    } else if (e.keyCode == 38) {
        upKey = false;
    } else if (e.keyCode == 40) {
        downKey = false;
    }
    socket.emit("key up");
    var player = playerById(mySocketID);
    if(!player) {
        console.log('keyup: player not found');
        return;
    }
    player.setMoving(false);
}

//holds the cursors position
function cursorPosition(x, y) {
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
    var cursorPos = new cursorPosition(x, y);
    return cursorPos;
}
function updateInput() {
    if (rightKey || leftKey || upKey || downKey) {
        var move, shoot=true;
        if(rightKey) move='right';
        else if(leftKey) move='left';
        else if(upKey) move='up';
        else if(downKey) move='down';
        socket.emit("key down", { move: move, shoot: shoot });
        var player = playerById(mySocketID);
        if(!player) {
            console.log('keydown: player not found');
            return;
        }
        player.setDirection(move);
        player.setMoving(true);
    }
};