import { useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { usePluginMessage, getSelectionAsSVG, notify } from '../../hooks/usePluginMessage';
import { generateId } from '../../lib/prompts';

interface LibraryTabProps {
  styleRefs: StyleReference[];
  onAdd: (ref: StyleReference) => void;
  onUpdate: (id: string, updates: Partial<StyleReference>) => void;
  onDelete: (id: string) => void;
}

export default function LibraryTab({ styleRefs, onAdd, onUpdate, onDelete }: LibraryTabProps) {
  // 添加/编辑弹窗状态
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRef, setEditingRef] = useState<StyleReference | null>(null);

  // 表单状态
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [svgCode, setSvgCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 详情预览弹窗
  const [previewRef, setPreviewRef] = useState<StyleReference | null>(null);

  // 监听 SVG 选择结果
  usePluginMessage(
    'selection-svg',
    useCallback((msg) => {
      setIsLoading(false);
      if (msg.error) {
        notify(msg.error, { error: true });
        return;
      }
      if (msg.svgCode) {
        setSvgCode(msg.svgCode);
      }
    }, [])
  );

  // 打开添加弹窗
  const handleOpenAdd = () => {
    setEditingRef(null);
    setName('');
    setDescription('');
    setSvgCode('');
    setDialogOpen(true);
  };

  // 打开编辑弹窗
  const handleOpenEdit = (ref: StyleReference) => {
    setEditingRef(ref);
    setName(ref.name);
    setDescription(ref.description || '');
    setSvgCode(ref.svgCode);
    setDialogOpen(true);
  };

  // 从 Figma 选中获取 SVG
  const handleGetFromSelection = () => {
    setIsLoading(true);
    getSelectionAsSVG();
  };

  // 保存
  const handleSave = () => {
    if (!name.trim() || !svgCode.trim()) {
      notify('请填写名称并获取 SVG', { error: true });
      return;
    }

    if (editingRef) {
      // 编辑模式
      onUpdate(editingRef.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        svgCode: svgCode.trim(),
      });
      notify('参考已更新');
    } else {
      // 添加模式
      const newRef: StyleReference = {
        id: generateId(),
        name: name.trim(),
        description: description.trim() || undefined,
        svgCode: svgCode.trim(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      onAdd(newRef);
      notify('参考已添加');
    }

    setDialogOpen(false);
  };

  // 删除确认
  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个风格参考吗？')) {
      onDelete(id);
      notify('参考已删除');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 标题和添加按钮 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium">风格参考库</h2>
          <p className="text-xs text-muted-foreground">共 {styleRefs.length} 个参考</p>
        </div>
        <Button size="sm" onClick={handleOpenAdd}>
          <Plus className="mr-1 h-4 w-4" />
          添加参考
        </Button>
      </div>

      {/* 参考列表 */}
      {styleRefs.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 p-8">
          <div className="rounded-full bg-muted p-3">
            <Plus className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">还没有风格参考</p>
            <p className="text-xs text-muted-foreground">选中 Figma 中的图标，添加到参考库</p>
          </div>
          <Button size="sm" onClick={handleOpenAdd}>
            添加第一个参考
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {styleRefs.map((ref) => (
            <Card
              key={ref.id}
              className="group relative cursor-pointer overflow-hidden p-2 transition-all hover:shadow-md"
              onClick={() => setPreviewRef(ref)}
            >
              {/* SVG 预览 */}
              <div
                className="aspect-square w-full overflow-hidden rounded bg-muted/30"
                dangerouslySetInnerHTML={{
                  __html: ref.svgCode.replace(/<svg/, '<svg style="width:100%;height:100%;object-fit:contain"'),
                }}
              />

              {/* 名称 */}
              <p className="mt-2 truncate text-center text-xs font-medium">{ref.name}</p>

              {/* 操作按钮 */}
              <div className="absolute right-1 top-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenEdit(ref);
                  }}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(ref.id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* 添加/编辑弹窗 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editingRef ? '编辑参考' : '添加风格参考'}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {/* SVG 预览/获取 */}
            <div className="flex flex-col gap-2">
              <Label>SVG 内容</Label>
              {svgCode ? (
                <div className="flex flex-col gap-2">
                  <Card className="p-2">
                    <div
                      className="flex aspect-video items-center justify-center overflow-hidden rounded bg-muted/30"
                      dangerouslySetInnerHTML={{
                        __html: svgCode.replace(
                          /<svg/,
                          '<svg style="max-width:100%;max-height:120px;width:auto;height:auto"'
                        ),
                      }}
                    />
                  </Card>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={handleGetFromSelection}
                    disabled={isLoading}
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    从选中重新获取
                  </Button>
                </div>
              ) : (
                <Card
                  className="flex cursor-pointer flex-col items-center justify-center gap-2 border-dashed p-6 transition-colors hover:bg-muted/50"
                  onClick={handleGetFromSelection}
                >
                  {isLoading ? (
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      <Plus className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">点击从 Figma 选中获取</span>
                    </>
                  )}
                </Card>
              )}
            </div>

            {/* 名称 */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="refName">名称</Label>
              <Input
                id="refName"
                placeholder="例如：科技风渐变图标"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* 描述 */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="refDesc">描述（可选）</Label>
              <Textarea
                id="refDesc"
                placeholder="描述这个参考的风格特点..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave} disabled={!name.trim() || !svgCode.trim()}>
              {editingRef ? '保存' : '添加'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 预览弹窗 */}
      <Dialog open={!!previewRef} onOpenChange={(open) => !open && setPreviewRef(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{previewRef?.name}</DialogTitle>
          </DialogHeader>

          {previewRef && (
            <div className="flex flex-col gap-4">
              {/* SVG 大预览 */}
              <Card className="p-4">
                <div
                  className="flex aspect-square items-center justify-center overflow-hidden rounded bg-muted/30"
                  dangerouslySetInnerHTML={{
                    __html: previewRef.svgCode.replace(
                      /<svg/,
                      '<svg style="max-width:100%;max-height:200px;width:auto;height:auto"'
                    ),
                  }}
                />
              </Card>

              {/* 描述 */}
              {previewRef.description && <p className="text-sm text-muted-foreground">{previewRef.description}</p>}

              {/* 时间 */}
              <p className="text-xs text-muted-foreground">添加于 {new Date(previewRef.createdAt).toLocaleString()}</p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (previewRef) {
                  handleOpenEdit(previewRef);
                  setPreviewRef(null);
                }
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              编辑
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (previewRef) {
                  handleDelete(previewRef.id);
                  setPreviewRef(null);
                }
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
