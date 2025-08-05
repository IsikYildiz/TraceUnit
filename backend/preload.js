const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectNodeModulesPath: () => ipcRenderer.invoke('select-node-modules-path'),
  selectPythonRunTimePath: () => ipcRenderer.invoke('select-python-runtime-path'),
  getCodeTests: (code, language, fixCodeMistakes, runtimePath) => ipcRenderer.invoke('get-code-tests', { code, language, fixCodeMistakes, runtimePath}),
});