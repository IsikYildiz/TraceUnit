import { useState } from 'react'
import '../site.css'
import '../general.css'
import QuestionBox from '../images/QuestionBox.png'
import TaceUnitLogo from '../images/TraceUnitLogo.png'

function Header({instructionButton, instruction, changeInstructionVisibilty}){
    function handleInstructionVisibilty() {
        changeInstructionVisibilty();
    }

    return(
        <>
        <button className="appear instructionButton" onClick={handleInstructionVisibilty} style={{display:instructionButton}}>
            <img className="appear instructionImg" src={QuestionBox}></img>
        </button>
        <img className="header appear" src={TaceUnitLogo} style={{width:"12rem", height:"8.5rem", margin:"1.4rem"}}></img>
        <div className="popUpOverlay" style={{display:instruction}}>
            <button className="instructionButton" onClick={handleInstructionVisibilty} style={{display:instructionButton}}>
                <img className="instructionImg" src={QuestionBox}></img>
            </button>
            <p className="instruction appear">
            <strong>Instructions:</strong>&nbsp;Write your code into are given below, choose your programming language and press "Create".
            If you dont want ollama to try and fix mistakes on your code simply uncheck the option (this would also speed up process). 
            İf you select "Other" on programming language, the tests will not run instead ollama itself will try to determine cover rate. 
            This can be wrong, but tests themselves should be same.
            </p>
        </div>
        </>
    )
}

export default Header