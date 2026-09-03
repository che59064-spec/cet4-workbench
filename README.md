# 四级备考工作台（CET-4 Workbench · 桌面版）

大学英语四级备考工具：单词背诵、听力/阅读练习、写作模板、模拟考试、题库中心。数据全部保存在本地。

## 功能一览
- 📖 **单词本**：4544 词完整四级词库（英美音标 / 多义项 / 词组 / 双语例句）+ 卡片式背诵模式（键盘快捷键）
- 🎧 **听力练习 / 📄 阅读理解**：内置 6 套听力 + 6 篇阅读，浏览器语音朗读原文
- 📝 **模拟考试**：710 分制限时模考，自动交卷、成绩报告、错题解析
- 🗂️ **题库中心**：导入自定义试卷 JSON、在线题库源拉取、自动组卷

## 快速开始（开发模式）
```bash
# 国内网络建议先设置镜像
set ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
npm config set registry https://registry.npmmirror.com

npm install
npm start
```

## 打包 Windows 安装包 / 免安装 exe
```bash
npm run dist    # 生成 NSIS 安装包（release/）
npm run pack    # 生成便携版 exe（release/）
```

## 试卷导入格式
在「题库中心」粘贴或上传 JSON（也可放多个对象组成数组），结构示例：

```json
{
  "title": "2026年6月模拟卷",
  "time": 3600,
  "source": "可选-来源备注",
  "listening": [
    {
      "id": "customL1", "title": "短对话 · 购物",
      "audio": "可选：听力原文文本（TTS朗读）",
      "audioUrl": "可选：真实音频URL（优先生效）",
      "questions": [
        { "q": "问题", "options": ["A选项", "B选项", "C选项", "D选项"], "answer": 1, "analysis": "解析" }
      ]
    }
  ],
  "reading": [
    {
      "id": "customR1", "title": "文章标题",
      "paragraphs": ["段落1", "段落2"],
      "questions": [
        { "q": "问题", "options": ["A", "B", "C", "D"], "answer": 0, "analysis": "解析" }
      ]
    }
  ]
}
```

`listening` / `reading` 均可省略其一；多套卷用 `[ {...}, {...} ]` 数组导入。

## 说明
- 听力无真实音频时用系统 TTS 朗读；`audioUrl` 存在时优先播放真实音频
- 学习数据存于 Electron userData（localStorage），卸载/重装前可自行备份
