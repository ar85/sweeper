// JavaScript Document

var Sweeper = (function(){
	
	var boxSize = 16, // size of box in pixels (including border)
		grid = [], // grid array
		gridWidth, // grid width in boxes
		gridHeight, // grid height in boxes
	    //gameStates = Object.freeze({
		//}),
	    indexStates = Object.freeze({
			CLOSED: 1,
			EXPOSED: 2,
		}),
		
		closedStates = Object.freeze({
			BLANK: 1,
			FLAGGED: 2
		}),
		
		openedStates = Object.freeze({
			BLANK: 1,
			NUMBER: 2,
			MINE: 3
		});
		
		return {
			InitGame: function(inGridWidth, inGridHeight, mineCount){
				
				$field = $(".field");
				gridWidth = inGridWidth;
				gridHeight = inGridHeight;				
				
				// create the main grid array
				for(var c = 0; c < gridWidth; c++)
				{
					grid[c] = [];
					for(var r = 0; r < gridHeight; r++)
					{
						var $item = $('<span class="box"></span>');
							$item.click((function(xPos, yPos, sweeper){
							
								return function(){
									sweeper.onBoxClick(xPos, yPos);	
								}
							
						})(c, r, this)).appendTo($field);
						
						grid[c][r] = [$item];
					}
				}
				
				
				// set the field width and height
				$field.width( (gridWidth*boxSize) + "px");
				$field.height( (gridHeight*boxSize) + "px");						
			},
			
			onBoxClick: function(xPos, yPos) {
				console.log("x: " + xPos + ", y: " + yPos);	
			}
			
			
		}
	
})();

$(document).ready(function(){
	Sweeper.InitGame(16, 16, 8);
});