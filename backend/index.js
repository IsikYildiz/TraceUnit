const { app, BrowserWindow,ipcMain } = require('electron');
const path = require('path');
const ollama = require('./ollama')
const fs = require('fs');

// Electron uygulamasını başlatır
function createWindow() {
  const win = new BrowserWindow({
    maximized: true,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'), 
    }
  });
  win.webContents.openDevTools();
  win.setMenuBarVisibility(false);
  win.loadFile(path.join(__dirname, '../frontendBuild/index.html'));
}

ipcMain.handle('get-code-tests', async (event, {code}) => {
  let fixedCode = await ollama.fixCodeMistakes(code);
  console.log(fixedCode);
  if (fixedCode === "unknown" || !fixedCode ){
    return "Couldn't understand code";
  }
  else if(fixedCode === "same") {
    fixedCode=code;
  }
  const language  = await ollama.detectProgrammingLanguage(fixedCode);
  const tests  = await ollama.writeTests(fixedCode,language);
  const coveredLines = await ollama.findCoverRate(fixedCode,tests);

  console.log(fixedCode)
  
  return {
      fixedCode,
      tests,
      coveredLines
  };
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
