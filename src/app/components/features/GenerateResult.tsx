import { useState } from 'react';
import { Download, Copy, Check, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { insertSVG, notify } from '../../hooks/usePluginMessage';

interface GenerateResultProps {
  result: GenerateResult | null;
  isLoading: boolean;
  error: string | null;
  onRegenerate: () => void;
}

export default function GenerateResult({ result, isLoading, error, onRegenerate }: GenerateResultProps) {
  const [copied, setCopied] = useState(false);

  const handleInsert = () => {
    if (result) {
      insertSVG(result.svgCode);
    }
  };

  const handleCopy = async () => {
    if (result) {
      try {
        await navigator.clipboard.writeText(result.svgCode);
        setCopied(true);
        notify('SVG 代码已复制到剪贴板');
        setTimeout(() => setCopied(false), 2000);
      } catch {
        notify('复制失败', { error: true });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">生成结果</label>
        <Card className="flex flex-col items-center justify-center gap-3 p-8">
          <div className="relative">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
          </div>
          <p className="text-sm text-muted-foreground">正在生成中...</p>
          <p className="text-xs text-muted-foreground">预计需要 5-15 秒</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">生成结果</label>
        <Card className="flex flex-col items-center justify-center gap-3 p-6">
          <div className="rounded-full bg-destructive/10 p-3">
            <RefreshCw className="h-6 w-6 text-destructive" />
          </div>
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" size="sm" onClick={onRegenerate}>
            <RefreshCw className="mr-2 h-4 w-4" />
            重新生成
          </Button>
        </Card>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">生成结果</label>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={handleCopy} title="复制 SVG 代码">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={onRegenerate} title="重新生成">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden p-3">
        {/* SVG 预览 */}
        <div
          className="flex min-h-32 items-center justify-center rounded bg-muted/30 p-4"
          dangerouslySetInnerHTML={{
            __html: result.svgCode.replace(
              /<svg/,
              '<svg style="max-width:100%;max-height:200px;width:auto;height:auto"'
            ),
          }}
        />

        {/* 尺寸信息 */}
        <div className="mt-2 text-center text-xs text-muted-foreground">
          {result.width} x {result.height}
        </div>
      </Card>

      {/* 操作按钮 */}
      <div className="flex gap-2">
        <Button className="flex-1" onClick={handleInsert}>
          <Download className="mr-2 h-4 w-4" />
          插入到画布
        </Button>
      </div>
    </div>
  );
}
