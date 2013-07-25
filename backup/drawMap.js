
/**
 * Utility function to clear the screen
 */
function clear(){
     ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
}








///////////////////////////////////////////////
        //Inefficiently draw all the objects even though they may not be in the viewport.....you probably shoudn't do this....
       	/*var objectGroup = tmxloader.map.objectgroup['Enemies'].objects;
        for(var obj = 0; obj < objectGroup.length; ++obj){
         	ctx.save();
         	
         	var text = objectGroup[obj].name;  	
      	 	ctx.textAlign = "right";
			ctx.textBaseline = "bottom";
			ctx.fillText(text,objectGroup[obj].x-viewport.x,objectGroup[obj].y-viewport.y-10);
         	
   		 	ctx.fillStyle = "white";
    		ctx.fillRect(objectGroup[obj].x-viewport.x,objectGroup[obj].y-viewport.y,objectGroup[obj].width,objectGroup[obj].height);
    		ctx.strokeStyle = "red";
   			ctx.strokeRect(objectGroup[obj].x-viewport.x,objectGroup[obj].y-viewport.y,objectGroup[obj].width,objectGroup[obj].height);        
    		ctx.restore();
        }
        
         	
       	var text = "viewport: " + viewport.x + ", " + viewport.y + " " + " X: " + x + " Y: " + y;
       	
       	ctx.textAlign = "right";
		ctx.textBaseline = "bottom";
		ctx.fillText(text,200,10);


}/////////////////////////////////////////////////////////////////


//// Input Events
 
function onKeyDown(evt) {
	    //Escape
	  	if (evt.keyCode == 27){
			viewport_x = 0;
			viewport_y = 0;
	  	}
	  	  	 
	  	//Left
	  	if (evt.keyCode == 37){	  		
	  		viewport_x -=32;
	  	} else if (evt.keyCode == 38){ //UP
	  		viewport_y-=32;
	  	} else if (evt.keyCode == 39){ // Right
			viewport_x+=32
	  	} else if (evt.keyCode == 40){ //Down
	  		viewport_y+=32;
  		}
  		
  		if(viewport_x<0) viewport_x=0;
  		if(viewport_y<0) viewport_y=0;
  		if(viewport_x>tmxloader.map.width*tmxloader.map.tileWidth-viewport.width) viewport_x=tmxloader.map.width*tmxloader.map.tileWidth-viewport.width;
  		if(viewport_y>tmxloader.map.height*tmxloader.map.tileHeight-viewport.height) viewport_y=tmxloader.map.height*tmxloader.map.tileHeight-viewport.height;
 		
}
*/