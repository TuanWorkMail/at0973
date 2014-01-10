//Now, let�s make our ship move. Add these to the variables at the top:
var shootKey = false,
    rightKey = false,
    leftKey = false,
    upKey = false,
    downKey = false,
    lastMoveKeyCode = 0,
    lastShootKeyState = false;
//Checks to see which key has been pressed and either to move the ship or fire a laser
function keyDown(e) {
    switch(e.keyCode){
        case 37: case 39: case 38:  case 40:    // Arrow keys
        case 32: e.preventDefault(); break;     // Space
        default: break;                         // do not block other keys
    }
    var move = 0,
        moveKeyChanged = false;
    if (e.keyCode === 39 && lastMoveKeyCode !== e.keyCode) {
        lastMoveKeyCode = 39;
        move = 1;//right
        moveKeyChanged = true;
    } else if (e.keyCode === 37 && lastMoveKeyCode !== e.keyCode) {
        lastMoveKeyCode = 37;
        move = -1;//left
        moveKeyChanged = true;
    } else if (e.keyCode === 38 && lastMoveKeyCode !== e.keyCode) {
        lastMoveKeyCode = 38;
        move = 0;//up
        moveKeyChanged = true;
    } else if (e.keyCode === 40 && lastMoveKeyCode !== e.keyCode) {
        lastMoveKeyCode = 40;
        move = 2;//down
        moveKeyChanged = true;
    }
    if(moveKeyChanged) socket.emit("move key down", { move: move });
    if (e.keyCode === 32 && !lastShootKeyState) {//space
        socket.emit("shoot key down");
        lastShootKeyState = true;
    }
}
//Checks to see if a pressed key has been released and stops the ships movement if it has
function keyUp(e) {
    var moveKeyReleased = false,
        move = 0;
    if (e.keyCode === 39 && lastMoveKeyCode === e.keyCode) {            //right
        move = 1;
        moveKeyReleased = true;
    } else if (e.keyCode === 37 && lastMoveKeyCode === e.keyCode) {     //left
        move = -1;
        moveKeyReleased = true;
    } else if (e.keyCode === 38 && lastMoveKeyCode === e.keyCode) {     //up
        move = 0;
        moveKeyReleased = true;
    } else if (e.keyCode === 40 && lastMoveKeyCode === e.keyCode) {     //down
        move = 2;
        moveKeyReleased = true;
    }
    if(moveKeyReleased){
        lastMoveKeyCode = 0;
        socket.emit("move key up", {move:move});
    }
    if (e.keyCode === 32) {
        lastShootKeyState = false;
        socket.emit("shoot key up");
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