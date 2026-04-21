# Inne 酒馆

<!-- Banner -->
<p align="center">
  <img src="https://raw.githubusercontent.com/YupenBob/Inne/main/assets/logo.svg" alt="Inne" width="120"/>
</p>

<!-- 徽章行 -->
<p align="center">
  <a href="https://github.com/YupenBob/Inne/stargazers"><img src="https://img.shields.io/github/stars/YupenBob/Inne?logo=github&style=flat-square&color=D4AF37" alt="Stars"/></a>
  <a href="https://github.com/YupenBob/Inne/network/members"><img src="https://img.shields.io/github/forks/YupenBob/Inne?logo=github&style=flat-square&color=8a6030" alt="Forks"/></a>
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" alt="License"/>
  <a href="https://inne.xsanye.cn"><img src="https://img.shields.io/website?url=https://inne.xsanye.cn&logo=internet&style=flat-square&color=D4AF37" alt="Website"/></a>
</p>

> 🍺 *每一个旅人的心中，都有一间属于自己的酒馆。*
> *走进 Inne，与各色有趣的角色相遇，开启一场场温暖的对话。*

Inne 是一个轻量级的 AI 角色扮演对话网站。无需注册，无需服务器费用——只需带上你自己的 AI API Key，即可开启一场沉浸式的酒馆之旅。

---

## ✨ 特性

- 🍺 **沉浸式酒馆氛围** — 深色木质感 + 金色强调色，营造温暖聊天的视觉体验
- 👥 **5 位内置角色** — 酒馆老板、吟游诗人、流浪剑客、炼金术士、森林精灵
- ✏️ **自定义角色** — 自由创建你独一无二的酒馆伙伴（提示词+描述+头像）
- 🔑 **多模型支持** — OpenAI / Anthropic / MiniMax / 自定义 API Endpoint
- 💾 **对话持久化** — 刷新页面不丢记录，会话自动恢复
- 📱 **移动端适配** — 响应式布局，手机平板同样舒适
- ⚡ **纯前端实现** — 单 HTML 文件，无需后端，部署极简

---

## 🚀 快速开始

### 在线体验

👉 **[inne.xsanye.cn](https://inne.xsanye.cn)** — 直接访问，即开即用

### 本地运行

```bash
# 克隆仓库
git clone https://github.com/YupenBob/Inne.git
cd Inne

# 直接用浏览器打开 index.html
open index.html
# 或者用本地服务器
npx serve .
```

### 配置 API Key

1. 点击右上角 ⚙️ **设置** 按钮
2. 选择模型类型（OpenAI / Anthropic / MiniMax / 自定义）
3. 填入你的 API Key
4. 选择或输入模型名称
5. 点击 **保存**，开始聊天！

### 模型推荐

| 模型 | 特点 | 适合场景 |
|------|------|---------|
| GPT-4o | 能力最强 | 复杂对话、深度角色扮演 |
| GPT-4o-mini | 速度快，便宜 | 日常聊天、快速体验 |
| Claude-3.5-Haiku | 性价比高 | 快速响应、闲聊 |
| MiniMax-Text-01 | 国产，便宜 | 日常使用 |

---

## 👥 内置角色

| 角色 | 描述 | 风格 |
|------|------|------|
| 🍺 **酒馆老板** | 友善亲切的引导者 | 温暖、健谈、耐心 |
| 🎭 **吟游诗人** | 讲述传奇故事的文艺旅者 | 诗意、画面感、浪漫 |
| ⚔️ **流浪剑客** | 沉默寡言的独行侠客 | 话少、直接、沧桑 |
| 🧪 **炼金术士** | 沉迷实验的神秘学者 | 好奇、术语多、走神 |
| 🌿 **森林精灵** | 守护自然的空灵存在 | 空灵、轻柔、预言感 |

---

## 🛠 项目结构

```
inne/
├── index.html          # 单页应用入口
├── src/
│   ├── style.css       # 酒馆风格样式
│   ├── app.js          # 主逻辑
│   ├── characters.js   # 内置角色 + 自定义角色管理
│   └── api.js          # AI API 调用封装
├── assets/
│   └── logo.svg        # Inne 酒馆 Logo
├── README.md
├── CONTRIBUTING.md
└── LICENSE
```

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

请先阅读 [CONTRIBUTING.md](CONTRIBUTING.md)，遵循贡献指南。

---

## 📜 License

MIT License © 2024-2025 [YupenBob](https://github.com/YupenBob)

---

*Inne 酒馆 —— 旅人，欢迎常来。🍺*
