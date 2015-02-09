// JavaScript Document

var Sweeper = (function(){
	
	var boxSize = 15, // size of box in pixels (including margin)
		$field,
		grid = [], // grid array
		gridWidth, // grid width in boxes
		gridHeight, // grid height in boxes
	    //gameStates = Object.freeze({
		//}),
		indexStates = Object.freeze({
			OPEN: 1,
			CLOSED: 2,
		}),
	    boxStates = Object.freeze({
			CLOSED_BLANK: 1,
			CLOSED_FLAGGED: 2,
		}),
		
		floorStates = Object.freeze({
			FLOOR_EMPTY: 1,
			FLOOR_MINE: 2
		}),
		
		render = function(){
			
		},
		
		getRandomInt = function(min, max){
			return Math.floor(Math.random() * (max - min) + min);	
		},
		
		initField = function(initGridWidth, initGridHeight){
			
			$field = $(".field");	
			
			// set the field width and height
			$field.width( (gridWidth*boxSize) + "px");
			$field.height( (gridHeight*boxSize) + "px");
		},
		initGrid = function(){			
			
			// create the main grid array
			for(var c = 0; c < gridWidth; c++)
			{
				grid[c] = [];
				for(var r = 0; r < gridHeight; r++)
				{
					grid[c][r] = [];
					initGridIndex(c, r);
				}
			}
		},
		
		initGridIndex = function(xPos, yPos){
			var $item = $('<span class="box"></span>');
			$item.click((function(xPos, yPos, callback){
			
				return function(){
					callback(xPos, yPos);	
				}
				
			})(xPos, yPos, onBoxClick)).appendTo($field);
			
			grid[xPos][yPos] = {
				elem: $item,
				indexState: indexStates.OPEN,
				boxState: boxStates.CLOSED_BLANK,
				floorState: floorStates.FLOOR_EMPTY,
				floorNum: 0
			};
			
		},
		
		setMines = function(mineCount){
			
			var spaces = gridWidth * gridHeight,
				randVals = [],
				mines = [];
			
			for(var i = 0; i < mineCount; i++){
				var rand = getRandomInt(0, spaces);
				if($.inArray(rand, randVals) >= 0){
					i-=1;
					continue;	
				}
				randVals.push(rand)
				
				var x = Math.floor(rand/gridWidth),
					y = rand%gridWidth;
				
				grid[x][y].floorState = floorStates.FLOOR_MINE;
				
				mines[i] = [];
				mines[i][0] = x;
				mines[i][1] = y;
			}
			
			for(var i = 0; i < mineCount; i++){
				
				var srcX = mines[i][0];
				var srcY = mines[i][1];
				
				var mineXStart = srcX - 1 < 0 ? srcX : srcX - 1,
					mineXEnd = srcX + 1 >= gridWidth ? (gridWidth-1) : srcX + 1,
				    mineYStart = srcY - 1 < 0 ? srcY : srcY - 1,
					mineYEnd = srcY + 1 >= gridHeight ? (gridWidth-1) : srcY + 1;
										
				for(var x = mineXStart; x <= mineXEnd; x++){
					for(var y = mineYStart; y <= mineYEnd; y++){
						
						if(grid[x][y].floorState != floorStates.FLOOR_MINE){
							grid[x][y].floorNum += 1;
								
						}
					}		
				}
			}
		},
		
		updateGridIndex = function(xPos, yPos){
			
			var gi = grid[xPos][yPos];
			
			switch(gi.indexState){
				case indexStates.CLOSED:
					gi.elem.removeClass("box-open").addClass("box-closed");
				break;
				
				case indexStates.OPEN:
					gi.elem.removeClass("box-closed");
					
					switch(gi.floorState){
						case floorStates.FLOOR_EMPTY:
							if(gi.floorNum > 0){
								gi.elem.text(gi.floorNum);	
							}
						break;	
						case floorStates.FLOOR_MINE:
							gi.elem.addClass("box-mine");
						break;	
					}
				break;
			}
		},
		
		updateAll = function(){
			for(var x = 0; x < gridWidth; x++)
			{
				for(var y = 0; y < gridHeight; y++) {
					updateGridIndex(x, y);	
				}
			}
		},
		
		onBoxClick = function(xPos, yPos){
			
			console.log("x: " + xPos + ", y: " + yPos);				
		}
		;
		
		return {
			InitGame: function(inGridWidth, inGridHeight, mineCount){
				
				gridWidth = inGridWidth;
				gridHeight = inGridHeight;
				
				initField();				
				initGrid();
				setMines(mineCount);	
				updateAll();			
			},
			
			
		};
	
})();

$(document).ready(function(){
	Sweeper.InitGame(16, 16, 32);
});