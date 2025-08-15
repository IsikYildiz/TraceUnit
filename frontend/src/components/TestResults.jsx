import { useState } from 'react'
import '../site.css'
import '../general.css'

function TestResults({tests, fixedCode, fixedMessage, coverRate, exception, goBack, coveredLines}){
    function firstPage() {
        goBack();
    }

    return(
        <>
        <div className="column">
            <div className="row" style={{width:"81.3rem"}}>
                <div className="row" style={{width:"40.6rem", justifyContent:"right"}}>
                    <div style={{width:"40.6rem", display:"flex", justifyContent:"center", alignItems:"center", position:"absolute"}}>
                        <p className="instruction appear" style={{width:"fit-content", height:"auto"}}>Code {fixedMessage}</p>
                    </div>
                    <p className="instruction appear" style={{width:"auto", height:"auto", zIndex:"2"}}>Cover Rate:{coverRate}%</p>
                </div>
            <div className="center" style={{width:"40.6rem"}}>
                <p className="instruction appear" style={{width:"auto", height:"auto"}}>Tests</p>
            </div>
        </div>
        <div className="row">
          <div className="codebox appear" style={{width: "37.5rem", height: "31.25rem", marginRight: "1.25rem"}}>
            {exception && (
                <div style={{ color: 'red', padding: '0.5rem' }}>Test execution failed. Coverage data unavailable.</div>
            )}
            {fixedCode.split('\n').map((line, i) => {
              const lineNumber = i + 1;
              const isCovered = coveredLines.includes(lineNumber);
              
              const backgroundColor = exception
              ? 'transparent'
              : isCovered
                ? '#329937ff'
                : '#d02424ff';
                
              return (
              <div key={i} style={{backgroundColor, width: 'max-content', minWidth: '100%', padding: '0 0.5rem', whiteSpace: 'pre',marginBottom: '0.2rem',}}>
                <span style={{ color: 'white', marginRight: '0.5rem' }}>
                  {lineNumber.toString().padStart(2, '0')}
                </span>
                <span>{line}</span>
                </div>
              );
            })}
          </div>
          <pre  className="codebox appear" style={{width:"37.5rem", height:"31.25rem", whiteSpace: "pre", marginLeft:"1.25rem"}}>
            <code>{tests}</code>
          </pre >
        </div>
        <button className="button appear" onClick={firstPage}>Return</button>
        </div>
    </>
    )
}

export default TestResults