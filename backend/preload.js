const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectRunTimePath: () => ipcRenderer.invoke('select-runtime-path'),
  getCodeTests: (code, language, fixCodeMistakes, runtimePath) => ipcRenderer.invoke('get-code-tests', { code, language, fixCodeMistakes, runtimePath}),
});