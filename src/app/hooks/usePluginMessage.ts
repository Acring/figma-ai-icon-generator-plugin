import { useEffect, useCallback, useRef } from 'react';

/**
 * 监听特定类型的 Plugin 消息
 */
export function usePluginMessage<T extends PluginToUIMessage['type']>(
  type: T,
  handler: (data: Extract<PluginToUIMessage, { type: T }>) => void
): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const msg = event.data.pluginMessage;
      if (msg?.type === type) {
        handlerRef.current(msg as Extract<PluginToUIMessage, { type: T }>);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [type]);
}

/**
 * 监听多个类型的 Plugin 消息
 */
export function usePluginMessages(
  handlers: Partial<{
    [K in PluginToUIMessage['type']]: (data: Extract<PluginToUIMessage, { type: K }>) => void;
  }>
): void {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const msg = event.data.pluginMessage as PluginToUIMessage;
      if (msg?.type) {
        const handler = handlersRef.current[msg.type as keyof typeof handlersRef.current];
        if (handler) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (handler as (data: any) => void)(msg);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);
}

/**
 * 发送消息给 Plugin
 */
export function postToPlugin(message: UIToPluginMessage): void {
  parent.postMessage({ pluginMessage: message }, '*');
}

/**
 * 获取选中元素的 SVG
 */
export function getSelectionAsSVG(): void {
  postToPlugin({ type: 'get-selection-as-svg' });
}

/**
 * 获取选中元素的图片
 */
export function getSelectionAsImage(): void {
  postToPlugin({ type: 'get-selection-as-image' });
}

/**
 * 插入 SVG 到画布
 */
export function insertSVG(svgCode: string): void {
  postToPlugin({ type: 'insert-svg', svgCode });
}

/**
 * 显示通知
 */
export function notify(message: string, options?: NotificationOptions): void {
  postToPlugin({ type: 'notify', message, options });
}

/**
 * 调整 UI 尺寸
 */
export function resizeUI(width: number, height: number): void {
  postToPlugin({ type: 'resize-ui', width, height });
}

/**
 * 关闭插件
 */
export function closePlugin(): void {
  postToPlugin({ type: 'close' });
}

/**
 * Hook: 获取选中状态
 */
export function useSelection(onSelectionChange?: (hasSelection: boolean, count: number) => void): {
  getAsSVG: () => void;
  getAsImage: () => void;
} {
  const callbackRef = useRef(onSelectionChange);
  callbackRef.current = onSelectionChange;

  usePluginMessage('selection-changed', (msg) => {
    callbackRef.current?.(msg.hasSelection, msg.count);
  });

  const getAsSVG = useCallback(() => {
    getSelectionAsSVG();
  }, []);

  const getAsImage = useCallback(() => {
    getSelectionAsImage();
  }, []);

  return { getAsSVG, getAsImage };
}
