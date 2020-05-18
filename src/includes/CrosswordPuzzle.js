class CrosswordPuzzle {

	/**
	 * Contructor functon for CrosswordPuzzle
	 * @param {Object} wordDictionary - The dictionary of words and hints
	 * @param {number} rows - The number of rows available for the crossword
	 * @param {number} cols - The number of columns available for the crossword
	 */
	constructor( wordDictionary, rows, cols ) {
		this.wordDictionary = {};
		this.hintDictionary = {};
		this.rows = rows;
		this.cols = cols;
		this.hintCounter = 1;

		this.placedLetters = {}; // The letters placed on the board and the position they're found in
		this.placingComplete = false; // Flag used to signify of a word was successfully placed
		this.unplacedWords = []; // Words not placed on the board after running algorithm

		// Get original word list in uppercase without hints
		this.wordList = Object.keys( wordDictionary );
		this.wordList.forEach( ( word, index ) => {
			let uppercaseWord = word.trim().toUpperCase();
			this.wordList[index] = uppercaseWord;
			this.wordDictionary[uppercaseWord] = wordDictionary[word];
		} );

		// Sorted version of the wordlist, longest word length to shortest
		this.sortedWordList = [ ...this.wordList ];
		this.sortedWordList.sort( (a, b) => b.length - a.length );

		// Create a new array representing the board using rows and cols as the dimensions
		this.boardArray = new Array( this.rows );
		this.boardArray.fill( [] );
		this.boardArray.forEach( ( row, index ) => {
			let newRow = new Array( this.cols );
			newRow.fill( '' );
			this.boardArray[index] = newRow;
		} );

		// Create a duplicate of board array that contains the hints for each cell
		this.boardHints = [];
		this.boardArray.forEach( row => {
			this.boardHints.push( [...row] );
		} );
	}

	/**
	 * Returns the game board array
	 */
	getGameBoard = () => {
		return this.boardArray;
	}

	/**
	 * Returns the game's hint board
	 */
	getBoardHints = () => {
		return this.boardHints;
	}

	/**
	 * Returns the game board array
	 */
	getHintDictionary = () => {
		return this.hintDictionary;
	}

	/**
	 * Updates the map of placed characters when a new character is placed
	 * @param {string} char - The character that has just been placed on the board.
	 * @param {number} row - The row index the character is found on.
	 * @param {number} col - The column index the character is found on.
	 * @param {number} direction - The direction the corresponding word has been placed in, 0 is horizontal, 1 is vertical
	 */
	updatePlacedChars = ( char, row, col, direction, customHintNumber = this.hintCounter ) => {
		if( this.placedLetters[char] ) {
			this.placedLetters[char] = [ ...this.placedLetters[char], [row, col] ];
		}
		else {
			this.placedLetters[char] = [ [row, col] ];
		}

		if( this.boardHints[row][col] ) {
			this.boardHints[row][col][direction] = customHintNumber;
		}
		else {
			this.boardHints[row][col] = new Array( 2 );
			this.boardHints[row][col][direction] = customHintNumber;
		}
	}

	/**
	 * Updates the hint map to include the hint for the specified word
	 * @param {string} word - The word that the hint will correspond to
	 * @param {number} direction - The direction 'word' was placed in, 0 is horizontal, 1 is vertical
	 */
	updateHintDictionary = ( word, direction ) => {
		if( this.hintDictionary[this.hintCounter] ) {
			this.hintDictionary[this.hintCounter][direction] = this.wordDictionary[word];
		}
		else {
			this.hintDictionary[this.hintCounter] = new Array(2);
			this.hintDictionary[this.hintCounter][direction] = this.wordDictionary[word];
		}
		this.hintCounter ++;
	}

	/**
	 * Generates the initial game board by placing the initial word then attempting to place the remaining words
	 */
	generateBoard = () => {
		let placeHorizontal; // true if placing the initial word horizontally, false if vertical
		let initialWord; // the initial word to be put on the board
		let vertMiddle = Math.floor( this.rows / 2 ); // the vertical middle index of the board
		let horizMiddle = Math.floor( this.cols / 2 ); // the horizontal middle index of the board

		if( this.sortedWordList.length ) {
			initialWord = this.sortedWordList[0];

			if( initialWord.length <= this.cols ) {
				placeHorizontal = true; // Place initial word horizontally
			}
			else if( initialWord.length <= this.rows ) {
				placeHorizontal = false; // Place initial word vertically
			}
			else {
				return; // Word can't fit on board
			}
		}
		else {
			return;
		}

		if( placeHorizontal ) {
			let startIndex = horizMiddle - Math.floor( initialWord.length / 2 );
			
			for( let i = 0; i < initialWord.length; i++ ) {
				this.boardArray[vertMiddle][startIndex + i] = initialWord.charAt( i );
				this.updatePlacedChars( initialWord.charAt( i ), vertMiddle, startIndex + i, 0 );
			}

			this.updateHintDictionary( initialWord, 0 );
		}
		else {
			let startIndex = vertMiddle - Math.floor( initialWord.length / 2 );
			
			for( let i = 0; i < initialWord.length; i++ ) {
				this.boardArray[startIndex + i][horizMiddle] = initialWord.charAt( i );
				this.updatePlacedChars( initialWord.charAt( i ), startIndex + i, horizMiddle, 1 );
			}

			this.updateHintDictionary( initialWord, 1 );
		}

		this.sortedWordList.shift();
		if( this.sortedWordList.length ) {
			this.placeRemainingWords();
		}

		this.retryWordPlacements();

		while( this.unplacedWords.length ) {
			let unplacedWord = this.unplacedWords.shift();

			this.placeUnplacedWord( unplacedWord );
			this.retryWordPlacements();
		}

		console.log( this.boardHints );
		console.log( this.hintDictionary );
	}

	// Attempts to place all the remaining words in sortedWordList
	placeRemainingWords = () => {
		let word = this.sortedWordList.shift();
		this.placingComplete = false;

		for( let i = 0; i < word.length; i++ ) {
			if( this.placedLetters[ word[i] ] && ! this.placingComplete ) {
				let occurrences = this.placedLetters[ word[i] ];
				let firstHalf = word.substring( 0, i );
				let secondHalf = word.substring( i + 1, word.length );

				occurrences.forEach( location => {
					if( ! this.placingComplete ) {
						this.attemptWordPlacement( location, firstHalf, secondHalf, word );
					}
				} );
			}
		}

		if( ! this.placingComplete ) {
			this.unplacedWords.push( word );
		}

		while( this.sortedWordList.length ) {
			this.placeRemainingWords();
		}
	}

	/**
	 * Attempt to place a word on the board at the given location
	 * @param {Array} location - The location of the letter that this word has in common with a word already on the board.
	 * @param {string} firstHalf - The first half of the word seperated by the character at location.
	 * @param {string} secondHalf - The second half of the word seperated by the character at location.
	 */
	attemptWordPlacement = ( location, firstHalf, secondHalf, origWord ) => {
		let row = location[0];
		let col = location[1];
		let boardCopy = [];
		this.boardArray.forEach( row => {
			boardCopy.push( [...row] );
		} );
		let errorFlag = false;
		let toUpdateList = [];

		// Attempt to place the word horizontally
		if( col - firstHalf.length >= 0 && col + secondHalf.length < this.cols
				&& ! boardCopy[row][col - firstHalf.length - 1] && ! boardCopy[row][col + secondHalf.length + 1] ) {
			// Attempt to place first half of the word
			for( let i = 0; i < firstHalf.length; i++ ) {
				if( boardCopy[row][col - firstHalf.length + i] !== firstHalf.charAt( i ) && ( boardCopy[row][col - firstHalf.length + i]
						|| ( boardCopy[row - 1] && boardCopy[row - 1][col - firstHalf.length + i] )
						|| ( boardCopy[row + 1] && boardCopy[row + 1][col - firstHalf.length + i] ) ) ) {
					errorFlag = true;
				}
				else {
					boardCopy[row][col - firstHalf.length + i] = firstHalf.charAt( i );
					toUpdateList.push( [ firstHalf.charAt( i ), row, col - firstHalf.length + i, 0 ] );
				}
			}
			// Attempt to place second half of the word
			for( let i = 0; i < secondHalf.length; i++ ) {
				if( boardCopy[row][col + 1 + i] !== secondHalf.charAt( i ) && ( boardCopy[row][col + 1 + i]
						|| ( boardCopy[row - 1] && boardCopy[row - 1][col + 1 + i] )
						|| ( boardCopy[row + 1] && boardCopy[row + 1][col + 1 + i] ) ) ) {
					errorFlag = true;
				}
				else {
					boardCopy[row][col + 1 + i] = secondHalf.charAt( i );
					toUpdateList.push( [ secondHalf.charAt( i ), row, col + 1 + i, 0 ] );
				}
			}

			if( ! errorFlag ) {
				this.placingComplete = true;
				this.boardArray = boardCopy;

				if( ! firstHalf && this.boardHints[row][col] && ( row - 1 < 0 || ! this.boardHints[row - 1][col] ) ) {
					let existingHint = this.boardHints[row][col][1];
					toUpdateList.forEach( updateParams => {
						this.updatePlacedChars( updateParams[0], updateParams[1], updateParams[2], updateParams[3], existingHint );
					} );
					this.boardHints[row][col][0] = existingHint;
					this.hintDictionary[existingHint][0] = this.wordDictionary[origWord];
				}
				else {
					toUpdateList.forEach( updateParams => {
						this.updatePlacedChars( updateParams[0], updateParams[1], updateParams[2], updateParams[3] );
					} );
					if( ! this.boardHints[row][col] ) this.boardHints[row][col] = new Array( 2 );
					this.boardHints[row][col][0] = this.hintCounter;
					this.updateHintDictionary( origWord, 0 );
				}
				return 1;
			}
		}

		errorFlag = false;
		boardCopy = [];
		toUpdateList = [];
		this.boardArray.forEach( row => {
			boardCopy.push( [...row] );
		} );

		// Attempt to place the word vertically
		if( row - firstHalf.length >= 0 && row + secondHalf.length < this.rows
				&& boardCopy[row - firstHalf.length - 1] && ! boardCopy[row - firstHalf.length - 1][col] 
				&& boardCopy[row + secondHalf.length + 1] && ! boardCopy[row + secondHalf.length + 1][col] ) {
			// Attempt to place first half of the word
			for( let i = 0; i < firstHalf.length; i++ ) {
				if( boardCopy[row - firstHalf.length + i][col] !== firstHalf.charAt(i) && ( boardCopy[row - firstHalf.length + i][col]
						|| boardCopy[row - firstHalf.length + i][col - 1] || boardCopy[row - firstHalf.length + i][col + 1] ) ) {
					errorFlag = true;
				}
				else {
					boardCopy[row - firstHalf.length + i][col] = firstHalf.charAt( i );
					toUpdateList.push( [ firstHalf.charAt( i ), row - firstHalf.length + i, col, 1 ] );
				}
			}
			// Attempt to place second half of the word
			for( let i = 0; i < secondHalf.length; i++ ) {
				if( boardCopy[row + 1 + i][col] !== secondHalf.charAt(i) && ( boardCopy[row + 1 + i][col]
						|| boardCopy[row + 1 + i][col - 1] || boardCopy[row + 1 + i][col + 1] ) ) {
					errorFlag = true;
				}
				else {
					boardCopy[row + 1 + i][col] = secondHalf.charAt( i );
					toUpdateList.push( [ secondHalf.charAt( i ), row + 1 + i, col, 1 ] );
				}
			}

			if( ! errorFlag ) {
				this.placingComplete = true;
				this.boardArray = boardCopy;
				if( ! firstHalf && this.boardHints[row][col] && ( col - 1 < 0 || ! this.boardHints[row][col - 1] ) ) {
					let existingHint = this.boardHints[row][col][0];
					toUpdateList.forEach( updateParams => {
						this.updatePlacedChars( updateParams[0], updateParams[1], updateParams[2], updateParams[3], existingHint );
					} );
					this.boardHints[row][col][1] = existingHint;
					this.hintDictionary[existingHint][1] = this.wordDictionary[origWord];
				}
				else {
					toUpdateList.forEach( updateParams => {
						this.updatePlacedChars( updateParams[0], updateParams[1], updateParams[2], updateParams[3] );
					} );
					if( ! this.boardHints[row][col] ) this.boardHints[row][col] = new Array( 2 );
					this.boardHints[row][col][1] = this.hintCounter;
					this.updateHintDictionary( origWord, 1 );
				}
				return 2;
			}
		}

		return false;
	}

	// Attempt to place the unplace words again until there are no changes to the unplaced word list
	retryWordPlacements = () => {
		let unplacedWordsCopy = [];

		while( this.unplacedWords.length && JSON.stringify( unplacedWordsCopy ) !== JSON.stringify( this.unplacedWords ) ) {
			unplacedWordsCopy = [ ...this.unplacedWords ];
			this.sortedWordList = [ ...this.unplacedWords ];
			this.unplacedWords = [];
			this.placeRemainingWords();
		}
	}

	placeUnplacedWord = ( word ) => {
		if( ! word.length ) { return }

		let emptySpots = [];
		this.boardArray.forEach( ( row, rowIndex ) => {
			row.forEach( ( cell, colIndex ) => {
				if( ! cell && ( ! this.boardArray[rowIndex - 1] || ! this.boardArray[rowIndex - 1][colIndex] )
						&& ( ! this.boardArray[rowIndex + 1] || ! this.boardArray[rowIndex + 1][colIndex] )
						&& ! this.boardArray[rowIndex][colIndex - 1] && ! this.boardArray[rowIndex][colIndex + 1] ) {
					emptySpots.push( [ rowIndex, colIndex ] );
				}
			} );
		} );

		emptySpots.sort( ( a,b ) => 0.5 - Math.random() );

		for( let i = 0; i < emptySpots.length; i++ ) {
			let location = emptySpots[i];
			let firstChar = word.charAt(0);
			
			let placementAttempt = this.attemptWordPlacement( location, '', word.substring(1), word );
			if( placementAttempt ) {
				let row = location[0];
				let col = location[1];
				this.boardArray[row][col] = firstChar;
				this.placedLetters[firstChar] = [ [ row, col ] ];
				// this.boardHints[row][col] = new Array( 2 );
				// this.boardHints[row][col][placementAttempt - 1] = this.hintCounter - 1;
				return;
			}
		}
	}
}

export default CrosswordPuzzle;
