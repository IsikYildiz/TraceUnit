const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getCodeTests: (code) => ipcRenderer.invoke('get-code-tests', code),
});