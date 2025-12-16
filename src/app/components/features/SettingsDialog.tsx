import { useState, useEffect } from 'react';
import { Eye, EyeOff, Check, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { validateAPIConfig, DEFAULT_MODEL, PRESET_MODELS } from '../../lib/api';
import { notify } from '../../hooks/usePluginMessage';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiConfig: APIConfig | undefined;
  settings: AppStorageData['settings'];
  onSaveApiConfig: (config: APIConfig | undefined) => void;
  onSaveSettings: (settings: AppStorageData['settings']) => void;
}

const DEFAULT_BASE_URL = 'https://api.anthropic.com/v1/messages';

export default function SettingsDialog({
  open,
  onOpenChange,
  apiConfig,
  settings,
  onSaveApiConfig,
  onSaveSettings,
}: SettingsDialogProps) {
  // API 配置表单
  const [baseUrl, setBaseUrl] = useState(apiConfig?.baseUrl || DEFAULT_BASE_URL);
  const [apiKey, setApiKey] = useState(apiConfig?.apiKey || '');
  const [model, setModel] = useState(apiConfig?.model || DEFAULT_MODEL);
  const [showApiKey, setShowApiKey] = useState(false);

  // 设置表单
  const [defaultWidth, setDefaultWidth] = useState(settings.defaultWidth);
  const [defaultHeight, setDefaultHeight] = useState(settings.defaultHeight);

  // 验证状态
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<'success' | 'error' | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // 当弹窗打开时重置表单
  useEffect(() => {
    if (open) {
      setBaseUrl(apiConfig?.baseUrl || DEFAULT_BASE_URL);
      setApiKey(apiConfig?.apiKey || '');
      setModel(apiConfig?.model || DEFAULT_MODEL);
      setDefaultWidth(settings.defaultWidth);
      setDefaultHeight(settings.defaultHeight);
      setValidationResult(null);
      setValidationError(null);
    }
  }, [open, apiConfig, settings]);

  // 验证 API
  const handleValidate = async () => {
    if (!apiKey.trim()) {
      notify('请输入 API Key', { error: true });
      return;
    }

    setIsValidating(true);
    setValidationResult(null);
    setValidationError(null);

    try {
      const isValid = await validateAPIConfig({
        apiKey: apiKey.trim(),
        baseUrl: baseUrl.trim() || DEFAULT_BASE_URL,
        model: model.trim() || DEFAULT_MODEL,
      });

      if (isValid) {
        setValidationResult('success');
        notify('API 验证成功');
      } else {
        setValidationResult('error');
        setValidationError('API Key 无效');
      }
    } catch (err) {
      setValidationResult('error');
      setValidationError(err instanceof Error ? err.message : '验证失败');
    } finally {
      setIsValidating(false);
    }
  };

  // 保存
  const handleSave = () => {
    // 保存 API 配置
    if (apiKey.trim()) {
      onSaveApiConfig({
        apiKey: apiKey.trim(),
        baseUrl: baseUrl.trim() || DEFAULT_BASE_URL,
        model: model.trim() || DEFAULT_MODEL,
      });
    } else {
      onSaveApiConfig(undefined);
    }

    // 保存设置
    onSaveSettings({
      defaultWidth: defaultWidth || 600,
      defaultHeight: defaultHeight || 400,
    });

    notify('设置已保存');
    onOpenChange(false);
  };

  // 清除 API 配置
  const handleClearApiConfig = () => {
    if (confirm('确定要清除 API 配置吗？')) {
      setApiKey('');
      setBaseUrl(DEFAULT_BASE_URL);
      setModel(DEFAULT_MODEL);
      onSaveApiConfig(undefined);
      setValidationResult(null);
      notify('API 配置已清除');
    }
  };

  // 检查当前模型是否在预设列表中
  const isPresetModel = PRESET_MODELS.some((m) => m.value === model);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>设置</DialogTitle>
          <DialogDescription>配置 Claude API 和默认参数</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* API 配置 */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">API 配置</h3>

            {/* Base URL */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="baseUrl">API Base URL</Label>
              <Input
                id="baseUrl"
                placeholder={DEFAULT_BASE_URL}
                value={baseUrl}
                onChange={(e) => {
                  setBaseUrl(e.target.value);
                  setValidationResult(null);
                }}
              />
              <p className="text-xs text-muted-foreground">需要包含完整路径，如 /v1/messages</p>
            </div>

            {/* API Key */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="apiKey">API Key</Label>
              <div className="relative">
                <Input
                  id="apiKey"
                  type={showApiKey ? 'text' : 'password'}
                  placeholder="sk-ant-..."
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setValidationResult(null);
                  }}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">API Key 仅存储在本地，不会上传到任何服务器</p>
            </div>

            {/* Model */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="model">AI 模型</Label>
              <Select
                value={isPresetModel ? model : 'custom'}
                onValueChange={(value: string) => {
                  if (value === 'custom') {
                    // 选择自定义时，清空 model 让输入框显示
                    setModel('');
                  } else {
                    setModel(value);
                  }
                  setValidationResult(null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择模型" />
                </SelectTrigger>
                <SelectContent>
                  {PRESET_MODELS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">自定义模型</SelectItem>
                </SelectContent>
              </Select>
              {!isPresetModel && (
                <Input
                  id="customModel"
                  placeholder="输入自定义模型名称"
                  value={model}
                  onChange={(e) => {
                    setModel(e.target.value);
                    setValidationResult(null);
                  }}
                />
              )}
              <p className="text-xs text-muted-foreground">选择预设模型或输入自定义模型名称</p>
            </div>

            {/* 验证状态 */}
            {validationResult === 'success' && (
              <div className="flex items-center gap-2 rounded-md bg-green-50 p-2 text-sm text-green-600">
                <Check className="h-4 w-4" />
                API 验证成功
              </div>
            )}
            {validationResult === 'error' && (
              <div className="flex items-center gap-2 rounded-md bg-red-50 p-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {validationError}
              </div>
            )}

            {/* 验证和清除按钮 */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleValidate}
                disabled={!apiKey.trim() || isValidating}
                className="flex-1"
              >
                {isValidating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                验证
              </Button>
              {apiConfig && (
                <Button variant="outline" size="sm" onClick={handleClearApiConfig}>
                  清除
                </Button>
              )}
            </div>
          </div>

          {/* 默认设置 */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">默认设置</h3>

            {/* 默认尺寸 */}
            <div className="flex flex-col gap-2">
              <Label>默认输出尺寸</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="宽度"
                  value={defaultWidth}
                  onChange={(e) => setDefaultWidth(Number(e.target.value) || 600)}
                  className="w-24"
                />
                <span className="text-muted-foreground">×</span>
                <Input
                  type="number"
                  placeholder="高度"
                  value={defaultHeight}
                  onChange={(e) => setDefaultHeight(Number(e.target.value) || 400)}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">px</span>
              </div>
            </div>
          </div>
        </div>

        {/* 保存按钮 */}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave}>保存设置</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
