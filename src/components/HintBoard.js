import React, { useState, useEffect } from 'react';

const HintBoard = ( props ) => {
    const [horizontalHints, setHorizontalHints] = useState([]);
    const [verticalHints, setVerticalHints] = useState([]);

    useEffect( () => {
        let hintKeys = Object.keys( props.hintDictionary );
        let horizHints = [];
        let vertHints = [];

        hintKeys.forEach( hintKey => {
            let horizontalHint = props.hintDictionary[hintKey][0];
            let verticalHint = props.hintDictionary[hintKey][1];

            if( horizontalHint ) horizHints.push( [ hintKey, horizontalHint ] );
            if( verticalHint ) vertHints.push( [ hintKey, verticalHint ] );

            setHorizontalHints( horizHints );
            setVerticalHints( vertHints );
        } );
    }, [props.hintDictionary] );

    return (
        <div className="hint-container">
            <div className="horizontal-hints">
                <h3>Across</h3>
                { horizontalHints.map( ( hint, index ) => (
                    <p key={ index } className={ props.currentCell && props.currentCell[0] === +hint[0] ? 'highlight' : '' }>
                        { hint[0] + '. ' + hint[1] }
                    </p>
                ) ) }
            </div>
            <div className="vertical-hints">
                <h3>Down</h3>
                { verticalHints.map( ( hint, index ) => (
                    <p key={ index } className={ props.currentCell && props.currentCell[1] === +hint[0] ? 'highlight' : '' }>
                        { hint[0] + '. ' + hint[1] }
                    </p>
                ) ) }
            </div>
        </div>
    )
}

export default HintBoard;
