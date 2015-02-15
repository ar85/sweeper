// JavaScript Document

var Sweeper = (function(){
	
	var boxSize = 24, // size of box in pixels (including margin)
		$field,
		grid, // grid array
		gridWidth, // grid width in boxes
		gridHeight, // grid height in boxes
		mineCount,
		mines,
		emptyRemaining,
		flagsRemaining,
		timer,
		secElapsed,
		gameActive,
		$inputNumMines,
		$inputBoardHeight,
		$inputBoardWith,
		$timeDisplay,
		$flagRemainingDisplay,
		isNewGame = true,
		firstInit = true,
		onStartGameCallback = null,
		onEndGameCallback = null,
		onWinGameCallback = null,
		onLoseGameCallback = null,
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
		
		emptyGrid = function() {
			grid = [];	
		},
		getGridIndex = function(xPos, yPos) {
			
					console.log(yPos);
			return grid[yPos][xPos];
		},
		setGridIndex = function(xPos, yPos, gi) {
			grid[yPos][xPos] = gi;	
		},
		
		initField = function(initGridWidth, initGridHeight){
			
			$field = $field || $(".field");	
			$field.empty();
			// set the field width and height
			$field.width( (gridWidth*boxSize) + "px");
			$field.height( (gridHeight*boxSize) + "px");
		},
		initGrid = function(){			
			
			// create the main grid array
			for(var y = 0; y < gridHeight; y++)
			{
				grid[y] = [];
				for(var x = 0; x < gridWidth; x++)
				{
					grid[y][x] = [];
					initGridIndex(x, y);
				}
			}
		},
		
		initGridIndex = function(xPos, yPos){
			var $item = $('<span class="box box-closed"></span>');
			$item.click((function(xPos, yPos, callback){
			
				return function(){
					callback(xPos, yPos);	
				}
				
			})(xPos, yPos, onBoxClick));
			
			$item.mousedown((function(xPos, yPos, callback){
			
				return function(e){
					if(e.which == 3){
						callback(xPos, yPos);
					}
				}
				
			})(xPos, yPos, attemptFlag)).appendTo($field);
			
			setGridIndex(xPos, yPos, {
				elem: $item,
				indexState: indexStates.CLOSED,
				boxState: boxStates.CLOSED_BLANK,
				floorState: floorStates.FLOOR_EMPTY,
				floorNum: 0
			});
			
		},
		
		setMines = function(mineCount, keepMines){
			
			if(typeof keepMines == 'undefined')
				keepMines = false;
				
			if(keepMines == false)
			{
				var spaces = gridWidth * gridHeight,
					randVals = [];
					
				mines = []
				
				for(var i = 0; i < mineCount; i++){
					var rand = getRandomInt(0, spaces);
					if($.inArray(rand, randVals) >= 0){
						i-=1;
						continue;	
					}
					randVals.push(rand)
					
					var x = rand%gridWidth,
						y = Math.floor(rand/gridWidth);
					
					console.log("mine set x: " + x + ", mine set y: " + y);
					
					mines[i] = [];
					mines[i][0] = x;
					mines[i][1] = y;
				}
			
			}
			
			// set each mine whether we decide to keep them or not
			
			for(var i = 0; i < mineCount; i++){
				
					getGridIndex(mines[i][0], mines[i][1]).floorState = floorStates.FLOOR_MINE;	
			}
			
			for(var i = 0; i < mineCount; i++){
				
				var srcX = mines[i][0];
				var srcY = mines[i][1];
							
				eachAdjacentBox(srcX, srcY, function(gi){
					
					if(gi.floorState != floorStates.FLOOR_MINE){
							gi.floorNum += 1;
					}
				});
			}
		},
		
		/*
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
		
		*/
		
		eachGridIndex = function(callback){
			
			for(var x = 0; x < gridWidth; x++){
				for(var y = 0; y < gridHeight; y++){
					//console.log(y);
					callback(grid[y][x], x, y)	
				}
			}
		},
		
		resetGrid = function(){
			
			eachGridIndex(function(gi){
				
				if(gi.floorNum){
					gi.elem.text('');	
				}
				gi.indexState = indexStates.CLOSED;
				gi.boxState = boxStates.CLOSED_BLANK;
				gi.floorState = floorStates.FLOOR_EMPTY;
				gi.floorNum = 0
				
				gi.elem.attr("class", "box box-closed");
			});
		},
		// execute a callback on each adjacent box		
		eachAdjacentBox = function(xPos, yPos, callback){
			
			var mineXStart = xPos - 1 < 0 ? xPos : xPos - 1,
				mineXEnd = xPos + 1 >= gridWidth ? (gridWidth-1) : xPos + 1,
				mineYStart = yPos - 1 < 0 ? yPos : yPos - 1,
				mineYEnd = yPos + 1 >= gridHeight ? (gridHeight-1) : yPos + 1;
				
			for(var x = mineXStart; x <= mineXEnd; x++){
				for(var y = mineYStart; y <= mineYEnd; y++){
					
					//console.log(y);
					callback(grid[y][x], x, y)
							
					
				}		
			}
		},
		
		execBox = function(xPos, yPos){
			
			if(gameActive){
				
				var gi = getGridIndex(xPos, yPos);
				
				if(gi.indexState == indexStates.CLOSED)
				{			
					if(gi.floorState == floorStates.FLOOR_EMPTY)
					{
						openBox(xPos, yPos);
						
						if(gi.floorNum == 0)
						{
							// open the surrounding boxes, if possible
							openBoxExtended(xPos, yPos);
						}
						
						setFlagsRemainingStr();
						
						checkGameProgress();
					}
					else if(gi.floorState == floorStates.FLOOR_MINE)
					{
						// we have a mine
						loseGame();
					}
					
				}
			}
			
		},
		
		initHeader = function(){
			$timeDisplay = $(".time");
			$flagRemainingDisplay = $(".mines");
		},
		
		attemptFlag = function(xPos, yPos){
			
			if(gameActive){
				
				var gi = getGridIndex(xPos, yPos);
				
				if(gi.indexState == indexStates.CLOSED){
					if(gi.boxState == boxStates.CLOSED_BLANK){
						// flag it
						gi.boxState = boxStates.CLOSED_FLAGGED
						flagsRemaining-=1;
						setFlagsRemainingStr();
						gi.elem.attr("class", "box box-flag")
					}
					else if(gi.boxState== boxStates.CLOSED_FLAGGED){
						// remove flag
						gi.boxState = boxStates.CLOSED_BLANK
						flagsRemaining += 1;
						setFlagsRemainingStr();
						gi.elem.attr("class", "box")
					}
				}
			}
		},
		
		openBox = function(xPos, yPos){
			
			var gi = getGridIndex(xPos, yPos);
		
			gi.indexState = indexStates.OPEN;
			gi.elem.attr("class", "box");
			
			emptyRemaining -= 1;
			
			if(gi.boxState == boxStates.CLOSED_FLAGGED){
				flagsRemaining += 1;
			};
			
			if(gi.floorNum > 0){
				gi.elem.addClass("box-num" + gi.floorNum);
			}
			else {
				gi.elem.addClass("box-open");	
			}
		},
		
		setElapsedStr = function(secs){
			
			if(typeof secs === 'undefined')
				secs = secElapsed;
				
			var mins = Math.floor(secs/60);
				minSecs = mins ? secs%(mins*60):secs;
				
			$timeDisplay.text( (mins >= 10 ? "" : "0") + mins + " : " + (minSecs >= 10 ? "" : "0") + minSecs );
		},
		
		setFlagsRemainingStr = function() {
			$flagRemainingDisplay.text(flagsRemaining)
		},
		
		startTimer = function(){
			secElapsed = 0;
			timer = setInterval(function(){
				secElapsed += 1;
				setElapsedStr();
			}, 10);
		},
		
		stopTimer = function(){
			clearTimeout(timer);	
		},
		
		resetTimer = function(){
			setElapsedStr(0);	
		},		
		
		loseGame = function(){
			
			endGame();
			showMines();
			
			
			if(onLoseGameCallback != null) {
				onLoseGameCallback();	
			}
		},
		
		checkGameProgress = function(){
			
			if(emptyRemaining == 0) {
				// game is won
				winGame();
			}
		},
		endGame = function() {
			gameActive = false;
			stopTimer();
			
			if(onEndGameCallback != null) {
				onEndGameCallback(isNewGame);	
			}
		},
		winGame = function(){
			endGame();
			if(onWinGameCallback != null) {
				onWinGameCallback();	
			}
		},
		
		showMines = function(){
			for(var m = 0; m < mineCount; m++){
				var elem = getGridIndex(mines[m][0], mines[m][1]).elem;
				
				elem.removeClass("box-flag").addClass("box-mine");
			}
		},
		
		openBoxExtended = function(xPos, yPos) {
			
			eachAdjacentBox(xPos, yPos, function(gi, x, y){
				
				// only look at the empty states
				// mines, we dont bother with
				if(gi.floorState == floorStates.FLOOR_EMPTY && gi.indexState == indexStates.CLOSED){
					
					openBox(x, y);
					
					if(gi.floorNum == 0){
						openBoxExtended(x, y);
					}					
				}
			});
			
		},
		
		/*
		
		updateAll = function(){
			for(var x = 0; x < gridWidth; x++)
			{
				for(var y = 0; y < gridHeight; y++) {
					updateGridIndex(x, y);	
				}
			}
		},
		
		*/
		
		
		onBoxClick = function(xPos, yPos){
			
			//console.log("x: " + xPos + ", y: " + yPos);
			execBox(xPos, yPos);				
		},
		
		onBoxRightClick = function(xPos, yPos){
			attemptFlag(xPos, yPos);	
		},
		
		initOptions = function(input){
			
			if(firstInit) {
				$inputNumMines = $('input[name="numMines"]');
				$inputBoardWidth = $('input[name="boardWidth"]');
				$inputBoardHeight = $('input[name="boardHeight"]');
				
				
				$inputNumMines.val(mineCount);
				$inputBoardWidth.val(gridWidth);
				$inputBoardHeight.val(gridHeight);
				firstInit = false;
			}
		},
		
		getOption = function(input){
			var index = $.inArray(input, ["numMines", "boardWidth", "boardHeight"]);
			if(index != -1){
				switch(index){
					case 0:
						return parseInt($inputNumMines.val());
					break;
					case 1:
						return parseInt($inputBoardWidth.val());
					break;
					case 2:
						return parseInt($inputBoardHeight.val());
					break;	
				}
			}
		}
		;
		
		return {
			InitGame: function(inGridWidth, inGridHeight, inMineCount){
				
				gameActive = false;
				
				emptyGrid();
				
				gridWidth = inGridWidth;
				gridHeight = inGridHeight;
				mineCount = inMineCount;
				flagsRemaining = mineCount;
				emptyBoxes = (gridWidth*gridHeight)-mineCount;
				
				
				initOptions();
				initField();				
				initGrid();
				initHeader();
				setMines(mineCount);	
				//updateAll();			
			},
			
			StartGame: function(){
				
				if(!gameActive){
					
					var newWidth = getOption("boardWidth"),
						newHeight = getOption("boardHeight"),
						newNumMines = getOption("numMines");
					
					if(newWidth != gridWidth || newHeight != gridHeight || newNumMines != mineCount) {
						
						isNewGame = true;
						this.InitGame(newWidth, newHeight, newNumMines);
					}
					else
					{
						
						resetGrid();
							
						if(isNewGame) {
							
							setMines(mineCount, false);
						}
						else {
							
							setMines(mineCount, true);
						}
					}
					emptyRemaining = gridWidth * gridHeight - mineCount;
									
									
					flagsRemaining = mineCount;
					setFlagsRemainingStr();
					gameActive = true;
					startTimer();
					isNewGame = false;
					
					if(onStartGameCallback != null) {
						onStartGameCallback();	
					}
				}
				else // stop game
				{
					this.EndGame();
				}
			},
			
			EndGame: function(){
				endGame();
			},
			
			NewGame: function(){
				gameActive = false;
				isNewGame = true;
					
				resetTimer();
				
				flagsRemaining = mineCount;
				setFlagsRemainingStr();
				resetGrid();
				setMines(mineCount);
			},
			
			OnStartGame: function(callback){
				onStartGameCallback = callback;
			},
			
			OnEndGame: function(callback){
				onEndGameCallback = callback;
			},
			
			OnWinGame: function(callback){
				onWinGameCallback = callback;
			},
			
			OnLoseGame: function(callback){
				onLoseGameCallback = callback;
			},
			
		};
	
})();

