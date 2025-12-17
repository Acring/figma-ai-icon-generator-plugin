import { useState } from 'react';
import { Trash2, Download, Clock, ImageIcon, Copy, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { insertSVG, notify } from '../../hooks/usePluginMessage';

interface HistoryTabProps {
  history: HistoryRecord[];
  onDelete: (id: string) => void;
  onClear: () => void;
}

export default function HistoryTab({ history, onDelete, onClear }: HistoryTabProps) {
  // 详情弹窗
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);
  const [copied, setCopied] = useState(false);

  // 格式化日期
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins} 分钟前`;
    if (diffHours < 24) return `${diffHours} 小时前`;
    if (diffDays < 7) return `${diffDays} 天前`;
    return date.toLocaleDateString();
  };

  // 插入到画布
  const handleInsert = (record: HistoryRecord) => {
    insertSVG(record.result.svgCode);
    setSelectedRecord(null);
  };

  // 复制 SVG
  const handleCopy = async (record: HistoryRecord) => {
    try {
      await navigator.clipboard.writeText(record.result.svgCode);
      setCopied(true);
      notify('SVG 代码已复制');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      notify('复制失败', { error: true });
    }
  };

  // 删除确认
  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条记录吗？')) {
      onDelete(id);
      notify('记录已删除');
    }
  };

  // 清空确认
  const handleClear = () => {
    if (confirm('确定要清空所有历史记录吗？此操作不可恢复。')) {
      onClear();
      notify('历史记录已清空');
    }
  };

  return (
    <div className="space-y-4">
      {/* 标题和清空按钮 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium">生成历史</h2>
          <p className="text-xs text-muted-foreground">共 {history.length} 条记录</p>
        </div>
        {history.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleClear}>
            <Trash2 className="mr-1 h-4 w-4" />
            清空
          </Button>
        )}
      </div>

      {/* 历史列表 */}
      {history.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 p-8">
          <div className="rounded-full bg-muted p-3">
            <Clock className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">还没有生成记录</p>
            <p className="text-xs text-muted-foreground">生成的图标会自动保存到这里</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {history.map((record) => (
            <Card
              key={record.id}
              className="group cursor-pointer p-3 transition-all hover:shadow-md"
              onClick={() => setSelectedRecord(record)}
            >
              <div className="flex gap-3">
                {/* SVG 缩略图 */}
                <div
                  className="h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-muted/30"
                  dangerouslySetInnerHTML={{
                    __html: record.result.svgCode.replace(
                      /<svg/,
                      '<svg style="width:100%;height:100%;object-fit:contain"'
                    ),
                  }}
                />

                {/* 信息 */}
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-medium">{record.request.theme}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      {record.result.width} × {record.result.height}
                    </span>
                    {record.request.sketch && (
                      <span className="flex items-center gap-0.5">
                        <ImageIcon className="h-3 w-3" />
                        有草图
                      </span>
                    )}
                    {record.request.styleRefs.length > 0 && <span>{record.request.styleRefs.length} 个参考</span>}
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDate(record.createdAt)}
                  </p>
                </div>

                {/* 操作按钮 */}
                <div className="flex flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInsert(record);
                    }}
                    title="插入到画布"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(record.id);
                    }}
                    title="删除"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* 详情弹窗 */}
      <Dialog open={!!selectedRecord} onOpenChange={(open) => !open && setSelectedRecord(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>生成详情</DialogTitle>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-4">
              {/* SVG 预览 */}
              <Card className="p-3">
                <div
                  className="flex aspect-video items-center justify-center overflow-hidden rounded bg-muted/30"
                  dangerouslySetInnerHTML={{
                    __html: selectedRecord.result.svgCode.replace(
                      /<svg/,
                      '<svg style="max-width:100%;max-height:150px;width:auto;height:auto"'
                    ),
                  }}
                />
              </Card>

              {/* 详情信息 */}
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">主题</span>
                  <span className="font-medium">{selectedRecord.request.theme}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">尺寸</span>
                  <span>
                    {selectedRecord.result.width} × {selectedRecord.result.height}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">草图</span>
                  <span>{selectedRecord.request.sketch ? '有' : '无'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">参考数量</span>
                  <span>{selectedRecord.request.styleRefs.length} 个</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">生成时间</span>
                  <span>{new Date(selectedRecord.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* 自定义提示词 */}
              {selectedRecord.request.customPrompt && (
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">其他要求</span>
                  <p className="rounded bg-muted/50 p-2 text-sm">{selectedRecord.request.customPrompt}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => selectedRecord && handleCopy(selectedRecord)}>
              {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              复制 SVG
            </Button>
            <Button onClick={() => selectedRecord && handleInsert(selectedRecord)}>
              <Download className="mr-2 h-4 w-4" />
              插入画布
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
