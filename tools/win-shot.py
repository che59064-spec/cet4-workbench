# -*- coding: utf-8 -*-
"""截取指定标题的窗口（纯 ctypes + GDI，无第三方依赖）"""
import ctypes, ctypes.wintypes as wt, struct, sys, time

TITLE = "CET-4 四级备考工作台"
OUT = sys.argv[1] if len(sys.argv) > 1 else "_win_shot.bmp"

try:
    ctypes.windll.shcore.SetProcessDpiAwareness(2)
except Exception:
    try:
        ctypes.windll.user32.SetProcessDPIAware()
    except Exception:
        pass

u = ctypes.windll.user32
g = ctypes.windll.gdi32

hwnd = u.FindWindowW(None, TITLE)
if not hwnd:
    print("NOT_FOUND"); sys.exit(1)

u.SetForegroundWindow(hwnd)
time.sleep(0.6)

rect = wt.RECT()
u.GetWindowRect(hwnd, ctypes.byref(rect))
x, y = rect.left, rect.top
w, h = rect.right - rect.left, rect.bottom - rect.top
print("RECT", x, y, w, h)

srcdc = g.CreateDCW("DISPLAY", None, None, None)
memdc = g.CreateCompatibleDC(srcdc)
bmp = g.CreateCompatibleBitmap(srcdc, w, h)
g.SelectObject(memdc, bmp)
g.BitBlt(memdc, 0, 0, w, h, srcdc, x, y, 0x00CC0020)

class BIH(ctypes.Structure):
    _fields_ = [("biSize", wt.DWORD), ("biWidth", wt.LONG), ("biHeight", wt.LONG),
                ("biPlanes", wt.WORD), ("biBitCount", wt.WORD), ("biCompression", wt.DWORD),
                ("biSizeImage", wt.DWORD), ("biXPelsPerMeter", wt.LONG), ("biYPelsPerMeter", wt.LONG),
                ("biClrUsed", wt.DWORD), ("biClrImportant", wt.DWORD)]

bi = BIH()
bi.biSize = 40; bi.biWidth = w; bi.biHeight = -h; bi.biPlanes = 1; bi.biBitCount = 32; bi.biCompression = 0
buf = ctypes.create_string_buffer(w * h * 4)
g.GetDIBits(memdc, bmp, 0, h, buf, ctypes.byref(bi), 0)

row = w * 4
data = buf.raw
hdr = b'BM' + struct.pack('<IHHI', 14 + 40 + row * h, 0, 0, 54)
hdr += struct.pack('<IiiHHIIiiII', 40, w, -h, 1, 32, 0, row * h, 0, 0, 0, 0)
with open(OUT, 'wb') as f:
    f.write(hdr + data)
print("SAVED", OUT, w, "x", h)

g.DeleteObject(bmp); g.DeleteDC(memdc); g.DeleteDC(srcdc)
