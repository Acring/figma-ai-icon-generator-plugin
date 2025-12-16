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

// ==================== 数据模型 ====================

/** API 配置 */
interface APIConfig {
  apiKey: string;
  baseUrl: string; // 默认: https://api.anthropic.com/v1/messages
  model: string; // 默认: claude-sonnet-4-5-20250929
}

/** 风格参考 */
interface StyleReference {
  id: string;
  name: string;
  description?: string;
  svgCode: string;
  thumbnail?: string; // Base64 缩略图
  createdAt: number;
  updatedAt: number;
}

/** 草图数据 */
interface SketchData {
  imageBase64: string; // 草图图片的 Base64
  width: number;
  height: number;
  sourceNodeId?: string; // 来源 Figma 节点 ID
}

/** 提示词模板 */
interface PromptTemplate {
  id: string;
  name: string;
  description?: string;
  template: string; // 包含 {theme} 等占位符
  isPreset: boolean; // 是否为预设模板
  createdAt: number;
}

/** 生成请求 */
interface GenerateRequest {
  sketch?: SketchData;
  styleRefs: StyleReference[];
  theme: string;
  customPrompt?: string;
  outputWidth: number;
  outputHeight: number;
}

/** 生成结果 */
interface GenerateResult {
  svgCode: string;
  width: number;
  height: number;
}

/** 历史记录 */
interface HistoryRecord {
  id: string;
  request: GenerateRequest;
  result: GenerateResult;
  createdAt: number;
}

/** 应用存储数据 */
interface AppStorageData {
  apiConfig?: APIConfig;
  styleRefs: StyleReference[];
  templates: PromptTemplate[];
  history: HistoryRecord[];
  settings: {
    defaultWidth: number;
    defaultHeight: number;
  };
}

/** 存储键类型 */
type StorageKey = keyof AppStorageData;

// ==================== 消息类型 ====================

/** 通知选项 */
interface NotificationOptions {
  error?: boolean;
  timeout?: number;
}

/** UI → Plugin 消息 */
type UIToPluginMessage =
  | { type: 'get-selection-as-svg' }
  | { type: 'get-selection-as-image' }
  | { type: 'insert-svg'; svgCode: string }
  | { type: 'load-storage'; key: StorageKey }
  | { type: 'load-all-storage' }
  | { type: 'save-storage'; key: StorageKey; value: unknown }
  | { type: 'resize-ui'; width: number; height: number }
  | { type: 'notify'; message: string; options?: NotificationOptions }
  | { type: 'close' };

/** Plugin → UI 消息 */
type PluginToUIMessage =
  | { type: 'selection-svg'; svgCode: string | null; error?: string }
  | {
      type: 'selection-image';
      imageBase64: string | null;
      width: number;
      height: number;
      error?: string;
    }
  | { type: 'svg-inserted'; success: boolean; nodeId?: string; error?: string }
  | { type: 'storage-loaded'; key: StorageKey; value: unknown }
  | { type: 'all-storage-loaded'; data: Partial<AppStorageData> }
  | { type: 'storage-saved'; key: StorageKey; success: boolean; error?: string }
  | { type: 'selection-changed'; hasSelection: boolean; count: number };

/** 通用消息类型 */
type PluginMessage = UIToPluginMessage | PluginToUIMessage;

// 扩展 Window 接口
interface Window {
  onmessage: ((event: MessageEvent<{ pluginMessage: PluginMessage }>) => void) | null;
}
