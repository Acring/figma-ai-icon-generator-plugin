import '../styles/ui.css';
import { useState, useCallback, useEffect } from 'react';
import { Settings, Sparkles, Library, FileText, History, GripHorizontal } from 'lucide-react';
import { Button } from './ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { useInitStorage } from '../hooks/useStorage';
import { saveStorage } from '../hooks/useStorage';
import { PRESET_TEMPLATES } from '../lib/prompts';

// Tab 组件
import GenerateTab from './tabs/GenerateTab';
import LibraryTab from './tabs/LibraryTab';
import TemplatesTab from './tabs/TemplatesTab';
import HistoryTab from './tabs/HistoryTab';
import SettingsDialog from './features/SettingsDialog';

export default function App() {
  // ==================== 状态管理 ====================

  // 当前选中的标签页
  const [activeTab, setActiveTab] = useState('generate');

  // 设置弹窗状态
  const [settingsOpen, setSettingsOpen] = useState(false);

  // API 配置
  const [apiConfig, setApiConfig] = useState<APIConfig | undefined>(undefined);

  // 风格参考库
  const [styleRefs, setStyleRefs] = useState<StyleReference[]>([]);

  // 提示词模板
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);

  // 历史记录
  const [history, setHistory] = useState<HistoryRecord[]>([]);

  // 默认设置
  const [settings, setSettings] = useState<AppStorageData['settings']>({
    defaultWidth: 600,
    defaultHeight: 400,
  });

  // 数据加载状态
  const [isLoaded, setIsLoaded] = useState(false);

  // 拖拽调整大小相关
  const [isResizing, setIsResizing] = useState(false);

  // 处理拖拽调整大小
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(300, e.clientX);
      const newHeight = Math.max(400, e.clientY);
      parent.postMessage({ pluginMessage: { type: 'resize-ui', width: newWidth, height: newHeight } }, '*');
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // ==================== 初始化存储数据 ====================

  useInitStorage(
    useCallback((data: Partial<AppStorageData>) => {
      if (data.apiConfig) setApiConfig(data.apiConfig);
      if (data.styleRefs) setStyleRefs(data.styleRefs);
      if (data.templates) {
        // 合并预设模板和自定义模板
        const customTemplates = data.templates.filter((t) => !t.isPreset);
        setTemplates([...PRESET_TEMPLATES, ...customTemplates]);
      } else {
        setTemplates(PRESET_TEMPLATES);
      }
      if (data.history) setHistory(data.history);
      if (data.settings) setSettings(data.settings);
      setIsLoaded(true);
    }, [])
  );

  // ==================== 数据操作函数 ====================

  // 保存 API 配置
  const handleSaveApiConfig = useCallback((config: APIConfig | undefined) => {
    setApiConfig(config);
    saveStorage('apiConfig', config);
  }, []);

  // 保存设置
  const handleSaveSettings = useCallback((newSettings: AppStorageData['settings']) => {
    setSettings(newSettings);
    saveStorage('settings', newSettings);
  }, []);

  // 添加风格参考
  const handleAddStyleRef = useCallback((ref: StyleReference) => {
    setStyleRefs((prev) => {
      const newRefs = [...prev, ref];
      saveStorage('styleRefs', newRefs);
      return newRefs;
    });
  }, []);

  // 更新风格参考
  const handleUpdateStyleRef = useCallback((id: string, updates: Partial<StyleReference>) => {
    setStyleRefs((prev) => {
      const newRefs = prev.map((ref) => (ref.id === id ? { ...ref, ...updates, updatedAt: Date.now() } : ref));
      saveStorage('styleRefs', newRefs);
      return newRefs;
    });
  }, []);

  // 删除风格参考
  const handleDeleteStyleRef = useCallback((id: string) => {
    setStyleRefs((prev) => {
      const newRefs = prev.filter((ref) => ref.id !== id);
      saveStorage('styleRefs', newRefs);
      return newRefs;
    });
  }, []);

  // 添加模板
  const handleAddTemplate = useCallback((template: PromptTemplate) => {
    setTemplates((prev) => {
      const newTemplates = [...prev, template];
      // 只保存自定义模板
      const customTemplates = newTemplates.filter((t) => !t.isPreset);
      saveStorage('templates', customTemplates);
      return newTemplates;
    });
  }, []);

  // 更新模板
  const handleUpdateTemplate = useCallback((id: string, updates: Partial<PromptTemplate>) => {
    setTemplates((prev) => {
      const newTemplates = prev.map((t) => (t.id === id ? { ...t, ...updates } : t));
      const customTemplates = newTemplates.filter((t) => !t.isPreset);
      saveStorage('templates', customTemplates);
      return newTemplates;
    });
  }, []);

  // 删除模板
  const handleDeleteTemplate = useCallback((id: string) => {
    setTemplates((prev) => {
      const newTemplates = prev.filter((t) => t.id !== id);
      const customTemplates = newTemplates.filter((t) => !t.isPreset);
      saveStorage('templates', customTemplates);
      return newTemplates;
    });
  }, []);

  // 添加历史记录
  const handleAddHistory = useCallback((record: HistoryRecord) => {
    setHistory((prev) => {
      // 最多保存 50 条历史记录
      const newHistory = [record, ...prev].slice(0, 50);
      saveStorage('history', newHistory);
      return newHistory;
    });
  }, []);

  // 删除历史记录
  const handleDeleteHistory = useCallback((id: string) => {
    setHistory((prev) => {
      const newHistory = prev.filter((h) => h.id !== id);
      saveStorage('history', newHistory);
      return newHistory;
    });
  }, []);

  // 清空历史记录
  const handleClearHistory = useCallback(() => {
    setHistory([]);
    saveStorage('history', []);
  }, []);

  // ==================== 渲染 ====================

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-sm text-muted-foreground">加载中...</div>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen flex-col overflow-auto">
      {/* Header */}
      <header className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h1 className="text-base font-semibold">AI Icon Generator</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)}>
          <Settings className="h-4 w-4" />
        </Button>
      </header>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-1 flex-col">
        <TabsList className="mx-4 mt-3 grid w-auto grid-cols-4">
          <TabsTrigger value="generate" className="gap-1 text-xs">
            <Sparkles className="h-3.5 w-3.5" />
            生成
          </TabsTrigger>
          <TabsTrigger value="library" className="gap-1 text-xs">
            <Library className="h-3.5 w-3.5" />
            参考库
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-1 text-xs">
            <FileText className="h-3.5 w-3.5" />
            模板
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1 text-xs">
            <History className="h-3.5 w-3.5" />
            历史
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <TabsContent value="generate" className="mt-0 p-4">
            <GenerateTab
              apiConfig={apiConfig}
              styleRefs={styleRefs}
              templates={templates}
              settings={settings}
              onAddHistory={handleAddHistory}
              onOpenSettings={() => setSettingsOpen(true)}
              onGoToLibrary={() => setActiveTab('library')}
            />
          </TabsContent>

          <TabsContent value="library" className="mt-0 p-4">
            <LibraryTab
              styleRefs={styleRefs}
              onAdd={handleAddStyleRef}
              onUpdate={handleUpdateStyleRef}
              onDelete={handleDeleteStyleRef}
            />
          </TabsContent>

          <TabsContent value="templates" className="mt-0 p-4">
            <TemplatesTab
              templates={templates}
              onAdd={handleAddTemplate}
              onUpdate={handleUpdateTemplate}
              onDelete={handleDeleteTemplate}
            />
          </TabsContent>

          <TabsContent value="history" className="mt-0 p-4">
            <HistoryTab history={history} onDelete={handleDeleteHistory} onClear={handleClearHistory} />
          </TabsContent>
        </ScrollArea>
      </Tabs>

      {/* Settings Dialog */}
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        apiConfig={apiConfig}
        settings={settings}
        onSaveApiConfig={handleSaveApiConfig}
        onSaveSettings={handleSaveSettings}
      />

      {/* Resizer - 拖拽调整窗口大小 */}
      <div
        className="fixed bottom-0 right-0 flex h-4 w-4 cursor-nwse-resize items-center justify-center text-muted-foreground/50 hover:text-muted-foreground"
        onMouseDown={(e) => {
          e.preventDefault();
          setIsResizing(true);
        }}
      >
        <GripHorizontal className="h-3 w-3 rotate-[-45deg]" />
      </div>
    </div>
  );
}
