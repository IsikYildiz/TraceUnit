//Electron uygulamasını başlatan ve frontend ile iletişim kuran ana kısım

const { app, BrowserWindow, ipcMain, screen, dialog} = require('electron');
const path = require('path');
const fs = require('fs');
const ollama = require('./ollama');
const jsTestRunner = require('./languages/javascript/testRunner');
const jsCoverageParser = require('./languages/javascript/coverageParser');
const pythonTestRunner = require('./languages/python/pythonTestRunner');
const jsonOperations = require('./jsonOperations')

// Electron uygulamasını başlatır
function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const size = primaryDisplay.size;
  // Fullscreen başlatılırsa çıkış yapmak imkansızmış, ondan windowed başlatılıyor
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

  //Settings dosyası yoksa oluşturulur
  jsonOperations.createSettingsJson();
}

// Seçime göre ayar değiştirilir
ipcMain.handle('update-settings', async (event, {choice, value}) =>{
  const message = jsonOperations.setSettings(choice, value);
  return message;
});

// Tüm ayar bilgileri döndürülür
ipcMain.handle('get-settings', async () => {
  const nodeModulesPath = jsonOperations.getSettings("nodeModulesPath");
  const pythonPath = jsonOperations.getSettings("pythonPath");
  const ollamaModel = jsonOperations.getSettings("ollamaModel");

  return {
    nodeModulesPath,
    pythonPath,
    ollamaModel
  }
})

// Node modules klasörü için seçim pop-up, default olarak ayarlardaki değer verilir
// Seçim yapıldıktan sonra ayarın değeri değiştirilir
ipcMain.handle('select-node-modules-path', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
    defaultPath: jsonOperations.getSettings("nodeModulesPath") || undefined
  });
  jsonOperations.setSettings("nodeModulesPath",result.filePaths[0]);
  return result.canceled ? null : result.filePaths[0];
});

// Python yolu için seçim pop-up, default olarak ayarlardaki değer verilir
// Seçim yapıldıktan sonra ayarın değeri değiştirilir
ipcMain.handle('select-python-runtime-path', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Executable', extensions: ['exe', 'bin', 'py'] }],
    defaultPath: jsonOperations.getSettings("pythonPath") || undefined
  });
  jsonOperations.setSettings("pythonPath",result.filePaths[0]);
  return result.canceled ? null : result.filePaths[0];
});

// Temp dosyasını silen fonksiyon
function deleteTemp(){
  const tempPath = path.join(__dirname, 'temp');
  if(fs.existsSync(tempPath)){
    fs.rmSync(tempPath, { recursive: true, force: true });
  }
}

// Verilen kod için testler oluşturulur, coverage bilgileri hesaplanır ve döndürülür
ipcMain.handle('get-code-tests', async (event, {code, language, fixCodeMistakes, runtimePath}) => {
  let codeChanged = false; //Kodun değişip değiştirilmediğinin kontrolü
  let exception = false; // Testlerde hata olursa kullanıcıya bildirmek için 

  // Eğer kullanıcı kodda hataların aranmasını istiyorsa 
  if (fixCodeMistakes){
    const fixedCode = await ollama.fixCodeMistakes(code);
    if (fixedCode === "unknown" || !fixedCode ){
      return "Couldn't understand code"; // Ollama kodu anlayamazsa 
    }
    else if(fixedCode !== "same"){
      code = fixedCode;
      codeChanged = true;
    }
  }
  
  if (language === "Javascript" || language === "Typescript"){
    const tests  = await ollama.writeTests(code, language); //Testler ollama ile oluşturulur
    if (tests === "unknown"){
      return "Couldn't understand code"; // Hata düzeltme kapalı ve ollama kodu anlayamassa 
    }
    try{
      deleteTemp();
      const testResultsPath = jsTestRunner.runTests(language, code, tests, runtimePath); // Testler çalıştırılır
      const testResults = jsCoverageParser.parseLcov(testResultsPath); //Coverage alınır
      const coverRate = testResults.rate
      const coveredLines = testResults.coverage.map((element, index) => element === 1 ? index : -1).filter(element => element !== -1);
      // Bilgiler geri döndürülür
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
      // Hata durumunda sadece kod ve testler döndürülür
      exception = true;
      return{
        code,
        tests,
        exception
      };
    }
  }
  else if (language === "Python") {
    let tests = await ollama.writeTests(code, language); // Testler oluşturulur
    if (tests === "unknown"){
      return "Couldn't understand code"; // Hata düzeltme kapalı ve ollama kodu anlayamassa 
    }

    // Testlerin çalışması için tüm fonksiyonları import eden line manuel ekleniyor
    // Öbür türlü ollama %90 başaramıyor
    const importLine = "from user_code import * \n"; 
    tests = importLine + tests;

    deleteTemp();
    const tempDir = path.join(__dirname, 'temp');
    fs.mkdirSync(tempDir, { recursive: true });

    try {
      // Testler çalıştırılır ve coverage bilgileri alınır
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
      // Hata durumunda
      console.error("Python test çalıştırma hatası:", e);
      return { code, tests, exception: true };
    }
  }
  else{
    // Eğer javascript/typescript veya python seçili değilse, ollama testleri kendi "çalıştırmaya" çalışır
    language  = await ollama.detectProgrammingLanguage(code); // Programlama dilini tespit eder
    const tests  = await ollama.writeTests(code, language); // Testler oluşturulur
    if (tests === "unknown"){
      return "Couldn't understand code" // Kod anlaşılamazsa
    }

    try{
      const lineCount = code.trim().split('\n').length;
      let coveredLines = await ollama.findCoverRate(code, tests); // Ollama hangi kod satırlarının çalıştığını kendisi tespit etmeye çalışır
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
      // Hata durumunda
      return{
        code,
        tests,
        exception
      }
    }
  }
});

// Uygulama başlatılır
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Pencere kapatılırsa uygulama da kapanır
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
