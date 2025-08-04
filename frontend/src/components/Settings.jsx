import { useState } from 'react'
import '../site.css'
import '../general.css'

function Settings({ onLanguageChange, onFixChange }){
    function handleLanguageChange(e) {
        onLanguageChange(e.target.value);
    }
    
    function handleFixChange(e) {
        onFixChange(e.target.checked);
    }

    return(
        <>
        <div className="column appear settingsBox">
            <label className="label appear" style={{marginBottom:"1.875rem", marginTop:"0.625rem"}}>Settings</label>
            <div className="column appear choiceBox" style={{marginBottom:"1.875rem"}}>
                <label className="label appear" style={{marginBottom:"0.625rem", marginTop:"0.625rem", fontSize:"1.375rem"}}>Choose Programming Language</label>
                <div className="row appear">
                    <label className="choice appear" style={{height:"auto"}}>Javascript<input type="radio" name="language" value="Javascript" onChange={handleLanguageChange}></input></label>
                    <label className="choice appear" style={{height:"auto"}}>Typescript<input type="radio" name="language" value="Typescript" onChange={handleLanguageChange}></input></label>
                </div>
                <div className="row appear">
                    <label className="choice appear" style={{height:"auto"}}>Python<input type="radio" name="language" value="Python" onChange={handleLanguageChange}></input></label>
                    <label className="choice appear" style={{height:"auto"}}>Other<input type="radio" name="language" value="Other" onChange={handleLanguageChange} defaultChecked={true}></input></label>
                </div>
            </div>
            <label className="choice appear" style={{width:"18.75rem", height:"auto"}}>Try to fix code mistakes<input type="checkbox" defaultChecked={true} name="mistake" value="fix" onChange={handleFixChange}></input></label>
        </div>
        </>
    )
}

export default Settings