import React, { useState, useEffect, useRef } from 'react'
import { useSpring, animated } from 'react-spring';
import CrosswordPuzzle from '../includes/CrosswordPuzzle';
import HintBoard from '../components/HintBoard';

const Crossword = () => {
    const [ gameBoard, setGameBoard ] = useState( null );
    const [ hintBoard, setHintBoard ] = useState( null );
    const [ hintDictionary, setHintDictionary ] = useState( null );
    const [ currentCell, setCurrentCell ] = useState( null );
    const [ notice, setNotice ] = useState( 'Try to fill in all the squares with the correct letters.' );
    let gridCells = useRef();
    let previousDirection = useRef();

    const fadeIn = useSpring( {
        delay: 500,
        from: { opacity: 0, backgroundColor: '#000' },
        to: { opacity: 1, backgroundColor: '#FFF' },
    } );

    const highlightHint = ( cell ) => {
        let parentNode = cell.currentTarget.parentNode;
        let rowIndex = parentNode.parentNode.attributes.rowkey.value;
        let colIndex = parentNode.attributes.colkey.value;

        setCurrentCell( hintBoard[rowIndex][colIndex] );
        cell.currentTarget.select();
    }

    const onType = ( cell ) => {
        let inputBox = cell.currentTarget;

        if( ! gridCells.current ) {
            gridCells.current = document.querySelectorAll( 'td' );
        }

        let parentNode = inputBox.parentNode;
        let rowIndex = parentNode.parentNode.attributes.rowkey.value;
        let colIndex = parentNode.attributes.colkey.value;
        let rightGridCell;
        let downGridCell;

        if( colIndex < gameBoard[0].length - 1 ) {
            rightGridCell = gridCells.current[ parseInt( gameBoard[0].length ) * rowIndex + parseInt( colIndex ) + 1 ];
            rightGridCell = rightGridCell.querySelector( 'input' );
        }
        if( rowIndex < gameBoard.length - 1 ) {
            downGridCell = gridCells.current[ parseInt( gameBoard[0].length ) * ( parseInt( rowIndex ) + 1 ) + parseInt( colIndex ) ];
            downGridCell = downGridCell.querySelector( 'input' );
        }

        if( ! previousDirection.current || previousDirection.current === 'right' ) {
            if( rightGridCell && ! rightGridCell.disabled && ! rightGridCell.value ) {
                rightGridCell.focus();
                previousDirection.current = 'right';    
            }
            else if( downGridCell && ! downGridCell.disabled && ! downGridCell.value ) {
                downGridCell.focus();
                previousDirection.current = 'down';       
            }
            else if( rightGridCell && ! rightGridCell.disabled ) {
                rightGridCell.focus();
                previousDirection.current = 'right';   
            }
            else if( downGridCell && ! downGridCell.disabled ) {
                downGridCell.focus();
                previousDirection.current = 'down';   
            }
        }
        else {
            if( downGridCell && ! downGridCell.disabled && ! downGridCell.value ) {
                downGridCell.focus();
                previousDirection.current = 'down';   
            }
            else if( rightGridCell && ! rightGridCell.disabled && ! rightGridCell.value ) {
                rightGridCell.focus();
                previousDirection.current = 'right';         
            }
            else if( downGridCell && ! downGridCell.disabled ) {
                downGridCell.focus();
                previousDirection.current = 'down';   
            }
            else if( rightGridCell && ! rightGridCell.disabled ) {
                rightGridCell.focus();
                previousDirection.current = 'right';   
            }
        }
    }

    const checkSolution = () => {
        let inputBoxes = document.querySelectorAll( 'input' );
        let correctFlag = true;
        
        boardLoop: for( let i = 0; i < gameBoard.length; i++ ) {
            for( let j = 0; j < gameBoard[i].length; j++ ) {
                let inputBox = inputBoxes[ gameBoard[i].length * i + j ]; 
                
                if( ! inputBox.disabled && inputBox.value.toUpperCase() !== gameBoard[i][j] ) {
                    correctFlag = false;
                    break boardLoop;
                }
            }
        }

        if( ! correctFlag ) {
            setNotice( 'One or more of the available spots are incorrect or unfilled.' );
        }
        else {
            setNotice( 'Congratulations You Win' );
            inputBoxes.forEach( box => {
                box.disabled = true;
            } );
        }
    }

    useEffect( () => {
        let wordList = {
            'dream' : 'something you do while sleeping',
            'anemone' : 'a plant that lives in sea and on land',
            'onomatopoeia' : 'sound in word form',
            'good' : 'a positive adjective',
            'orange' : 'a fruit and a colour',
            'team' : 'people who work together',
            'kick' : 'what you do to a soccer ball',
            'troubleshooting' : 'what you do when your code doesn\'t work',
            'puddle' : 'a small body of water',
            'paper' : 'something you write on',
            'tree' : 'what paper is made of',
            'horse' : 'knights ride on these',
            'greentea' : 'made from camellia sinensis leaves (2 words)',
            'seem' : 'to appear',
            'speed' : 'determines the winner of a race',
            'inspect' : 'to examine',
            'zebra' : 'striped equid',
            'krill' : 'small crustaceans',
            'low' : 'less than average',
            'whale' : 'largest mammal',
        };
    
        let crosswordPuzzle = new CrosswordPuzzle( wordList, 15, 20 );
    
        crosswordPuzzle.generateBoard();
        setGameBoard( crosswordPuzzle.getGameBoard() );
        setHintBoard( crosswordPuzzle.getBoardHints() );
        setHintDictionary( crosswordPuzzle.getHintDictionary() );
    }, [] );

    if( gameBoard && hintBoard && hintDictionary ) {
        return (
            <section className="crossword-game">
                <div className="page-wrapper">
                    <h1>Crossword Puzzle</h1>
                    <div className="game-panel">
                        <button className="check-button" onClick={ checkSolution }>Check Solution</button>
                        <p className="notice">{ notice }</p>
                    </div>
                    <table>
                        <tbody>
                            { gameBoard.map( ( row, rowIndex ) => (
                                <tr key={rowIndex} rowkey={rowIndex}>
                                    { row.map( ( cell, colIndex ) => (
                                        <animated.td key={colIndex} colkey={colIndex} className={ cell ? '' : 'empty' } style={ cell ? fadeIn : null }>
                                            {
                                                ( ( ! hintBoard[rowIndex - 1] || ! hintBoard[rowIndex - 1][colIndex] )
                                                    && hintBoard[rowIndex + 1] && hintBoard[rowIndex + 1][colIndex] ) &&
                                                <span className="hint-number vertical-hint">{ hintBoard[rowIndex][colIndex][1] }</span>
                                            }
                                            {
                                                ( ! hintBoard[rowIndex][colIndex - 1] && hintBoard[rowIndex][colIndex + 1] ) &&
                                                <span className="hint-number horizontal-hint">{ hintBoard[rowIndex][colIndex][0] }</span>
                                            }
                                            <input 
                                                type="text"
                                                maxLength="1"
                                                size="1"
                                                className={ cell ? '' : 'empty' }
                                                disabled={ cell ? '' : 'disabled' }
                                                onFocus={ highlightHint }
                                                onKeyPress={ onType } />
                                        </animated.td>
                                    ) ) }
                                </tr>
                            ) ) }
                        </tbody>
                    </table>
                    <HintBoard hintDictionary={ hintDictionary } currentCell={ currentCell } />
                </div>
            </section>
        )
    }

    return (
        <>
            <h1>My xWord Puzzle</h1>
            <h2>Loading...</h2>
        </>
    )
}

export default Crossword;
