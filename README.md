# AI Icon Generator - Figma Plugin

<p align="center">
  <img src="src/app/assets/logo.svg" alt="AI Icon Generator Logo" width="64" height="64">
</p>

<p align="center">
  <strong>Generate beautiful icons and illustrations with AI directly in Figma</strong>
</p>

<p align="center">
  English | <a href="./README.zh.md">中文文档</a>
</p>

## ✨ Features

- 🎨 **Sketch to Icon** - Draw a rough sketch, let AI turn it into a polished icon
- 🖼️ **Style Reference Library** - Save your design style references, ensure consistent output
- 🤖 **Powered by Claude** - Leveraging Claude's vision capabilities for high-quality SVG generation
- 📝 **Prompt Templates** - Built-in and custom prompt templates for quick generation
- 📚 **History Records** - Browse and reuse your generation history
- 🔧 **Flexible Settings** - Custom API endpoint, default output size, and more

## 🎯 How It Works

1. **Prepare a Sketch** - Select a rough sketch or wireframe in Figma
2. **Choose Style References** - Pick style references from your library to guide the AI
3. **Describe Your Icon** - Enter the theme/description of what you want to generate
4. **Generate & Insert** - AI generates the SVG, preview it and insert directly into your canvas

## 📸 Screenshots

> Coming soon

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/) package manager
- Figma desktop app
- Claude API key from [Anthropic](https://console.anthropic.com/)

### Installation

```bash
# Clone the repository
git clone https://github.com/AcringStudio/figma-ai-icon-generator-plugin.git

# Navigate to the project directory
cd figma-ai-icon-generator-plugin

# Install dependencies
pnpm install
```

### Development

```bash
# Start development mode with hot reload
pnpm dev
```

### Production Build

```bash
# Build for production
pnpm build
```

### Load Plugin in Figma

1. Open Figma desktop app
2. Go to `Plugins` → `Development` → `Import plugin from manifest...`
3. Select the `manifest.json` file in the project root
4. The plugin will appear in your development plugins

## 🔧 Configuration

### API Setup

1. Open the plugin in Figma
2. Click the settings icon (⚙️) in the top right
3. Enter your Claude API Key
4. (Optional) Set a custom API Base URL if using a proxy

### Plugin Info

Edit `manifest.json` to customize plugin information:

```json
{
  "name": "AI Icon Generator",
  "id": "your-plugin-id",
  "api": "1.0.0",
  "main": "dist/code.js",
  "ui": "dist/ui.html"
}
```

> ⚠️ **Important**: Replace the `id` field with your unique plugin ID before publishing. Get one from the [Figma Plugin Console](https://www.figma.com/developers).

## 📁 Project Structure

```
src/
├── app/                          # UI Layer (React)
│   ├── components/
│   │   ├── App.tsx               # Main application
│   │   ├── tabs/                 # Tab components
│   │   │   ├── GenerateTab.tsx   # Icon generation
│   │   │   ├── LibraryTab.tsx    # Style reference library
│   │   │   ├── TemplatesTab.tsx  # Prompt templates
│   │   │   └── HistoryTab.tsx    # Generation history
│   │   ├── features/             # Feature components
│   │   └── ui/                   # shadcn/ui components
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Utilities and API client
│   └── styles/                   # Tailwind CSS styles
├── plugin/
│   └── controller.ts             # Figma plugin controller
└── typings/
    └── types.d.ts                # TypeScript definitions
```

## 🛠️ Tech Stack

- ⚛️ **React 19** - UI framework
- 🎨 **Tailwind CSS 4** - Styling
- 🧩 **shadcn/ui** - UI components
- 📦 **TypeScript 5.7** - Type safety
- 🔧 **Webpack** - Bundling
- 🤖 **Claude API** - AI generation

## 📝 Usage Guide

### Adding Style References

1. Go to the **Library** tab
2. Select an icon/illustration in Figma that represents your desired style
3. Click **Add from Selection**
4. Name and describe your reference

### Generating Icons

1. Go to the **Generate** tab
2. Select a sketch in Figma and click **Capture Sketch**
3. Choose one or more style references
4. Enter the icon theme (e.g., "database", "cloud storage")
5. Click **Generate**
6. Review the result and click **Insert to Canvas**

### Using Templates

1. Go to the **Templates** tab
2. Browse preset templates or create your own
3. When generating, select a template to auto-fill the prompt

## 🔗 Related Resources

- [How to Use AI to Improve Icon Production Efficiency](https://blog.acring.cn/%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8-ai-%E5%B8%AE%E5%8A%A9%E8%AE%BE%E8%AE%A1%E6%8F%90%E5%8D%87%E5%9B%BE%E6%A0%87%E7%94%9F%E4%BA%A7%E6%95%88%E7%8E%87-2c5be054a05a806a9a96de78d17a55f5) - The workflow that inspired this plugin
- [Figma Plugin API Docs](https://www.figma.com/plugin-docs/)
- [Claude API Docs](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

[MIT](./LICENSE)
