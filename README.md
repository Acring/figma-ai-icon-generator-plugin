# Figma React Plugin Template

A modern Figma plugin development template with React 19, Tailwind CSS 4, and shadcn/ui.

English | [中文文档](./README.zh.md)

## ✨ Features

- ⚛️ **React 19** - Latest React version
- 🎨 **Tailwind CSS 4** - New CSS-first configuration
- 🧩 **shadcn/ui** - Beautiful UI components (Button, Input, Card)
- 📦 **TypeScript 5.7** - Full type support
- 🔧 **Webpack** - Dev/production build setup
- 🎯 **Path Aliases** - Simplified imports with `@/`

## 📁 Project Structure

```
src/
├── app/                    # UI code
│   ├── components/
│   │   ├── ui/            # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   └── card.tsx
│   │   └── App.tsx        # Main app component
│   ├── lib/
│   │   └── utils.ts       # cn() utility
│   ├── styles/
│   │   └── ui.css         # Tailwind CSS entry
│   ├── index.html
│   └── index.tsx
├── plugin/
│   └── controller.ts      # Figma plugin main code
└── typings/
    └── types.d.ts
```

## 🚀 Quick Start

### Install dependencies

```bash
pnpm install
```

### Development mode

```bash
pnpm build:watch
```

### Production build

```bash
pnpm build
```

### Load plugin in Figma

1. Open Figma desktop app
2. Go to `Plugins` → `Development` → `Import plugin from manifest...`
3. Select the `manifest.json` file in the project root

## 🔧 Configuration

### Modify plugin info

Edit `manifest.json`:

```json
{
  "name": "Your Plugin Name",
  "id": "your-plugin-id",
  "api": "1.0.0",
  "main": "dist/code.js",
  "ui": "dist/ui.html",
  "editorType": ["figma"]
}
```

> ⚠️ **Important**: Replace the `id` field with your actual plugin ID before publishing. You can get a unique ID from the Figma plugin console.

### Customize theme

Edit the `@theme` block in `src/app/styles/ui.css`:

```css
@theme {
  --color-primary: #7855fa;
  /* other custom colors... */
}
```

### Add more shadcn components

Visit [shadcn/ui](https://ui.shadcn.com/docs/components) to get more component code and manually add them to `src/app/components/ui/`.

## 📝 UI & Figma Communication

### Send message from UI to Figma

```typescript
parent.postMessage({ pluginMessage: { type: 'your-action', data: {} } }, '*');
```

### Send message from Figma to UI

```typescript
figma.ui.postMessage({ type: 'your-event', data: {} });
```

### Receive messages in UI

```typescript
useEffect(() => {
  const handleMessage = (event: MessageEvent) => {
    const msg = event.data.pluginMessage;
    // Handle message
  };
  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}, []);
```

### Receive messages in Figma

```typescript
figma.ui.onmessage = (msg) => {
  // Handle message
};
```

## 📄 License

MIT
