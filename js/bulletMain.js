/**
 * Created with JetBrains WebStorm.
 * User: AnhTuan
 * Date: 9/26/13
 * Time: 1:57 PM
 * To change this template use File | Settings | File Templates.
 */

//input: x,y,direction of the bullet
//push new bullet into array and emit to server
function shooting(x,y,direction) {
    var id = createUUID('xxxx');
    var newBullet = new Bullet(id, x, y, direction, false);
    lasers.push(newBullet);
    socket.emit("new lasers", { id: id, x: x, y: y, direction: direction });
}

//If there are lasers in the lasers array, then this will draw them on the canvas
function drawLaser() {
    for (var i = 0; i < lasers.length; i++) {
        ctx.fillStyle = '#f00';
        ctx.fillRect(lasers[i].x - 2, lasers[i].y - 2, 4, 4);
    }
}

//If we're drawing lasers on the canvas, this moves them in the canvas
function moveLaser() {
    for (var i = 0; i < lasers.length; i++) {
        if (lasers[i].direction == 'up') {
            lasers[i].y -= laserSpeed;
        } else if (lasers[i].direction == 'down') {
            lasers[i].y += laserSpeed;
        } else if (lasers[i].direction == 'right') {
            lasers[i].x += laserSpeed;
        } else if (lasers[i].direction == 'left') {
            lasers[i].x -= laserSpeed;
        }
        if (mapCollision(lasers[i].x, lasers[i].y, 4, 4, 'bullet')) {
            renderBulletDestroyed(lasers[i]);
            lasers[i].isRemoved = true;
        } else if (lasers[i].y < 0 || lasers[i].y > height || lasers[i].x < 0 || lasers[i].x > width) {
            lasers[i].isRemoved = true;
        }
    }
    removeBullet(lasers);
}

function shootDestruction() {
    var foundID = findLayerByName('destructible');
    for (var i = 0; i < lasers.length; i++) {
        var justanumber = 2;
        switch (lasers[i].direction) {
            //bullet travel upward
            case 'up':
                //check behind and at the bullet because the bullet can travel over the brick(bullet travel at 15 pixel while the brick is 10px)
                for (var behindpresent = 10; behindpresent >= 0; behindpresent = behindpresent - 10) {
                    if (tmxloader.map.layers[foundID].data[Math.floor(lasers[i].x / 10)][Math.floor((lasers[i].y + behindpresent) / 10)] != 0 ||
                        tmxloader.map.layers[foundID].data[Math.floor((lasers[i].x - 1) / 10)][Math.floor(((lasers[i].y + behindpresent) / 10))] != 0) {
                        //destroy 4 brick at impact
                        for (var the4tinybrick = -11; the4tinybrick < 20; the4tinybrick = the4tinybrick + 10) {
                            tmxloader.map.layers[foundID].data[Math.floor((lasers[i].x + the4tinybrick) / 10)][Math.floor((lasers[i].y + behindpresent) / 10)] = 0;
                        }
                        lasers[i].isRemoved = true;
                        break;
                    }
                }
                break;
            //bullet travel downward
            case 'down':
                //check behind and at the bullet because the bullet can travel over the brick(bullet travel at 15 pixel while the brick is 10px)
                for (var behindpresent = -10; behindpresent <= 0; behindpresent = behindpresent + 10) {
                    if (tmxloader.map.layers[foundID].data[Math.floor(lasers[i].x / 10)][Math.floor((lasers[i].y + behindpresent) / 10)] != 0 ||
                        tmxloader.map.layers[foundID].data[Math.floor((lasers[i].x - 1) / 10)][Math.floor(((lasers[i].y + behindpresent) / 10))] != 0) {
                        //destroy 4 brick at impact
                        for (var the4tinybrick = -11; the4tinybrick < 20; the4tinybrick = the4tinybrick + 10) {
                            tmxloader.map.layers[foundID].data[Math.floor((lasers[i].x + the4tinybrick) / 10)][Math.floor((lasers[i].y + behindpresent) / 10)] = 0;
                        }
                        lasers[i].isRemoved = true;
                        break;
                    }
                }
                break;
            //bullet travel to the left
            case 'left':
                //check behind and at the bullet because the bullet can travel over the brick(bullet travel at 15 pixel while the brick is 10px)
                for (var behindpresent = 10; behindpresent >= 0; behindpresent = behindpresent - 10) {
                    if (tmxloader.map.layers[foundID].data[Math.floor((lasers[i].x + behindpresent) / 10)][Math.floor(lasers[i].y / 10)] != 0 ||
                        tmxloader.map.layers[foundID].data[Math.floor(((lasers[i].x + behindpresent) / 10))][Math.floor((lasers[i].y - 1) / 10)] != 0) {
                        //destroy 4 brick at impact
                        for (var the4tinybrick = -11; the4tinybrick < 20; the4tinybrick = the4tinybrick + 10) {
                            tmxloader.map.layers[foundID].data[Math.floor((lasers[i].x + behindpresent) / 10)][Math.floor((lasers[i].y + the4tinybrick) / 10)] = 0;
                        }
                        lasers[i].isRemoved = true;
                        break;
                    }
                }
                break;
            //bullet travel to the right
            case 'right':
                //check behind and at the bullet because the bullet can travel over the brick(bullet travel at 15 pixel while the brick is 10px)
                for (var behindpresent = -10; behindpresent <= 0; behindpresent = behindpresent + 10) {
                    var x1 = Math.floor((lasers[i].x + behindpresent) / 10),
                        y1 = Math.floor(lasers[i].y / 10),
                        x2 = Math.floor(((lasers[i].x + behindpresent) / 10)),
                        y2 = Math.floor((lasers[i].y - 1) / 10);
                    if (tmxloader.map.layers[foundID].data[Math.floor((lasers[i].x + behindpresent) / 10)][Math.floor(lasers[i].y / 10)] != 0 ||
                        tmxloader.map.layers[foundID].data[Math.floor(((lasers[i].x + behindpresent) / 10))][Math.floor((lasers[i].y - 1) / 10)] != 0) {
                        //destroy 4 brick at impact
                        for (var the4tinybrick = -11; the4tinybrick < 20; the4tinybrick = the4tinybrick + 10) {
                            tmxloader.map.layers[foundID].data[Math.floor((lasers[i].x + behindpresent) / 10)][Math.floor((lasers[i].y + the4tinybrick) / 10)] = 0;
                        }
                        lasers[i].isRemoved = true;
                        break;
                    }
                }
                break;
        }
    }
}

function renderBulletDestroyed(bulletObject) {
    
}

function removeBullet(lasers) {
    if(lasers.length==0) return;
    var endOfArray = false;
    while(!endOfArray) {
        for (var i = 0; i < lasers.length; i++) {
            if(i==lasers.length-1) {
                endOfArray=true;
            }
            if(lasers[i].isRemoved) {
                lasers.splice(i, 1);
                //get out of loop
                i = lasers.length;
            }
        }
    }
}
