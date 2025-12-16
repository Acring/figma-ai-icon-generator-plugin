# Figma React Plugin Template


一个现代化的 Figma 插件开发模板，集成 React 19、Tailwind CSS 4 和 shadcn/ui。

[English](./README.md) | 中文文档

## ✨ 特性

- ⚛️ **React 19** - 最新 React 版本
- 🎨 **Tailwind CSS 4** - 全新 CSS-first 配置
- 🧩 **shadcn/ui** - 精美的 UI 组件（Button、Input、Card）
- 📦 **TypeScript 5.7** - 完整类型支持
- 🔧 **Webpack** - 开发/生产构建配置
- 🎯 **路径别名** - 使用 `@/` 简化导入

## 📁 项目结构

```
src/
├── app/                    # UI 代码
│   ├── components/
│   │   ├── ui/            # shadcn/ui 组件
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   └── card.tsx
│   │   └── App.tsx        # 主应用组件
│   ├── lib/
│   │   └── utils.ts       # cn() 工具函数
│   ├── styles/
│   │   └── ui.css         # Tailwind CSS 入口
│   ├── index.html
│   └── index.tsx
├── plugin/
│   └── controller.ts      # Figma 插件主代码
└── typings/
    └── types.d.ts
```

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm build:watch
```

### 生产构建

```bash
pnpm build
```

### 在 Figma 中加载插件

1. 打开 Figma 桌面应用
2. 进入 `Plugins` → `Development` → `Import plugin from manifest...`
3. 选择项目根目录下的 `manifest.json` 文件

## 🔧 配置

### 修改插件信息

编辑 `manifest.json`：

```json
{
  "name": "你的插件名称",
  "id": "你的插件ID",
  "api": "1.0.0",
  "main": "dist/code.js",
  "ui": "dist/ui.html",
  "editorType": ["figma"]
}
```

> ⚠️ **重要**: 发布插件前请将 `id` 字段替换为你的实际插件 ID。你可以在 Figma 插件控制台获取唯一 ID。

### 自定义主题

编辑 `src/app/styles/ui.css` 中的 `@theme` 配置：

```css
@theme {
  --color-primary: #7855fa;
  /* 其他自定义颜色... */
}
```

### 添加更多 shadcn 组件

访问 [shadcn/ui](https://ui.shadcn.com/docs/components) 获取更多组件代码，手动添加到 `src/app/components/ui/` 目录。

## 📝 UI 与 Figma 通信

### 从 UI 发送消息到 Figma

```typescript
parent.postMessage({ pluginMessage: { type: 'your-action', data: {} } }, '*');
```

### 从 Figma 发送消息到 UI

```typescript
figma.ui.postMessage({ type: 'your-event', data: {} });
```

### 在 UI 中接收消息

```typescript
useEffect(() => {
  const handleMessage = (event: MessageEvent) => {
    const msg = event.data.pluginMessage;
    // 处理消息
  };
  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}, []);
```

### 在 Figma 中接收消息

```typescript
figma.ui.onmessage = (msg) => {
  // 处理消息
};
```

## 📄 License

MIT

