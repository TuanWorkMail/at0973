
//if host draw from bots, if guest draw from remoteBots
function drawBot(host) {
    if (host == true) {
        for (var i = 0; i < bots.length; i++) {
            ctx.drawImage(bot, bots[i].getX(), bots[i].getY());
        }
    } else {
        for (var i = 0; i < remoteBots.length; i++) {
            ctx.drawImage(bot, remoteBots[i].getX(), remoteBots[i].getY());
        }
    }
    //drawPath();
}
	
var maximumBot = 2,
    pathStart,
    pathStartX,
    pathStartY,
    pathEnd,
    thePath,
    thePathX,
    thePathY,
    c,//currently headed to which target in thePath
    //enemiesGroup,

    //grid = new PF.Grid(20, 20, world),
    //finder = new PF.AStarFinder(),
    //where bot will spawn, each map have a number of predefined point
    whereSpawn = 0;

function moveBot() {
    if (host == false) return;
    createBot();
    for (var bot = 0; bot < bots.length; bot++) {
        if (bots[bot].whereNow < bots[bot].pathFound.length - 1) {
            movingBot(bot, ship_w, ship_h);
            socket.emit("bot broadcast", { length: bots.length, bot: bot, x: bots[bot].getX(), y: bots[bot].getY() });
        } else {
            bots[bot].pathFound = botRandomPath(bots[bot].getX(), bots[bot].getY(), ship_w, ship_h);
            bots[bot].whereNow = 0;
        }
    }
}
//add new bot to the array
function createBot() {
    if (whereSpawn == enemiesGroup.length) {
        whereSpawn = 0;
    }
    while (bots.length < maximumBot && whereSpawn < enemiesGroup.length) {
        // Initialise the new bot
        var x = enemiesGroup[whereSpawn].x;
            y = enemiesGroup[whereSpawn].y;
            newBot = new Bot(x, y, botRandomPath(x, y), 0);
        // Add new player to the remote players array
        bots.push(newBot);
        whereSpawn++;
    }
}
//input: current location and width/height of the bot, not the map tile
//output: array of path to a random point
function botRandomPath(x, y, width, height) {
    var check = true;
    while (check) {
        pathStart = [Math.floor(x / width), Math.floor(y / height)];
        var randomNumber = Math.floor(Math.random() * botDestination.length);
        pathEnd = [Math.floor(botDestination[randomNumber].x / width), Math.floor(botDestination[randomNumber].y / height)];
        if (pathStart[0] != pathEnd[0] || pathStart[1] != pathEnd[1]) {
            check = false;
        }
    } 
    return pathFinder(combine16to1tile(combineTileLayer()), pathStart, pathEnd);
}
//input: bot array, width and height of the bot, not the tileWidth/height
//move the bot according to there foundPath
function movingBot(bot, width, height) {
    var pixelX = bots[bot].pathFound[bots[bot].whereNow + 1][0] * width,
        pixelY = bots[bot].pathFound[bots[bot].whereNow + 1][1] * height,
        differenceX = bots[bot].getX() - pixelX,
        differenceY = bots[bot].getY() - pixelY;
    //go vertically
    if (differenceX == 0 && differenceY != 0) {
        //down or up
        if (differenceY > 0) {
            bots[bot].setY(bots[bot].getY() - enemySpeed);
        } else {
            bots[bot].setY(bots[bot].getY() + enemySpeed);
        }
        //go horizontally
    } else if (differenceY == 0 && differenceX != 0) {
        //right or left
        if (differenceX > 0) {
            bots[bot].setX(bots[bot].getX() - enemySpeed);
        } else {
            bots[bot].setX(bots[bot].getX() + enemySpeed);
        }
    } else {
        bots[bot].whereNow++;
    }
}
function drawPath() {
    for (var i = 0; i < bots.length; i++) {
        for (var rp = 0; rp < bots[i].pathFound.length; rp++) {
            switch (rp) {
                case 0:
                    spriteNum = 10; // start
                    break;
                case bots[i].pathFound.length -1:
                    spriteNum = 1; // end
                    break;
                default:
                    spriteNum = 4; // path node
                    break;
            }
            ctx.drawImage(spriteSheet, spriteNum * 32, 0, 32, 32, bots[i].pathFound[rp][0] * 32, bots[i].pathFound[rp][1] * 32, 32, 32);
        }
    }
}

