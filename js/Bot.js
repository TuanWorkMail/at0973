
//Cycles through the array and draws the updated enemy position
function drawEnemies() {
    for (var i = 0; i < enemies.length; i++) {
        ctx.drawImage(enemy, enemies[i][0], enemies[i][1]);
    }
}
	
var
    pathStart,
    pathStartX,
    pathStartY,
    pathEnd,
    thePath,
    thePathX,
    thePathY,
    c,//currently headed to which target in thePath
    enemiesGroup,
    //grid = new PF.Grid(20, 20, world),
    //finder = new PF.AStarFinder(),
    //where bot will spawn, each map have a number of predefined point
    whereSpawn = 0,
    check = true,
    reachedCheck = [],
    enemyIntelligence = 0,
    whereNow = [],
    pathFound = [],
    //check if run for first time
    firstRun = true;

	
		
function moveEnemies() {
    //pathEnd = [Math.floor(ship_x / 32), Math.floor(ship_y / 32)];
    //array hold all enemies
    //get the spawn point in enemiesGroup into enemies array and max 2 enemies
    while (enemies.length < enemiesGroup.length && enemies.length < 2) {
        if (enemyIntelligence == 0) {
            enemyIntelligence = 1;
        } else if (enemyIntelligence == 1) {
            enemyIntelligence = 0;
        }
        enemies.push([enemiesGroup[whereSpawn].x, enemiesGroup[whereSpawn].y, enemyIntelligence]);
        if (whereSpawn < enemiesGroup.length - 1) {
            whereSpawn++;
        } else {
            whereSpawn = 0;
        }
    }
    //initialize
    if (firstRun) {
        for (var i = 0; i < enemies.length; i++)
            reachedCheck[i] = 1;
        firstRun = false;
    }
    for (var bot = 0; bot < enemies.length; bot++) {
        //check if bot reached destination, if yes then choose another destination
        if (reachedCheck[bot] = 1) {
            pathStart = [Math.floor(enemies[bot][0] / 32),
                            Math.floor(enemies[bot][1] / 32)];
            //NOTE ~~ and ( | 0) is similar to Math.floor but it only truncated not round the number
            //random number from 1 to botDestination.length
            var desti = (Math.random() * botDestination.length | 0) + 1;//~~(Math.random() * 6) + 1
            //pathEnd is random point in botDestination array
            pathEnd = [~~(botDestination[desti - 1].x / 32), (botDestination[desti - 1].y / 32 | 0)];
            pathFound[bot] = findPath(world, pathStart, pathEnd);
            //WARNING: thePath is the tile array, not PIXEL, you have to CONVERT it to use it
            //bot havent reached destination
            reachedCheck[bot] = 0;
            //bot currently at the starting tile
            whereNow[bot] = 0;
        }
        //if bot havent reached destination yet
        if (whereNow[bot] < pathFound[bot].length) {
            //convert to pixel
            thePathX = pathFound[bot][whereNow[bot]][0] * 32;
            thePathY = pathFound[bot][whereNow[bot]][1] * 32;
            //coordinate difference between object and destination
            xDiff = enemies[bot][0] - thePathX;
            yDiff = enemies[bot][1] - thePathY;
            //go vertically
            if (xDiff == 0) {
                //down or up
                if (yDiff > 0) {
                    enemies[bot][1] -= enemySpeed;
                } else {
                    enemies[bot][1] += enemySpeed;
                }
                //go horizontally
            } else if (yDiff == 0) {
                //right or left
                if (xDiff > 0) {
                    enemies[bot][0] -= enemySpeed;
                } else {
                    enemies[bot][0] += enemySpeed;
                }
            }
        }
        if (whereNow[bot] == pathFound.length) {
        }
    }
    //////////////////////////////////////////////////
    //the super human intelligent bot
    if (false) {
        for (var i = 0; i < enemies.length; i++) {
            pathStart = [Math.floor(enemies[i][0] / 32),
                            Math.floor(enemies[i][1] / 32)];
            thePath = findPath(world, pathStart, pathEnd);
            //var path = finder.findPath(pathStart[0], pathStart[1], pathEnd[0], pathEnd[1], grid);
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
                        //if ship and enemies on the same column
                        if (thePath[0][0] == thePath[thePath.length - 1][0]) {
                            if (thePath[0][1] - thePath[thePath.length - 1][1] < 0) {
                                //down
                                lasers.push([enemies[i][0] + enemy_w / 2, enemies[i][1] + enemy_h + 32, 2]);
                            } else {
                                //up
                                lasers.push([enemies[i][0] + enemy_w / 2, enemies[i][1] - 32, 0]);
                            }
                        } else {
                            if (thePath[0][0] - thePath[thePath.length - 1][0] < 0) {
                                //right
                                lasers.push([enemies[i][0] + enemy_w + 32, enemies[i][1] + enemy_h / 2, 1]);
                            } else {
                                //left
                                lasers.push([enemies[i][0] - 32, enemies[i][1] + enemy_h / 2, -1]);
                            }
                        }
                    }
                }


                //if enemies between A & B, go to B, else go to A(turning a corner)
                if ((thePath[0][0] * 32 == enemies[i][0] && thePath[1][0] * 32 == enemies[i][0]))
                    c = 1;
                else if (thePath[0][1] * 32 == enemies[i][1] && thePath[1][1] * 32 == enemies[i][1])
                    c = 1;
                else c = 0;
                //convert to pixel
                thePathX = thePath[c][0] * 32;
                thePathY = thePath[c][1] * 32;
                //coordinate difference between object and destination
                xDiff = enemies[i][0] - thePathX;
                yDiff = enemies[i][1] - thePathY;
                //go vertically
                if (xDiff == 0) {
                    //down or up
                    if (yDiff > 0) {
                        enemies[i][1] -= enemySpeed;
                    } else {
                        enemies[i][1] += enemySpeed;
                    }
                    //go horizontally
                } else if (yDiff == 0) {
                    //right or left
                    if (xDiff > 0) {
                        enemies[i][0] -= enemySpeed;
                    } else {
                        enemies[i][0] += enemySpeed;
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
function hitTestEnemies() {
    var enemy_xw,
        enemy_yh,
        check = false;

    for (var i = 0; i < lasers.length; i++) {
        for (var obj = 0; obj < enemies.length; ++obj) {

            enemy_xw = enemies[obj][0] + enemy_w;
            enemy_yh = enemies[obj][1] + enemy_h;

            if (lasers[i][0] < enemy_xw && lasers[i][1] < enemy_yh && lasers[i][0] > enemies[obj][0] && lasers[i][1] > enemies[obj][1]) {
                check = true;
                enemies.splice(obj, 1);
                lasers.splice(i, 1);
            }
        }
    }
}







// world is a 2d array of integers (eg world[10][15] = 0)
// pathStart and pathEnd are arrays like [5,10]
function findPath(world, pathStart, pathEnd)
{
	// shortcuts for speed
	var	abs = Math.abs;
	var	max = Math.max;
	var	pow = Math.pow;
	var	sqrt = Math.sqrt;

	// the world data are integers:
	// anything higher than this number is considered blocked
	// this is handy is you use numbered sprites, more than one
	// of which is walkable road, grass, mud, etc
	var maxWalkableTileNum = 0;

    //If your game world is rectangular, 
    // just fill the array with dummy values to pad the empty space.
	if (world.length > world[0].length) {
	    for (var j = 0; j < world.length; j++) {
	        for (var i = 1; i <= world.length - world[0].length; i++) {
	            world[j][world.length + i] = 1;
	        }
	    }
	}

	// keep track of the world dimensions
    // Note that this A-star implementation expects the world array to be square: 
	// it must have equal height and width. If your game world is rectangular, 
	// just fill the array with dummy values to pad the empty space.
	var worldWidth = world[0].length;
	var worldHeight = world.length;
	var worldSize =	worldWidth * worldHeight;

	// which heuristic should we use?
	// default: no diagonals (Manhattan)
	var distanceFunction = ManhattanDistance;
	var findNeighbours = function(){}; // empty

	/*

	// alternate heuristics, depending on your game:

	// diagonals allowed but no sqeezing through cracks:
	var distanceFunction = DiagonalDistance;
	var findNeighbours = DiagonalNeighbours;

	// diagonals and squeezing through cracks allowed:
	var distanceFunction = DiagonalDistance;
	var findNeighbours = DiagonalNeighboursFree;

	// euclidean but no squeezing through cracks:
	var distanceFunction = EuclideanDistance;
	var findNeighbours = DiagonalNeighbours;

	// euclidean and squeezing through cracks allowed:
	var distanceFunction = EuclideanDistance;
	var findNeighbours = DiagonalNeighboursFree;

	*/

	// distanceFunction functions
	// these return how far away a point is to another

	function ManhattanDistance(Point, Goal)
	{	// linear movement - no diagonals - just cardinal directions (NSEW)
		return abs(Point.x - Goal.x) + abs(Point.y - Goal.y);
	}

	function DiagonalDistance(Point, Goal)
	{	// diagonal movement - assumes diag dist is 1, same as cardinals
		return max(abs(Point.x - Goal.x), abs(Point.y - Goal.y));
	}

	function EuclideanDistance(Point, Goal)
	{	// diagonals are considered a little farther than cardinal directions
		// diagonal movement using Euclide (AC = sqrt(AB^2 + BC^2))
		// where AB = x2 - x1 and BC = y2 - y1 and AC will be [x3, y3]
		return sqrt(pow(Point.x - Goal.x, 2) + pow(Point.y - Goal.y, 2));
	}

	// Neighbours functions, used by findNeighbours function
	// to locate adjacent available cells that aren't blocked

	// Returns every available North, South, East or West
	// cell that is empty. No diagonals,
	// unless distanceFunction function is not Manhattan
	function Neighbours(x, y)
	{
		var	N = y - 1,
		S = y + 1,
		E = x + 1,
		W = x - 1,
		myN = N > -1 && canWalkHere(x, N),
		myS = S < worldHeight && canWalkHere(x, S),
		myE = E < worldWidth && canWalkHere(E, y),
		myW = W > -1 && canWalkHere(W, y),
		result = [];
		if(myN)
		result.push({x:x, y:N});
		if(myE)
		result.push({x:E, y:y});
		if(myS)
		result.push({x:x, y:S});
		if(myW)
		result.push({x:W, y:y});
		findNeighbours(myN, myS, myE, myW, N, S, E, W, result);
		return result;
	}

	// returns every available North East, South East,
	// South West or North West cell - no squeezing through
	// "cracks" between two diagonals
	function DiagonalNeighbours(myN, myS, myE, myW, N, S, E, W, result)
	{
		if(myN)
		{
			if(myE && canWalkHere(E, N))
			result.push({x:E, y:N});
			if(myW && canWalkHere(W, N))
			result.push({x:W, y:N});
		}
		if(myS)
		{
			if(myE && canWalkHere(E, S))
			result.push({x:E, y:S});
			if(myW && canWalkHere(W, S))
			result.push({x:W, y:S});
		}
	}

	// returns every available North East, South East,
	// South West or North West cell including the times that
	// you would be squeezing through a "crack"
	function DiagonalNeighboursFree(myN, myS, myE, myW, N, S, E, W, result)
	{
		myN = N > -1;
		myS = S < worldHeight;
		myE = E < worldWidth;
		myW = W > -1;
		if(myE)
		{
			if(myN && canWalkHere(E, N))
			result.push({x:E, y:N});
			if(myS && canWalkHere(E, S))
			result.push({x:E, y:S});
		}
		if(myW)
		{
			if(myN && canWalkHere(W, N))
			result.push({x:W, y:N});
			if(myS && canWalkHere(W, S))
			result.push({x:W, y:S});
		}
	}

	// returns boolean value (world cell is available and open)
	function canWalkHere(x, y)
	{
		return ((world[x] != null) &&
			(world[x][y] != null) &&
			(world[x][y] <= maxWalkableTileNum));
	};

	// Node function, returns a new object with Node properties
	// Used in the calculatePath function to store route costs, etc.
	function Node(Parent, Point)
	{
		var newNode = {
			// pointer to another Node object
			Parent:Parent,
			// array index of this Node in the world linear array
			value:Point.x + (Point.y * worldWidth),
			// the location coordinates of this Node
			x:Point.x,
			y:Point.y,
			// the heuristic estimated cost
			// of an entire path using this node
			f:0,
			// the distanceFunction cost to get
			// from the starting point to this node
			g:0
		};

		return newNode;
	}

	// Path function, executes AStar algorithm operations
	function calculatePath()
	{
		// create Nodes from the Start and End x,y coordinates
		var	mypathStart = Node(null, {x:pathStart[0], y:pathStart[1]});
		var mypathEnd = Node(null, {x:pathEnd[0], y:pathEnd[1]});
		// create an array that will contain all world cells
		var AStar = new Array(worldSize);
		// list of currently open Nodes
		var Open = [mypathStart];
		// list of closed Nodes
		var Closed = [];
		// list of the final output array
		var result = [];
		// reference to a Node (that is nearby)
		var myNeighbours;
		// reference to a Node (that we are considering now)
		var myNode;
		// reference to a Node (that starts a path in question)
		var myPath;
		// temp integer variables used in the calculations
		var length, max, min, i, j;
		// iterate through the open list until none are left
		while(length = Open.length)
		{
			max = worldSize;
			min = -1;
			for(i = 0; i < length; i++)
			{
				if(Open[i].f < max)
				{
					max = Open[i].f;
					min = i;
				}
			}
			// grab the next node and remove it from Open array
			myNode = Open.splice(min, 1)[0];
			// is it the destination node?
			if(myNode.value === mypathEnd.value)
			{
				myPath = Closed[Closed.push(myNode) - 1];
				do
				{
					result.push([myPath.x, myPath.y]);
				}
				while (myPath = myPath.Parent);
				// clear the working arrays
				AStar = Closed = Open = [];
				// we want to return start to finish
				result.reverse();
			}
			else // not the destination
			{
				// find which nearby nodes are walkable
				myNeighbours = Neighbours(myNode.x, myNode.y);
				// test each one that hasn't been tried already
				for(i = 0, j = myNeighbours.length; i < j; i++)
				{
					myPath = Node(myNode, myNeighbours[i]);
					if (!AStar[myPath.value])
					{
						// estimated cost of this particular route so far
						myPath.g = myNode.g + distanceFunction(myNeighbours[i], myNode);
						// estimated cost of entire guessed route to the destination
						myPath.f = myPath.g + distanceFunction(myNeighbours[i], mypathEnd);
						// remember this new path for testing above
						Open.push(myPath);
						// mark this node in the world graph as visited
						AStar[myPath.value] = true;
					}
				}
				// remember this route as having no more untested options
				Closed.push(myNode);
			}
		} // keep iterating until the Open list is empty
		return result;
	}

	// actually calculate the a-star path!
	// this returns an array of coordinates
	// that is empty if no path is possible
	return calculatePath();

} // end of findPath() function