$(document).ready(function(){
	
	$(document).bind("contextmenu", function(){
		return false;
	})
	
	var $inputStartGame = $("#gameStart");
	var $inputNewGame = $("#gameNew");
	var $inputOptions = $("#gameShowOptions");
	var $messageWrap = $(".message");
	
	var optionsVisible = false;			
	$inputStartGame.click(function(){
		Sweeper.StartGame();
	});
	
	$inputNewGame.click(function(){
		$inputStartGame.text("Start Game");
		Sweeper.NewGame();
	});
	
	
	$inputOptions.click(function(){
		$(".options").toggle();
		optionsVisible = optionsVisible ? false : true;
		
		var showOrHide = optionsVisible ? "Hide Options" : "Show Options";
		
		$inputOptions.text(showOrHide);
	});
	
	Sweeper.InitGame(16, 16, 1);
	
	Sweeper.OnStartGame(function(){
		$inputStartGame.text("End Game");
		$inputNewGame.prop("disabled", true);
		$messageWrap.text("");
	});
	
	Sweeper.OnEndGame(function(isNewGame){
		var t = "Start Game";
		if(!isNewGame){
			t = "Restart Game"
		}
		$inputStartGame.text(t);
		$inputNewGame.prop("disabled", false);
	});
	
	Sweeper.OnWinGame(function(){
		$messageWrap.text("You win!");
	});
	
	Sweeper.OnLoseGame(function(){
		$messageWrap.text("You lose!");
	});
});