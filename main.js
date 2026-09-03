// CET-4 备考工作台 - Electron 主进程
const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

function createWindow(){
  const win = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 980,
    minHeight: 660,
    autoHideMenuBar: true,
    backgroundColor: '#f4f6fb',
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      // 允许 file:// 页面 fetch https 题库源（如 GitHub raw，本身带 CORS 头）
      webSecurity: false,
      spellcheck: false
    }
  });
  win.loadFile('index.html');
  win.once('ready-to-show', () => win.show());
  // 所有 target=_blank 或 window.open 一律交给系统浏览器
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
