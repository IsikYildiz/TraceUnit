import { useState } from 'react'
import './site.css'
import './general.css'
import QuestionBox from './images/QuestionBox.png'
import TaceUnitLogo from './images/TraceUnitLogo.png'
import Settings from './components/Settings'

function App() {
  const [started,setStarted] = useState(0);
  const [instruction, setInstruction] = useState("none");
  const [instructionButton, setInstructionButton] = useState("block");
  const [code, setCode] = useState('');
  const [fixedCode, setFixedCode] = useState('');
  const [tests, setTests] = useState('');
  const [warning, setWarning] = useState("none");
  const [coveredLines, setCoveredLines] = useState([]);
  const [coverRate, setCoverRate] = useState(0);
  const [fixedMessage, setFixedMessage] = useState("(Not Changed)")
  const [selectedLanguage, setSelectedLanguage] = useState("Other");
  const [fixMistakes, setFixMistakes] = useState(true);
  const [exception, setException] = useState(false);

  async function writeTests(){
    setInstruction("none");
    let runtimePath = '';
    if (selectedLanguage === "Javascript" || selectedLanguage === "Typescript"){
      const result = await window.electronAPI.selectNodeModulesPath();
      if (result === null){
        return;
      }
      runtimePath = result;
    }
    else if(selectedLanguage === "Python"){
      const result = await window.electronAPI.selectPythonRunTimePath();
      if (result === null){
        return;
      }
      runtimePath = result;
    }

    const response = await window.electronAPI.getCodeTests(code, selectedLanguage, fixMistakes, runtimePath);
    if (response === "Couldn't understand code"){
      setWarning("block");
      return;
    }
    if (response.codeChanged){
      setFixedMessage("(Fixed Mistakes)");
    }
    console.log('response.exception:', response.exception, typeof response.exception);
    if (response.exception){
      setException(true);
      setFixedCode(response.code);
      setTests(response.tests);
      setInstructionButton("none");
      setWarning("none");
      setStarted(1);
      return;
    }
    setInstructionButton("none");
    setWarning("none");
    setFixedCode(response.code);
    setTests(response.tests);
    setCoveredLines(response.coveredLines);
    setCoverRate(response.coverRate);
    setStarted(1);
  }

  function changeInstructionVisibilty(){
    if(instruction === "none"){
      setInstruction("flex");
    }
    else{
      setInstruction("none");
    }
  }

  function goBack() {
    setStarted(0);
    setInstructionButton("block");
    setWarning("none");
    setException(false);
  }

  let codeSpace;
  if(started === 0){
    codeSpace = 
    <>
      <div className="column">
        <div className="row" style={{width:"100%"}}>
          <textarea style={{marginRight:"3.1rem", marginLeft:"28rem"}} className="codebox appear" placeholder="Write code here" name="codeArea" value={code} onChange={e => setCode(e.target.value)}></textarea>
          <Settings onLanguageChange={setSelectedLanguage} onFixChange={setFixMistakes} className="center"></Settings>
        </div>
        <button className="button appear" onClick={writeTests}>Create</button>
      </div>
    </>
  }
  else{
    codeSpace = 
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
              <div style={{ color: 'red', padding: '0.5rem' }}>
                Test execution failed. Coverage data unavailable.
                </div>
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
        <button className="button appear" onClick={goBack}>Return</button>
      </div>
    </>
  }

  return (
    <>
    <div className="column">
      <div className="column">
        <button className="appear instructionButton" onClick={changeInstructionVisibilty} style={{display:instructionButton}}>
          <img className="appear instructionImg" src={QuestionBox}></img>
        </button>
        <img className="header appear" src={TaceUnitLogo} style={{width:"12rem", height:"8.5rem", margin:"1.4rem"}}></img>
        <div className="popUpOverlay" style={{display:instruction}}>
          <button className="instructionButton" onClick={changeInstructionVisibilty} style={{display:instructionButton}}>
            <img className="instructionImg" src={QuestionBox}></img>
          </button>
          <p className="instruction appear">
          <strong>Instructions:</strong>&nbsp;Write your code into are given below, choose your programming language and press "Create".
          If you dont want ollama to try and fix mistakes on your code simply uncheck the option (this would also speed up process). 
          İf you select "Other" on programming language, the tests will not run instead ollama itself will try to determine cover rate. 
          This can be wrong, but tests themselves should be same.
          </p>
        </div>
        <p className="instruction appear" style={{display:warning}}>
          Ollama couldn't understand the code. Please try again.
        </p>
      </div>
      {codeSpace}
    </div>
    </>
  )
}

export default App
