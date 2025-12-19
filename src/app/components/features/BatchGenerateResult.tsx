import { useState } from 'react';
import { Download, Copy, Check, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { insertSVG, notify } from '../../hooks/usePluginMessage';

interface BatchResultItem {
  theme: string;
  result: GenerateResult;
}

interface BatchGenerateResultProps {
  results: BatchResultItem[];
  isLoading: boolean;
  generatingIndex: number;
  totalCount: number;
  error: string | null;
  onRegenerate: () => void;
}

export default function BatchGenerateResult({
  results,
  isLoading,
  generatingIndex,
  totalCount,
  error,
  onRegenerate,
}: BatchGenerateResultProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleInsert = (svgCode: string) => {
    insertSVG(svgCode);
  };

  const handleInsertAll = () => {
    results.forEach(({ result }) => {
      insertSVG(result.svgCode);
    });
    notify(`已插入 ${results.length} 个图标到画布`);
  };

  const handleCopy = async (svgCode: string, index: number) => {
    try {
      await navigator.clipboard.writeText(svgCode);
      setCopiedIndex(index);
      notify('SVG 代码已复制到剪贴板');
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      notify('复制失败', { error: true });
    }
  };

  // 正在加载且还没有结果
  if (isLoading && results.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">批量生成结果</label>
        <Card className="flex flex-col items-center justify-center gap-3 p-8">
          <div className="relative">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
          </div>
          <p className="text-sm text-muted-foreground">
            正在生成第 {generatingIndex + 1}/{totalCount} 个...
          </p>
          <p className="text-xs text-muted-foreground">每个图标预计需要 5-15 秒</p>
        </Card>
      </div>
    );
  }

  // 有错误且没有结果
  if (error && results.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">批量生成结果</label>
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

  // 没有结果
  if (results.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          批量生成结果
          {isLoading && (
            <span className="ml-2 text-xs text-muted-foreground">
              ({generatingIndex + 1}/{totalCount})
            </span>
          )}
        </label>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={onRegenerate} title="重新生成">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* 结果网格 */}
      <div className="grid grid-cols-2 gap-2">
        {results.map(({ theme, result }, index) => (
          <Card key={index} className="overflow-hidden p-2">
            {/* SVG 预览 */}
            <div
              className="flex h-24 items-center justify-center rounded bg-muted/30 p-2"
              dangerouslySetInnerHTML={{
                __html: result.svgCode.replace(
                  /<svg/,
                  '<svg style="max-width:100%;max-height:100%;width:auto;height:auto"'
                ),
              }}
            />
            {/* 主题名称 */}
            <p className="mt-1 truncate text-center text-xs text-muted-foreground" title={theme}>
              {theme}
            </p>
            {/* 操作按钮 */}
            <div className="mt-1 flex justify-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2"
                onClick={() => handleCopy(result.svgCode, index)}
                title="复制 SVG"
              >
                {copiedIndex === index ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2"
                onClick={() => handleInsert(result.svgCode)}
                title="插入到画布"
              >
                <Download className="h-3 w-3" />
              </Button>
            </div>
          </Card>
        ))}

        {/* 正在生成的占位符 */}
        {isLoading && (
          <Card className="flex h-24 items-center justify-center p-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
          </Card>
        )}
      </div>

      {/* 全部插入按钮 */}
      {results.length > 0 && !isLoading && (
        <Button className="w-full" onClick={handleInsertAll}>
          <Download className="mr-2 h-4 w-4" />
          全部插入到画布 ({results.length} 个)
        </Button>
      )}
    </div>
  );
}