//combine all the tile layers together for pathfinding
//output: 1 combined layer
function combineTileLayer() {
    var combined = [];
    for (var layer = 0; layer < tmxloader.map.layers.length; layer++) {
        if (tmxloader.map.layers[layer].name == 'overhead')
            continue;
        //first use 1 layer as the start
        if (combined.length == 0) {
            combined = tmxloader.map.layers[layer].data;
            continue;
        }
        //if combined is 0 and layer is not 0, combined = 1 (unwalkable)
        for (var i = 0; i < tmxloader.map.width; i++) {
            for (var j = 0; j < tmxloader.map.height; j++) {
                if (combined[i][j] == 0 && tmxloader.map.layers[layer].data[i][j] != 0) {
                    combined[i][j] = 1;
                }
            }
        }
    }
    return combined;
}
//input: the small tile layer
//combine 4x4 into 1 big tile
//check if any tile in 4x4 is unwalkable, make the big tile unwalkable too
//output: the big tile layer
function combine16to1tile(combined) {
    var combinedBig = [];
    for (var width = 0; width < tmxloader.map.width / 4; width++) {
        combinedBig[width] = [];
        for (var height = 0; height < tmxloader.map.height / 4; height++) {
            //if any of 4x4 is unwalkable, flag it unwalkable
            var flag = false;
            for (var i = 0; i < 4; i++) {
                for (var j = 0; j < 4; j++) {
                    if (combined[width * 4 + i][height * 4 + j] != 0)
                        flag = true;
                }
            }
            if (flag) {
                combinedBig[width][height] = 1;
            } else {
                combinedBig[width][height] = 0;
            }
        }
    }
    return combinedBig;
}

function drawTileLayerRaw(combinedBig) {
    for (var i = 0; i < combinedBig.length; i++) {
        for (var j = 0; j < combinedBig[i].length; j++) {
            document.getElementById('tile').innerHTML += combinedBig[j][i];
            document.getElementById('tile').innerHTML += '  ,  ';//4
        }
        document.getElementById('tile').innerHTML += '<br />';
    }
    document.getElementById('tile').innerHTML += '<br />';
}

