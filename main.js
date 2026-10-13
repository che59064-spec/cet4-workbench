// CET-4 备考工作台 - Electron 主进程
const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');

function createWindow(){
  const win = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 980,
    minHeight: 660,
    frame: false,                 // 无系统标题栏：顶部融入应用内
    transparent: true,            // 窗口透明：让页面自绘圆角边框
    hasShadow: true,
    autoHideMenuBar: true,
    backgroundColor: '#00000000',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      // 允许 file:// 页面 fetch https 题库源（如 GitHub raw，本身带 CORS 头）
      webSecurity: false,
      spellcheck: false
    }
  });
  win.loadFile('index.html');
  win.once('ready-to-show', () => win.show());
  // 最大化状态同步给渲染层（最大化时取消圆角）
  const pushMaxState = () => { try{ win.webContents.send('win-max-state', win.isMaximized()); }catch(e){} };
  win.on('maximize', pushMaxState);
  win.on('unmaximize', pushMaxState);
  win.webContents.on('did-finish-load', pushMaxState);
  // 所有 target=_blank 或 window.open 一律交给系统浏览器
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  return win;
}

ipcMain.on('win-min', e => { BrowserWindow.fromWebContents(e.sender)?.minimize(); });
ipcMain.on('win-max', e => {
  const w = BrowserWindow.fromWebContents(e.sender);
  if(!w) return;
  if(w.isMaximized()) w.unmaximize(); else w.maximize();
});
ipcMain.on('win-close', e => { BrowserWindow.fromWebContents(e.sender)?.close(); });

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
