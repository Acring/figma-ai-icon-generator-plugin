import { useState, useCallback } from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import SketchPreview from '../features/SketchPreview';
import StyleRefSelector from '../features/StyleRefSelector';
import GenerateResult from '../features/GenerateResult';
import { generateIcon } from '../../lib/api';
import { buildPrompt, applyTemplate, generateId } from '../../lib/prompts';

interface GenerateTabProps {
  apiConfig: APIConfig | undefined;
  styleRefs: StyleReference[];
  templates: PromptTemplate[];
  settings: AppStorageData['settings'];
  onAddHistory: (record: HistoryRecord) => void;
  onOpenSettings: () => void;
}

export default function GenerateTab({
  apiConfig,
  styleRefs,
  templates,
  settings,
  onAddHistory,
  onOpenSettings,
}: GenerateTabProps) {
  // 草图
  const [sketch, setSketch] = useState<SketchData | null>(null);

  // 选中的风格参考 ID
  const [selectedRefIds, setSelectedRefIds] = useState<string[]>([]);

  // 主题描述
  const [theme, setTheme] = useState('');

  // 自定义提示词
  const [customPrompt, setCustomPrompt] = useState('');

  // 输出尺寸
  const [outputWidth, setOutputWidth] = useState(settings.defaultWidth);
  const [outputHeight, setOutputHeight] = useState(settings.defaultHeight);

  // 选中的模板
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  // 生成状态
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 获取选中的风格参考
  const selectedRefs = styleRefs.filter((ref) => selectedRefIds.includes(ref.id));

  // 检查是否可以生成
  const canGenerate = apiConfig && theme.trim() && !isGenerating;

  // 应用模板
  const handleApplyTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (templateId) {
      const template = templates.find((t) => t.id === templateId);
      if (template && theme) {
        setCustomPrompt(applyTemplate(template, theme));
      } else if (template) {
        setCustomPrompt(template.template);
      }
    }
  };

  // 生成图标
  const handleGenerate = useCallback(async () => {
    if (!apiConfig || !theme.trim()) return;

    setIsGenerating(true);
    setError(null);
    setResult(null);

    const request: GenerateRequest = {
      sketch: sketch || undefined,
      styleRefs: selectedRefs,
      theme: theme.trim(),
      customPrompt: customPrompt.trim() || undefined,
      outputWidth,
      outputHeight,
    };

    try {
      const generateResult = await generateIcon(apiConfig, request, buildPrompt);
      setResult(generateResult);

      // 保存到历史记录
      onAddHistory({
        id: generateId(),
        request,
        result: generateResult,
        createdAt: Date.now(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  }, [apiConfig, theme, sketch, selectedRefs, customPrompt, outputWidth, outputHeight, onAddHistory]);

  // 没有配置 API Key 时显示提示
  if (!apiConfig) {
    return (
      <Card className="flex flex-col items-center justify-center gap-4 p-8">
        <div className="rounded-full bg-muted p-3">
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="text-center">
          <h3 className="font-medium">请先配置 API Key</h3>
          <p className="mt-1 text-sm text-muted-foreground">需要 Claude API Key 才能使用生成功能</p>
        </div>
        <Button onClick={onOpenSettings}>前往设置</Button>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 草图预览 */}
      <SketchPreview sketch={sketch} onSketchChange={setSketch} />

      {/* 风格参考选择 */}
      <StyleRefSelector styleRefs={styleRefs} selectedIds={selectedRefIds} onSelectionChange={setSelectedRefIds} />

      {/* 主题描述 */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="theme">主题描述</Label>
        <Input
          id="theme"
          placeholder="例如：数据库集群、云服务器、安全盾牌..."
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
        />
      </div>

      {/* 提示词模板 */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="template">提示词模板（可选）</Label>
        <select
          id="template"
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={selectedTemplateId}
          onChange={(e) => handleApplyTemplate(e.target.value)}
        >
          <option value="">不使用模板</option>
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
              {template.isPreset ? '' : ' (自定义)'}
            </option>
          ))}
        </select>
      </div>

      {/* 自定义提示词 */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="customPrompt">其他要求（可选）</Label>
        <Textarea
          id="customPrompt"
          placeholder="输入额外的生成要求..."
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          rows={2}
        />
      </div>

      {/* 输出尺寸 */}
      <div className="flex flex-col gap-2">
        <Label>输出尺寸</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="宽度"
            value={outputWidth}
            onChange={(e) => setOutputWidth(Number(e.target.value) || settings.defaultWidth)}
            className="w-24"
          />
          <span className="text-muted-foreground">×</span>
          <Input
            type="number"
            placeholder="高度"
            value={outputHeight}
            onChange={(e) => setOutputHeight(Number(e.target.value) || settings.defaultHeight)}
            className="w-24"
          />
          <span className="text-sm text-muted-foreground">px</span>
        </div>
      </div>

      {/* 生成按钮 */}
      <Button className="w-full" size="lg" disabled={!canGenerate} onClick={handleGenerate}>
        <Sparkles className="mr-2 h-4 w-4" />
        {isGenerating ? '生成中...' : '生成图标'}
      </Button>

      {/* 生成结果 */}
      <GenerateResult result={result} isLoading={isGenerating} error={error} onRegenerate={handleGenerate} />
    </div>
  );
}
