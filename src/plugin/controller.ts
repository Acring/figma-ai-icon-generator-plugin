// ==================== Plugin Controller ====================
// Figma 插件控制器 - 运行在 Figma 沙箱环境中
// 负责：Figma API 操作、clientStorage 存储、与 UI 通信

// 初始化插件
figma.showUI(__html__, { width: 360, height: 700 });

// 设置消息处理器
setupMessageHandlers();

// 设置选中监听
setupSelectionListener();

// 初始化：发送当前选中状态
sendSelectionStatus();

// ==================== 消息处理 ====================

function setupMessageHandlers(): void {
  figma.ui.onmessage = async (msg: UIToPluginMessage) => {
    switch (msg.type) {
      case 'get-selection-as-svg':
        await handleGetSelectionAsSVG();
        break;
      case 'get-selection-as-image':
        await handleGetSelectionAsImage();
        break;
      case 'insert-svg':
        await handleInsertSVG(msg.svgCode);
        break;
      case 'load-storage':
        await handleLoadStorage(msg.key);
        break;
      case 'load-all-storage':
        await handleLoadAllStorage();
        break;
      case 'save-storage':
        await handleSaveStorage(msg.key, msg.value);
        break;
      case 'resize-ui':
        figma.ui.resize(msg.width, msg.height);
        break;
      case 'notify':
        figma.notify(msg.message, msg.options);
        break;
      case 'close':
        figma.closePlugin();
        break;
    }
  };
}

// ==================== 选中操作 ====================

/** 获取选中内容的 SVG */
async function handleGetSelectionAsSVG(): Promise<void> {
  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    figma.ui.postMessage({
      type: 'selection-svg',
      svgCode: null,
      error: '请先在 Figma 中选择一个元素',
    } as PluginToUIMessage);
    return;
  }

  try {
    const node = selection[0];
    // 检查节点是否支持导出
    if (!('exportAsync' in node)) {
      throw new Error('选中的元素不支持导出');
    }

    const svgCode = await (node as SceneNode & ExportMixin).exportAsync({
      format: 'SVG_STRING',
    });

    figma.ui.postMessage({
      type: 'selection-svg',
      svgCode,
    } as PluginToUIMessage);
  } catch (error) {
    figma.ui.postMessage({
      type: 'selection-svg',
      svgCode: null,
      error: String(error),
    } as PluginToUIMessage);
  }
}

/** 获取选中内容的图片 (用于草图) */
async function handleGetSelectionAsImage(): Promise<void> {
  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    figma.ui.postMessage({
      type: 'selection-image',
      imageBase64: null,
      width: 0,
      height: 0,
      error: '请先在 Figma 中选择一个元素',
    } as PluginToUIMessage);
    return;
  }

  try {
    const node = selection[0];
    // 检查节点是否支持导出
    if (!('exportAsync' in node)) {
      throw new Error('选中的元素不支持导出');
    }

    const exportNode = node as SceneNode & ExportMixin;

    // 限制最大宽度为 800px，避免图片过大
    const maxWidth = 800;
    const scale = node.width > maxWidth ? maxWidth / node.width : 2;

    const bytes = await exportNode.exportAsync({
      format: 'PNG',
      constraint: { type: 'SCALE', value: scale },
    });

    const imageBase64 = figma.base64Encode(bytes);

    figma.ui.postMessage({
      type: 'selection-image',
      imageBase64,
      width: node.width,
      height: node.height,
    } as PluginToUIMessage);
  } catch (error) {
    figma.ui.postMessage({
      type: 'selection-image',
      imageBase64: null,
      width: 0,
      height: 0,
      error: String(error),
    } as PluginToUIMessage);
  }
}

/** 插入 SVG 到画布 */
async function handleInsertSVG(svgCode: string): Promise<void> {
  try {
    const node = figma.createNodeFromSvg(svgCode);
    figma.currentPage.appendChild(node);

    // 将新节点放在视口中心
    const viewportCenter = figma.viewport.center;
    node.x = viewportCenter.x - node.width / 2;
    node.y = viewportCenter.y - node.height / 2;

    // 选中并聚焦到新节点
    figma.currentPage.selection = [node];
    figma.viewport.scrollAndZoomIntoView([node]);

    figma.ui.postMessage({
      type: 'svg-inserted',
      success: true,
      nodeId: node.id,
    } as PluginToUIMessage);

    figma.notify('图标已插入画布');
  } catch (error) {
    figma.ui.postMessage({
      type: 'svg-inserted',
      success: false,
      error: String(error),
    } as PluginToUIMessage);

    figma.notify('插入失败: ' + String(error), { error: true });
  }
}

// ==================== 选中监听 ====================

function setupSelectionListener(): void {
  figma.on('selectionchange', () => {
    sendSelectionStatus();
  });
}

function sendSelectionStatus(): void {
  const selection = figma.currentPage.selection;
  figma.ui.postMessage({
    type: 'selection-changed',
    hasSelection: selection.length > 0,
    count: selection.length,
  } as PluginToUIMessage);
}

// ==================== 存储操作 ====================

const STORAGE_PREFIX = 'ai-icon-generator:';

/** 加载单个存储项 */
async function handleLoadStorage(key: StorageKey): Promise<void> {
  try {
    const value = await figma.clientStorage.getAsync(STORAGE_PREFIX + key);
    figma.ui.postMessage({
      type: 'storage-loaded',
      key,
      value: value !== null && value !== undefined ? value : getDefaultValue(key),
    } as PluginToUIMessage);
  } catch (error) {
    console.error('Load storage error:', error);
    figma.ui.postMessage({
      type: 'storage-loaded',
      key,
      value: getDefaultValue(key),
    } as PluginToUIMessage);
  }
}

/** 加载所有存储数据 */
async function handleLoadAllStorage(): Promise<void> {
  try {
    const keys: StorageKey[] = ['apiConfig', 'styleRefs', 'templates', 'history', 'settings'];
    const data: Partial<AppStorageData> = {};

    for (const key of keys) {
      const value = await figma.clientStorage.getAsync(STORAGE_PREFIX + key);
      (data as Record<string, unknown>)[key] = value !== null && value !== undefined ? value : getDefaultValue(key);
    }

    figma.ui.postMessage({
      type: 'all-storage-loaded',
      data,
    } as PluginToUIMessage);
  } catch (error) {
    console.error('Load all storage error:', error);
    figma.ui.postMessage({
      type: 'all-storage-loaded',
      data: getDefaultStorageData(),
    } as PluginToUIMessage);
  }
}

/** 保存存储项 */
async function handleSaveStorage(key: StorageKey, value: unknown): Promise<void> {
  try {
    await figma.clientStorage.setAsync(STORAGE_PREFIX + key, value);
    figma.ui.postMessage({
      type: 'storage-saved',
      key,
      success: true,
    } as PluginToUIMessage);
  } catch (error) {
    console.error('Save storage error:', error);
    figma.ui.postMessage({
      type: 'storage-saved',
      key,
      success: false,
      error: String(error),
    } as PluginToUIMessage);
  }
}

/** 获取默认值 */
function getDefaultValue(key: StorageKey): unknown {
  const defaults = getDefaultStorageData();
  return defaults[key];
}

/** 获取默认存储数据 */
function getDefaultStorageData(): AppStorageData {
  return {
    apiConfig: undefined,
    styleRefs: [],
    templates: [],
    history: [],
    settings: {
      defaultWidth: 600,
      defaultHeight: 400,
    },
  };
}