function hitTestBot() {
    var enemy_xw,
        enemy_yh,
        check = false;

    for (var i = 0; i < lasers.length; i++) {
        for (var obj = 0; obj < bots.length; ++obj) {

            enemy_xw = bots[obj][0] + enemy_w;
            enemy_yh = bots[obj][1] + enemy_h;

            if (lasers[i][0] < enemy_xw && lasers[i][1] < enemy_yh && lasers[i][0] > bots[obj][0] && lasers[i][1] > bots[obj][1]) {
                check = true;
                bots.splice(obj, 1);
                lasers.splice(i, 1);
            }
        }
    }
}
/*
function findNewPath(bot) {
    pathStart = [Math.floor(bots[bot][0] / 32), Math.floor(bots[bot][1] / 32)];
    var random = Math.floor(Math.random() * botDestination.length);
    pathEnd = [Math.floor(botDestination[random].x / 32), Math.floor(botDestination[random].y / 32)];
    pathFound[bot] = pathFinder(world, pathStart, pathEnd);
    //WARNING: pathFound is the tile array, not PIXEL, you have to CONVERT it to use it
    arrived[bot] = 0;
    whereNow[bot] = 0;
}
function moveEnemies2() {
    //pathEnd = [Math.floor(ship_x / 32), Math.floor(ship_y / 32)];
    //array hold all bots
    //get the spawn point in enemiesGroup into bots array and max 2 bots
    while (bots.length < enemiesGroup.length && bots.length < 2) {
        if (enemyIntelligence == 0) {
            enemyIntelligence = 1;
        } else if (enemyIntelligence == 1) {
            enemyIntelligence = 0;
        }
        bots.push([enemiesGroup[whereSpawn].x, enemiesGroup[whereSpawn].y, enemyIntelligence]);
        //where bot will spawn, each map have a number of predefined point
        if (whereSpawn < enemiesGroup.length - 1) {
            whereSpawn++;
        } else {
            whereSpawn = 0;
        }
    }
    //initialize
    if (firstRun) {
        for (var i = 0; i < bots.length; i++)
            arrived[i] = 1;
        firstRun = false;
    }
    for (var bot = 0; bot < bots.length; bot++) {
        //check if bot reached destination, if yes then choose another destination
        if (arrived[bot] = 1) {
            pathStart = [Math.floor(bots[bot][0] / 32),
                            Math.floor(bots[bot][1] / 32)];
            //NOTE ~~ and ( | 0) is similar to Math.floor but it only truncated not round the number
            //random number from 1 to botDestination.length
            var desti = (Math.random() * botDestination.length | 0) + 1;//~~(Math.random() * 6) + 1
            //pathEnd is random point in botDestination array
            pathEnd = [~~(botDestination[desti - 1].x / 32), (botDestination[desti - 1].y / 32 | 0)];
            pathFound[bot] = pathFinder(world, pathStart, pathEnd);
            //WARNING: thePath is the tile array, not PIXEL, you have to CONVERT it to use it
            //bot havent reached destination
            arrived[bot] = 0;
            //bot currently at the starting tile
            whereNow[bot] = 0;
        }
        //if bot havent reached destination yet
        if (whereNow[bot] < pathFound[bot].length) {
            //convert to pixel
            thePathX = pathFound[bot][whereNow[bot] + 1][0] * 32;
            thePathY = pathFound[bot][whereNow[bot] + 1][1] * 32;
            //coordinate difference between object and destination
            xDiff = bots[bot][0] - thePathX;
            yDiff = bots[bot][1] - thePathY;
            //go vertically
            if (xDiff == 0 && yDiff != 0) {
                //down or up
                if (yDiff > 0) {
                    bots[bot][1] -= enemySpeed;
                } else {
                    bots[bot][1] += enemySpeed;
                }
                //go horizontally
            } else if (yDiff == 0 && xDiff != 0) {
                //right or left
                if (xDiff > 0) {
                    bots[bot][0] -= enemySpeed;
                } else {
                    bots[bot][0] += enemySpeed;
                }
                //if there no diferrent between bot and destination mean bot reached destination
            } else {
                whereNow[bot]++;
            }
        }
        if (whereNow[bot] == pathFound.length) {
            arrived[bot] = 1;
        }
        // draw the path
        for (rp = 0; rp < pathFound.length; rp++) {
            switch (rp) {
                case 0:
                    spriteNum = 2; // start
                    break;
                case pathFound.length - 1:
                    spriteNum = 3; // end
                    break;
                default:
                    spriteNum = 4; // path node
                    break;
            }

            ctx.drawImage(spriteSheet, spriteNum * 32, 0, 32, 32, pathFound[rp][0] * 32, pathFound[rp][1] * 32, 32, 32);
        }
    }
    //////////////////////////////////////////////////
    //the super human intelligent bot
    if (false) {
        for (var i = 0; i < bots.length; i++) {
            pathStart = [Math.floor(bots[i][0] / 32),
                            Math.floor(bots[i][1] / 32)];
            thePath = pathFinder(world, pathStart, pathEnd);
            //var path = finder.pathFinder(pathStart[0], pathStart[1], pathEnd[0], pathEnd[1], grid);
            //thePath = PF.Util.smoothenPath(grid, path);

            //WARNING: thePath is the tile array, not PIXEL, you have to CONVERT it to use it

            if (thePath.length > 1) {
                check = true;
                //this check if the ship is in 'line of sight' of enemy
                //check if 3 consecutive point on the path is in line
                if (thePath.length > 2) {
                    for (var j = 2; j < thePath.length; j++) {
                        //if 3 point not on the same column
                        if (thePath[j - 2][0] != thePath[j][0] || thePath[j - 1][0] != thePath[j][0]) {
                            //and not on the same row also
                            if (thePath[j - 2][1] != thePath[j][1] || thePath[j - 1][1] != thePath[j][1]) {
                                check = false;
                                break;
                            }
                        }
                    }
                }

                //if the tank is in direct line of sight => enemy shoot
                if (check) {
                    if (thePath[0][0] == thePath[thePath.length - 1][0] || thePath[0][1] == thePath[thePath.length - 1][1]) {
                        //if ship and bots on the same column
                        if (thePath[0][0] == thePath[thePath.length - 1][0]) {
                            if (thePath[0][1] - thePath[thePath.length - 1][1] < 0) {
                                //down
                                lasers.push([bots[i][0] + enemy_w / 2, bots[i][1] + enemy_h + 32, 2]);
                            } else {
                                //up
                                lasers.push([bots[i][0] + enemy_w / 2, bots[i][1] - 32, 0]);
                            }
                        } else {
                            if (thePath[0][0] - thePath[thePath.length - 1][0] < 0) {
                                //right
                                lasers.push([bots[i][0] + enemy_w + 32, bots[i][1] + enemy_h / 2, 1]);
                            } else {
                                //left
                                lasers.push([bots[i][0] - 32, bots[i][1] + enemy_h / 2, -1]);
                            }
                        }
                    }
                }


                //if bots between A & B, go to B, else go to A(turning a corner)
                if ((thePath[0][0] * 32 == bots[i][0] && thePath[1][0] * 32 == bots[i][0]))
                    c = 1;
                else if (thePath[0][1] * 32 == bots[i][1] && thePath[1][1] * 32 == bots[i][1])
                    c = 1;
                else c = 0;
                //convert to pixel
                thePathX = thePath[c][0] * 32;
                thePathY = thePath[c][1] * 32;
                //coordinate difference between object and destination
                xDiff = bots[i][0] - thePathX;
                yDiff = bots[i][1] - thePathY;
                //go vertically
                if (xDiff == 0) {
                    //down or up
                    if (yDiff > 0) {
                        bots[i][1] -= enemySpeed;
                    } else {
                        bots[i][1] += enemySpeed;
                    }
                    //go horizontally
                } else if (yDiff == 0) {
                    //right or left
                    if (xDiff > 0) {
                        bots[i][0] -= enemySpeed;
                    } else {
                        bots[i][0] += enemySpeed;
                    }
                }

                // draw the path
                for (rp = 0; rp < thePath.length; rp++) {
                    switch (rp) {
                        case 0:
                            spriteNum = 2; // start
                            break;
                        case thePath.length - 1:
                            spriteNum = 3; // end
                            break;
                        default:
                            spriteNum = 4; // path node
                            break;
                    }

                    ctx.drawImage(spriteSheet, spriteNum * 32, 0, 32, 32, thePath[rp][0] * 32, thePath[rp][1] * 32, 32, 32);
                }
            }
        }
    }
}
*/