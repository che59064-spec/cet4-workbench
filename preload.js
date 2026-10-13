// 渲染进程 ↔ 主进程桥：窗口控制（最小化 / 最大化 / 关闭）
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('wbWin', {
  min: () => ipcRenderer.send('win-min'),
  max: () => ipcRenderer.send('win-max'),
  close: () => ipcRenderer.send('win-close'),
  onMaxState: cb => ipcRenderer.on('win-max-state', (e, v) => cb(!!v)),
  isElectron: true
});
