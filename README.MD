# WebPrintingExpert - Web 打印专家 | Web Printing Expert

<div align="center">

**专业的 JavaScript 页面打印解决方案 | Professional JavaScript Page Printing Solution**

支持 HTML 转 PDF | 打印机管理 | WebSocket 打印 | Node.js/Vue/React 打印

</div>

---

> **关键词**: web printing, pdf printing, html to pdf, silent printing, printer management, print automation, remote printing, websocket printing, batch printing, print queue, printer control, document printing, print server, network printing, 网页打印, PDF打印, 静默打印, 批量打印, 远程打印, 打印服务, 打印专家

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Platform](https://img.shields.io/badge/Platform-Windows%2010+-blue.svg)](https://www.microsoft.com/windows)
[![Languages](https://img.shields.io/badge/Languages-中文%20%7C%20English-green.svg)](http://webprintpdf.com)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![Electron](https://img.shields.io/badge/Electron-36.3.1-blue.svg)](https://electronjs.org/)
[![Vue.js](https://img.shields.io/badge/Vue.js-3.5.8-green.svg)](https://vuejs.org/)

## 📖 项目简介

WebPrintingExpert 是一个基于 Electron 和 Vue.js 开发的 Windows 桌面应用程序，专门用于解决 Web 页面打印问题。该软件通过 WebSocket 连接提供强大的 Web 打印服务，支持多种格式的文档打印，包括 HTML、PDF、图片等。软件集成了 Playwright HTML 渲染引擎和 SumatraPDF 打印工具，提供智能化的打印解决方案，并支持中文和英文双语界面。

> ⚠️ **注意**: 本软件仅支持 Windows 10 或更高版本的操作系统

**官方网站：** [http://webprintpdf.com](http://webprintpdf.com)

**软件下载：** [http://webprintpdf.com/downloadApp/](http://webprintpdf.com/downloadApp/)

## 🖼️ 软件界面

### 基础信息界面
![基础信息](ReadMeImages/1BasicInfo.png)
*软件主界面，显示基本信息和系统状态*

### 打印机管理
![打印机管理](ReadMeImages/2Printers.png)
*打印机配置和管理界面，支持多种打印机设置*

### 打印日志
![打印日志](ReadMeImages/3Logs.png)
*详细的打印操作日志，便于追踪和调试*

### 运行示例
![运行示例](ReadMeImages/4RunExamples.png)
*软件运行示例和功能演示*

### 联系我们
![联系我们](ReadMeImages/5ContactUs.png)
*联系方式和帮助信息界面*

## ✨ 主要功能

- 🖨️ **Web 页面打印** - 支持各种 Web 页面的高质量打印
- 📄 **PDF 文档处理** - 支持 PDF 文档的查看、打印和转换
- 🖼️ **图片打印** - 支持多种图片格式的打印
- 🔧 **打印机管理** - 智能识别和管理系统打印机
- 📊 **打印日志** - 详细的打印操作记录和统计
- 🌐 **WebSocket 服务** - 提供稳定的 WebSocket 连接服务
- 🎨 **现代化界面** - 基于 Vue.js 3 的现代化用户界面
- ⚡ **高性能** - 基于 Electron 的原生桌面应用性能
- 🌍 **多语言支持** - 支持中文和英文界面
- 🎭 **HTML 渲染引擎** - 基于 Playwright 的 HTML 渲染和 PDF 输出引擎
- 📖 **PDF 打印输出** - 集成 SumatraPDF 进行 PDF 文件打印

## 🚀 快速开始

### 方式一：直接下载使用

**推荐** - 下载 Windows 桌面版客户端，支持所有功能：

- **下载地址**: [http://webprintpdf.com/downloadApp/](http://webprintpdf.com/downloadApp/)
- **文件大小**: 约 100MB
- **系统要求**: Windows 10 或更高版本，至少 4GB RAM
- **安装方式**: 下载 exe 文件后直接运行安装程序

### 方式二：开发环境搭建

如果您需要从源码构建或参与开发：

#### 环境要求
- Node.js 16.0 或更高版本
- npm 或 yarn 包管理器
- **Windows 10 或更高版本** （仅支持 Windows 系统）

#### 安装依赖

```bash
# 安装 Vue 应用依赖
npm run install-vue

# 安装 Electron 应用依赖
npm run install-electron
```

#### 开发模式

```bash
# 启动开发环境（同时启动 Vue 前端和 Electron 应用）
npm run start

# 或者分别启动
npm run start-vue      # 启动 Vue 开发服务器
npm run start-electron # 启动 Electron 应用
```

#### 构建发布

```bash
# 构建生产版本
npm run package
```

## 📦 项目结构

```
PrintWeb/
├── electronApp/          # Electron 主进程代码
│   ├── server/           # WebSocket 服务器
│   ├── pdf/             # PDF 处理模块
│   └── assets/          # 应用资源文件
├── vueApp/              # Vue.js 前端应用
│   ├── src/             # 源代码
│   ├── public/          # 静态资源
│   └── dist/            # 构建输出
├── core/                # 核心功能模块
│   ├── base/            # 基础工具类
│   ├── electron/        # Electron 相关功能
│   ├── generateHtml/    # HTML 生成器
│   ├── generatePdf/     # PDF 生成器
│   └── printPdf/        # PDF 打印模块
├── appAsarUnpack/       # 应用解包文件
└── dist/                # 最终构建输出
```

## 🔧 技术栈

### 前端技术
- **Vue.js 3.5.8** - 渐进式 JavaScript 框架
- **Ant Design Vue 4.2.6** - 企业级 UI 组件库
- **Vite 5.3.1** - 快速的前端构建工具

### 后端技术
- **Electron 36.3.1** - 跨平台桌面应用框架
- **Express 4.18.2** - Web 应用框架
- **WebSocket** - 实时通信协议
- **PDF-lib 1.17.1** - PDF 文档处理库
- **Playwright 1.54.2** - HTML 渲染和 PDF 输出页面引擎
- **SumatraPDF** - PDF 文件打印输出工具

### 开发工具
- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化
- **Electron Builder** - 应用打包工具

## 📋 使用说明

1. **启动应用** - 运行 `npm run start` 启动应用
2. **连接服务** - 应用会自动启动 WebSocket 服务
3. **选择打印机** - 在设置中选择要使用的打印机
4. **发送打印任务** - 通过 WebSocket 或 API 发送打印任务
5. **查看日志** - 在日志页面查看打印操作记录

## 🔌 API 接口

### WebSocket 连接
- **连接地址**: `ws://localhost:端口号`
- **协议**: 支持自定义打印协议

### HTTP API
- **基础 URL**: `http://localhost:端口号/api`
- **文档**: 详见 API 文档

## 🤝 贡献指南

我们欢迎所有形式的贡献，包括但不限于：

- 🐛 报告 Bug
- ✨ 提出新功能建议
- 📝 改进文档
- 🔧 提交代码修复

## 📄 许可证

本项目采用 Apache License 2.0 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🔗 相关链接

- **官方网站**: [http://webprintpdf.com](http://webprintpdf.com)
- **软件下载**: [http://webprintpdf.com/downloadApp/](http://webprintpdf.com/downloadApp/)
- **客户端库**: [web-print-pdf](https://github.com/weixiaoyi/web-print-pdf)
- **问题反馈**: [GitHub Issues](https://github.com/your-username/PrintWeb/issues)

## 📞 联系我们

- **公司**: 中国浙江杭州把把胡科技公司
- **官网**: [http://webprintpdf.com](http://webprintpdf.com)
- **邮箱**: 通过官网联系我们

---

⭐ 如果这个项目对您有帮助，请给我们一个 Star！

---

## 🏷️ Topics 标签建议

在 GitHub 仓库设置中添加以下 Topics 标签以提高搜索可见性：

`web-printing` `pdf-printing` `html-to-pdf` `printing-service` `silent-printing` `printer-management` `print-automation` `remote-printing` `websocket-printing` `batch-printing` `print-queue` `printer-control` `document-printing` `web-to-pdf` `pdf-generator` `print-server` `network-printing` `cloud-printing` `print-monitoring` `print-logging`
