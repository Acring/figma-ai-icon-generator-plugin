import { useState, useCallback } from 'react';
import { ImageIcon, X, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { usePluginMessage, getSelectionAsImage } from '../../hooks/usePluginMessage';

interface SketchPreviewProps {
  sketch: SketchData | null;
  onSketchChange: (sketch: SketchData | null) => void;
}

export default function SketchPreview({ sketch, onSketchChange }: SketchPreviewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 监听图片选择结果
  usePluginMessage(
    'selection-image',
    useCallback(
      (msg) => {
        setIsLoading(false);
        if (msg.error) {
          setError(msg.error);
          return;
        }
        if (msg.imageBase64) {
          onSketchChange({
            imageBase64: msg.imageBase64,
            width: msg.width,
            height: msg.height,
          });
          setError(null);
        }
      },
      [onSketchChange]
    )
  );

  const handleGetSketch = () => {
    setIsLoading(true);
    setError(null);
    getSelectionAsImage();
  };

  const handleClear = () => {
    onSketchChange(null);
    setError(null);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">草图（可选）</label>
        {sketch && (
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={handleClear}>
            <X className="mr-1 h-3 w-3" />
            清除
          </Button>
        )}
      </div>

      {sketch ? (
        <Card className="relative overflow-hidden p-2">
          <img
            src={`data:image/png;base64,${sketch.imageBase64}`}
            alt="草图预览"
            className="max-h-32 w-full rounded object-contain"
          />
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {Math.round(sketch.width)} x {Math.round(sketch.height)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={handleGetSketch}
              disabled={isLoading}
            >
              <RefreshCw className={`mr-1 h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
              更换
            </Button>
          </div>
        </Card>
      ) : (
        <Card
          className="flex cursor-pointer flex-col items-center justify-center gap-2 border-dashed p-6 transition-colors hover:bg-muted/50"
          onClick={handleGetSketch}
        >
          {isLoading ? (
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          ) : (
            <>
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">点击从 Figma 选中获取草图</span>
            </>
          )}
        </Card>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}

      <p className="text-xs text-muted-foreground">选中 Figma 中的草图或线框图，AI 将根据草图的构图生成图标</p>
    </div>
  );
}
