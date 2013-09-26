/**
 * Created with JetBrains WebStorm.
 * User: AnhTuan
 * Date: 9/20/13
 * Time: 10:24 AM
 * To change this template use File | Settings | File Templates.
 */

//input: bot array
//move the bot according to there foundPath
function movingBot(bot) {
    //bot current coordianate is calculate base on ship_w/h, not tileWidth/height
    var pixelX = bots[bot].pathFound[bots[bot].whereNow + 1][0] * ship_w,
        pixelY = bots[bot].pathFound[bots[bot].whereNow + 1][1] * ship_h,
        differenceX = bots[bot].getX() - pixelX,
        differenceY = bots[bot].getY() - pixelY;
    //go vertically
    if (differenceX == 0 && differenceY != 0) {
        //down or up
        if (differenceY > 0) {
            bots[bot].setY(bots[bot].getY() - enemySpeed);
            bots[bot].direction = 'up';
        } else {
            bots[bot].setY(bots[bot].getY() + enemySpeed);
            bots[bot].direction = 'down';
        }
        //go horizontally
    } else if (differenceY == 0 && differenceX != 0) {
        //right or left
        if (differenceX > 0) {
            bots[bot].setX(bots[bot].getX() - enemySpeed);
            bots[bot].direction = 'left';
        } else {
            bots[bot].setX(bots[bot].getX() + enemySpeed);
            bots[bot].direction = 'right';
        }
    } else {
        bots[bot].whereNow++;
    }
}

function findNewPath(bot) {
    pathStart = [Math.floor(bots[bot][0] / 32), Math.floor(bots[bot][1] / 32)];
    var random = randomNumber(0, botDestination.length);
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
    /////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////
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