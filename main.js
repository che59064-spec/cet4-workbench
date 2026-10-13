// CET-4 备考工作台 - Electron 主进程
const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');

// ===== 窗口圆角：原生形状裁剪（不依赖透明合成，强制生效） =====
function roundRectRects(w, h, r) {
  // 逐行 1px 生成圆角矩形近似（Windows setShape 区域裁剪）
  r = Math.max(0, Math.min(r, Math.floor(Math.min(w, h) / 2)));
  const rects = [];
  for (let y = 0; y < h; y++) {
    const cy = y + 0.5;
    let inset = 0;
    if (cy < r) { const d = r - cy; inset = r - Math.sqrt(Math.max(0, r * r - d * d)); }
    else if (cy > h - r) { const d = cy - (h - r); inset = r - Math.sqrt(Math.max(0, r * r - d * d)); }
    const x = Math.floor(inset);
    rects.push({ x, y, width: Math.max(1, w - x * 2), height: 1 });
  }
  return rects;
}

function createWindow(){
  const win = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 980,
    minHeight: 660,
    center: true,                 // 启动时屏幕居中
    frame: false,                 // 无系统标题栏：顶部融入应用内
    transparent: true,            // 窗口透明：让页面自绘圆角边框
    roundedCorners: false,        // 关闭系统圆角，避免与自绘 32px 圆角冲突
    hasShadow: false,             // 关闭系统阴影：避免圆角外被渲染成不透明黑角
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
  win.once('ready-to-show', () => {
    try{ win.setBackgroundColor('#00000000'); }catch(e){}
    applyWindowShape();
    win.show();
  });

  // 形状裁剪：随尺寸/状态变化重建（resize 防抖）
  const applyWindowShape = () => {
    if (!win || win.isDestroyed()) return;
    try {
      if (typeof win.setShape !== 'function') return;
      if (win.isMaximized() || win.isFullScreen()) { win.setShape([]); return; }
      const [w, h] = win.getContentSize();
      win.setShape(roundRectRects(w, h, 32));
    } catch (e) {}
  };
  let shapeTimer = null;
  const queueShape = () => {
    if (shapeTimer) clearTimeout(shapeTimer);
    shapeTimer = setTimeout(() => { shapeTimer = null; applyWindowShape(); }, 120);
  };
  win.on('resize', queueShape);
  win.on('maximize', applyWindowShape);
  win.on('unmaximize', queueShape);
  win.on('enter-full-screen', applyWindowShape);
  win.on('leave-full-screen', queueShape);
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
