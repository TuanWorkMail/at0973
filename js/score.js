

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
    /*
    ctx.fillText('Score: ', 10, 55);
    ctx.fillText(score, 70, 55);
    ctx.fillText('Lives:', 10, 30);
    ctx.fillText(lives, 68, 30);
    */
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
        ctx.fillRect((width / 2) - 60, (height / 2) + 10, 100, 40);
        ctx.fillStyle = '#000';
        ctx.fillText('Continue?', 250, (height / 2) + 35);
        canvas.addEventListener('click', continueButton, false);
    }
}

function gameStart() {
    gameStarted = true;
    canvas.removeEventListener('click', gameStart, false);
}