import { useEffect, useCallback, useRef } from 'react';
import { postToPlugin, usePluginMessage } from './usePluginMessage';

/**
 * 加载存储数据
 */
export function loadStorage(key: StorageKey): void {
  postToPlugin({ type: 'load-storage', key });
}

/**
 * 加载所有存储数据
 */
export function loadAllStorage(): void {
  postToPlugin({ type: 'load-all-storage' });
}

/**
 * 保存存储数据
 */
export function saveStorage<K extends StorageKey>(key: K, value: AppStorageData[K]): void {
  postToPlugin({ type: 'save-storage', key, value });
}

/**
 * Hook: 使用单个存储项
 */
export function useStorageItem<K extends StorageKey>(
  key: K,
  onLoaded?: (value: AppStorageData[K]) => void
): {
  load: () => void;
  save: (value: AppStorageData[K]) => void;
} {
  const callbackRef = useRef(onLoaded);
  callbackRef.current = onLoaded;

  usePluginMessage('storage-loaded', (msg) => {
    if (msg.key === key) {
      callbackRef.current?.(msg.value as AppStorageData[K]);
    }
  });

  const load = useCallback(() => {
    loadStorage(key);
  }, [key]);

  const save = useCallback(
    (value: AppStorageData[K]) => {
      saveStorage(key, value);
    },
    [key]
  );

  return { load, save };
}

/**
 * Hook: 使用所有存储数据
 */
export function useAllStorage(onLoaded?: (data: Partial<AppStorageData>) => void): {
  load: () => void;
  save: <K extends StorageKey>(key: K, value: AppStorageData[K]) => void;
} {
  const callbackRef = useRef(onLoaded);
  callbackRef.current = onLoaded;

  usePluginMessage('all-storage-loaded', (msg) => {
    callbackRef.current?.(msg.data);
  });

  const load = useCallback(() => {
    loadAllStorage();
  }, []);

  const save = useCallback(<K extends StorageKey>(key: K, value: AppStorageData[K]) => {
    saveStorage(key, value);
  }, []);

  return { load, save };
}

/**
 * Hook: 初始化时加载所有数据
 */
export function useInitStorage(onLoaded: (data: Partial<AppStorageData>) => void): void {
  const onLoadedRef = useRef(onLoaded);
  onLoadedRef.current = onLoaded;
  const loadedRef = useRef(false);

  usePluginMessage('all-storage-loaded', (msg) => {
    if (!loadedRef.current) {
      loadedRef.current = true;
      onLoadedRef.current(msg.data);
    }
  });

  useEffect(() => {
    loadAllStorage();
  }, []);
}
