// 资源模块声明
declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

// Figma 插件消息类型
interface PluginMessage {
  type: string;
  [key: string]: unknown;
}

// 扩展 Window 接口
interface Window {
  onmessage: ((event: MessageEvent<{ pluginMessage: PluginMessage }>) => void) | null;
}
