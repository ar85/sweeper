// JavaScript Document

var Sweeper = (function(){
	
	var boxSize = 16, // size of box in pixels
		grid, // grid array
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
				
				$field.width( (inGridWidth*boxSize) + "px");
				$field.height( (inGridHeight*boxSize) + "px");						
			}
		}
	
})();

$(document).ready(function(){
	Sweeper.InitGame(8, 8, 8);
});