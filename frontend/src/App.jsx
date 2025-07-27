import { useState } from 'react'
import './site.css'
import './general.css'
import QuestionBox from './images/question_box.png'

function App() {
  const [started,setStarted] = useState(0);
  const [instruction, setInstruction] = useState("none");
  const [instructionButton, setInstructionButton] = useState("block");
  const [code, setCode] = useState('');
  const [fixedCode, setFixedCode] = useState('');
  const [tests, setTests] = useState('');
  const [warning, setWarning] = useState("none");

  async function writeTests(){
    setInstructionButton("none");
    setInstruction("none");
    setWarning("none");
    const response = await window.electronAPI.getCodeTests({code});
    if (response === "Couldn't understand code"){
      setWarning("block");
      return 1;
    }
    setFixedCode(response.fixedCode);
    setTests(response.tests);
    setStarted(1);
  }

  function changeInstructionVisibilty(){
    if(instruction === "none"){
      setInstruction("block");
    }
    else{
      setInstruction("none");
    }
  }

  function goBack() {
    setStarted(0);
  }

  let codeSpace;
  if(started === 0){
    codeSpace = 
    <>
      <div className="column">
        <textarea className="codebox appear" placeholder="Write code here" name="codeArea" value={code} onChange={e => setCode(e.target.value)}></textarea>
        <button className="button appear" onClick={writeTests}>Create</button>
      </div>
    </>
  }
  else{
    codeSpace = 
    <>
      <div className="column">
        <div className="row">
          <div className="center">
            <p className="instruction appear" style={{width:"auto", height:"auto",}}>Code</p>
          </div>
          <div className="center">
            <p className="instruction appear" style={{width:"auto", height:"auto"}}>Tests</p>
          </div>
        </div>
        <div className="row">
          <pre  className="codebox appear" style={{width:"600px", height:"500px", marginRight:"20px"}}>
            <code>{fixedCode}</code>
          </pre >
          <pre  className="codebox appear" style={{width:"600px", height:"500px", marginLeft:"20px"}}>
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
        <h1 className="header appear">TraceUnit</h1>
        <p className="instruction appear" style={{display:instruction}}>
          <strong>Instructions:</strong>&nbsp;Just write the code into area, and click "Create" simple as that.
        </p>
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
