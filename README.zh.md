# AI Icon Generator - Figma 插件

<p align="center">
  <img src="src/app/assets/logo.svg" alt="AI Icon Generator Logo" width="64" height="64">
</p>

<p align="center">
  <strong>在 Figma 中使用 AI 直接生成精美的图标和插图</strong>
</p>

<p align="center">
  <a href="./README.md">English</a> | 中文文档
</p>

## ✨ 功能特性

- 🎨 **草图生成图标** - 画一个粗略草图，让 AI 将其转化为精美图标
- 🖼️ **风格参考库** - 保存你的设计风格参考，确保输出风格统一
- 🤖 **Claude AI 驱动** - 利用 Claude 的视觉能力生成高质量 SVG
- 📝 **提示词模板** - 内置和自定义提示词模板，快速启动生成
- 📚 **历史记录** - 浏览和复用你的生成历史
- 🔧 **灵活配置** - 自定义 API 端点、默认输出尺寸等

## 🎯 工作原理

1. **准备草图** - 在 Figma 中选择一个粗略草图或线框图
2. **选择风格参考** - 从参考库中选择风格参考来引导 AI
3. **描述图标** - 输入你想要生成的主题/描述
4. **生成并插入** - AI 生成 SVG，预览后直接插入画布

## 📸 截图预览

> 即将推出

## 🚀 快速开始

### 环境要求

- [Node.js](https://nodejs.org/)（v18 或更高版本）
- [pnpm](https://pnpm.io/) 包管理器
- Figma 桌面应用
- Claude API Key（从 [Anthropic](https://console.anthropic.com/) 获取）

### 安装

```bash
# 克隆仓库
git clone https://github.com/AcringStudio/figma-ai-icon-generator-plugin.git

# 进入项目目录
cd figma-ai-icon-generator-plugin

# 安装依赖
pnpm install
```

### 开发模式

```bash
# 启动开发模式，支持热重载
pnpm dev
```

### 生产构建

```bash
# 构建生产版本
pnpm build
```

### 在 Figma 中加载插件

1. 打开 Figma 桌面应用
2. 进入 `Plugins` → `Development` → `Import plugin from manifest...`
3. 选择项目根目录下的 `manifest.json` 文件
4. 插件将出现在你的开发插件列表中

## 🔧 配置说明

### API 设置

1. 在 Figma 中打开插件
2. 点击右上角的设置图标（⚙️）
3. 输入你的 Claude API Key
4. （可选）如果使用代理，设置自定义 API Base URL

### 插件信息

编辑 `manifest.json` 自定义插件信息：

```json
{
  "name": "AI Icon Generator",
  "id": "your-plugin-id",
  "api": "1.0.0",
  "main": "dist/code.js",
  "ui": "dist/ui.html"
}
```

> ⚠️ **重要**：发布前请将 `id` 字段替换为你的唯一插件 ID。可以在 [Figma 插件控制台](https://www.figma.com/developers) 获取。

## 📁 项目结构

```
src/
├── app/                          # UI 层（React）
│   ├── components/
│   │   ├── App.tsx               # 主应用组件
│   │   ├── tabs/                 # 标签页组件
│   │   │   ├── GenerateTab.tsx   # 图标生成
│   │   │   ├── LibraryTab.tsx    # 风格参考库
│   │   │   ├── TemplatesTab.tsx  # 提示词模板
│   │   │   └── HistoryTab.tsx    # 生成历史
│   │   ├── features/             # 功能组件
│   │   └── ui/                   # shadcn/ui 组件
│   ├── hooks/                    # 自定义 React Hooks
│   ├── lib/                      # 工具函数和 API 客户端
│   └── styles/                   # Tailwind CSS 样式
├── plugin/
│   └── controller.ts             # Figma 插件控制器
└── typings/
    └── types.d.ts                # TypeScript 类型定义
```

## 🛠️ 技术栈

- ⚛️ **React 19** - UI 框架
- 🎨 **Tailwind CSS 4** - 样式
- 🧩 **shadcn/ui** - UI 组件
- 📦 **TypeScript 5.7** - 类型安全
- 🔧 **Webpack** - 打包工具
- 🤖 **Claude API** - AI 生成

## 📝 使用指南

### 添加风格参考

1. 切换到 **参考库** 标签页
2. 在 Figma 中选择一个代表你想要风格的图标/插图
3. 点击 **从选中添加**
4. 为参考命名并添加描述

### 生成图标

1. 切换到 **生成** 标签页
2. 在 Figma 中选择一个草图，点击 **获取草图**
3. 选择一个或多个风格参考
4. 输入图标主题（如「数据库」、「云存储」）
5. 点击 **生成**
6. 预览结果，满意后点击 **插入到画布**

### 使用模板

1. 切换到 **模板** 标签页
2. 浏览预设模板或创建自定义模板
3. 生成时选择模板可自动填充提示词

## 🔗 相关资源

- [如何使用 AI 帮助设计提升图标生产效率](https://blog.acring.cn/%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8-ai-%E5%B8%AE%E5%8A%A9%E8%AE%BE%E8%AE%A1%E6%8F%90%E5%8D%87%E5%9B%BE%E6%A0%87%E7%94%9F%E4%BA%A7%E6%95%88%E7%8E%87-2c5be054a05a806a9a96de78d17a55f5) - 启发本插件的工作流程
- [Figma 插件 API 文档](https://www.figma.com/plugin-docs/)
- [Claude API 文档](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)

## 🤝 贡献

欢迎贡献代码！请随时提交 Pull Request。

## 📄 许可证

[MIT](./LICENSE)
