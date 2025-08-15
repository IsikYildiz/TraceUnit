import { useState, useEffect } from 'react'
import './site.css'
import './general.css'
import Settings from './components/Settings'
import TestResults from './components/TestResults'
import Header from './components/Header'

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
  const [ollamaModel, setOllamaModel] = useState("");

  // Sayfa ilk yüklendiğinde ayarlar alınır
  useEffect(() => {
    async function getOllamaModel() {
      const settings = await window.electronAPI.getSettings();
      // Ollama modeli değiştirilebilsin, diğerleri backend de otomatik değiştirilecek
      setOllamaModel(settings.ollamaModel);
    }
    getOllamaModel();
  }, []);

  // Testlerin oluşturulup çalıştırılması ve sonuçlarının gösterilmesi
  async function writeTests(){
    setInstruction("none");
    // İlk olarak ollama modeli güncellenir
    await window.electronAPI.updateSettings("ollamaModel", ollamaModel);
    let runtimePath = '';
    if (selectedLanguage === "Javascript" || selectedLanguage === "Typescript"){
      const result = await window.electronAPI.selectNodeModulesPath(); // Javascript/Typescript seçildiğinde node modules klasörünün yerini sor
      if (result === null){
        return;
      }
      runtimePath = result;
    }
    else if(selectedLanguage === "Python"){
      const result = await window.electronAPI.selectPythonRunTimePath(); // Python seçildiğinde python yolunu sor
      if (result === null){
        return;
      }
      runtimePath = result;
    }

    // Testler çalıştırılır
    const response = await window.electronAPI.getCodeTests(code, selectedLanguage, fixMistakes, runtimePath);
    if (response === "Couldn't understand code"){ // Kod anlaşılamazsa warning logonun hemen altında kırmızı gösterilir
      setWarning("block"); 
      return;
    }
    if (response.codeChanged){ // Eğer kod hataları düzeltilmişse bunu belirt
      setFixedMessage("(Fixed Mistakes)");
    }
    if (response.exception){ // EĞer testler çalıştırılırken hata olursa, yinede testleri göster
      setException(true);
      setFixedCode(response.code);
      setTests(response.tests);
      setInstructionButton("none");
      setWarning("none");
      setStarted(1);
      return;
    }
    // Hata olmassa testleri, çalıştırılmış satırları ve cover rate i göster
    setInstructionButton("none");
    setWarning("none");
    setFixedCode(response.code);
    setTests(response.tests);
    setCoveredLines(response.coveredLines);
    setCoverRate(response.coverRate);
    setStarted(1);
  }

  // Kullanma yazısı gösteriliyorsa kapatır, yoksa gösterir
  function changeInstructionVisibilty(){
    if(instruction === "none"){
      setInstruction("flex");
    }
    else{
      setInstruction("none");
    }
  }

  // İlk sayfaya dönülür, daha önce yazılmış kod aynı kalır
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
          <Settings onLanguageChange={setSelectedLanguage} onFixChange={setFixMistakes} onModelChange={setOllamaModel} ollamaModel={ollamaModel} className="center"></Settings>
        </div>
        <button className="button appear" onClick={writeTests}>Create</button>
      </div>
    </>
  }
  else{
    codeSpace = 
    <>
      <TestResults tests={tests} fixedCode={fixedCode} fixedMessage={fixedMessage} coverRate={coverRate} exception={exception} goBack={goBack} coveredLines={coveredLines}></TestResults>
    </>
  }

  return (
    <>
    <div className="column">
      <div className="column">
        <Header instruction={instruction} instructionButton={instructionButton} changeInstructionVisibilty={changeInstructionVisibilty}></Header>
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
