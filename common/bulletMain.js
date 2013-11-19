if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
    var helper = require('./helper'),
        hitTest = require('./collision_hitTest'),
        mapCollision = hitTest.mapCollision,
        Bullet = require('./dto/bullet').Bullet,
        tmxloader = require('../server/js/TMX_Engine').tmxloader,
        socket = require('../server/js/socket').socket;
} else {
    lasers = [];
}
var laserSpeed = 15;
//input: x,y,direction of the bullet
//push new bullet into array and emit to server
//client only
function shooting(x,y,direction) {
    var id = helper.createUUID('xxxx');
    var newBullet = new Bullet(id, x, y, direction);
    lasers.push(newBullet);
    return id;
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
            lasers[i].isRemoved = true;
        } else if (lasers[i].y < 0 || lasers[i].y > tmxloader.map.height * tmxloader.map.tileHeight || lasers[i].x < 0 || lasers[i].x > tmxloader.map.width * tmxloader.map.tileWidth) {
            lasers[i].isRemoved = true;
        }
    }
    removeBullet(lasers);
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

if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
    exports.moveLaser = moveLaser;
}