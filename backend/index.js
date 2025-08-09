const { app, BrowserWindow, ipcMain, screen, dialog} = require('electron');
const path = require('path');
const fs = require('fs');
const ollama = require('./ollama');
const jsTestRunner = require('./languages/javascript/testRunner');
const jsCoverageParser = require('./languages/javascript/coverageParser');
const pythonTestRunner = require('./languages/python/pythonTestRunner');

// Electron uygulamasını başlatır
function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const size = primaryDisplay.size;
  const win = new BrowserWindow({
    width: size.width,
    height: size.height,
    maximized: true,
    webPreferences: { 
      contextIsolation: true,
      devTools: true,
      preload: path.join(__dirname, 'preload.js'), 
    }
  });
  win.setMenuBarVisibility(false);
  win.loadFile(path.join(__dirname, '../frontendBuild/index.html'));
  win.webContents.on('did-finish-load', () => {
    win.webContents.setZoomFactor(0.85);
  });
}

ipcMain.handle('select-node-modules-path', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('select-python-runtime-path', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Executable', extensions: ['exe', 'bin', 'py'] }],
  });
  return result.canceled ? null : result.filePaths[0];
});

function deleteTemp(){
  const tempPath = path.join(__dirname, 'temp');
  if(fs.existsSync(tempPath)){
    fs.rmSync(tempPath, { recursive: true, force: true });
  }
}

ipcMain.handle('get-code-tests', async (event, {code, language, fixCodeMistakes, runtimePath}) => {
  let codeChanged = false;
  let exception = false;
  if (fixCodeMistakes){
    const fixedCode = await ollama.fixCodeMistakes(code);
    if (fixedCode === "unknown" || !fixedCode ){
      return "Couldn't understand code";
    }
    else {
      code = fixedCode;
      codeChanged = true;
    }
  }
  
  if (language === "Javascript" || language === "Typescript"){
    const tests  = await ollama.writeTests(code, language);
    try{
      deleteTemp();
      const testResultsPath = jsTestRunner.runTests(language, code, tests, runtimePath);
      const testResults = jsCoverageParser.parseLcov(testResultsPath);
      const coverRate = testResults.rate
      const coveredLines = testResults.coverage.map((element, index) => element === 1 ? index : -1).filter(element => element !== -1);
      return {
        code,
        tests,
        coveredLines,
        coverRate,
        codeChanged,
        exception
      }
    }
    catch{
      exception = true;
      return{
        code,
        tests,
        exception
      };
    }
  }
  else if (language === "Python") {
    let tests = await ollama.writeTests(code, language);
    if (tests === "unknown"){
      return "Couldn't understand code";
    }
    const importLine = "from user_code import * \n";
    tests = importLine + tests;

    deleteTemp();
    const tempDir = path.join(__dirname, 'temp');
    fs.mkdirSync(tempDir, { recursive: true });

    try {
      const coverageData = pythonTestRunner.runPythonTests(runtimePath, code, tests, tempDir);
      if (!coverageData){
        throw new Error();
      } 

      const coveredLines = coverageData.files['user_code.py'].executed_lines;
      const coverRate = coverageData.totals.percent_covered;   

      return {
        code,
        tests,
        coveredLines,
        coverRate,
        codeChanged,
        exception
      };
    } catch (e) {
      console.error("Python test çalıştırma hatası:", e);
      return { code, tests, exception: true };
    }
  }
  else{
    language  = await ollama.detectProgrammingLanguage(code);
    const tests  = await ollama.writeTests(code, language);
    if (tests === "unknown"){
      return "Couldn't understand code"
    }

    try{
      const lineCount = code.trim().split('\n').length;
      let coveredLines = await ollama.findCoverRate(code, tests);
      coveredLines = coveredLines.filter(element => element < lineCount); // Ollama hata yapabiliyor
      const coverRate = coveredLines.length / lineCount * 100;

      return {
        code,
        tests,
        coveredLines,
        coverRate,
        codeChanged,
        exception
      };
    }
    catch{
      return{
        code,
        tests,
        exception
      }
    }
  }
});

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
