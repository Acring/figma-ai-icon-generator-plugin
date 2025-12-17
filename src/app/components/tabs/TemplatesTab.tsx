import { useState } from 'react';
import { Plus, Pencil, Trash2, Star, Copy, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { notify } from '../../hooks/usePluginMessage';
import { generateId } from '../../lib/prompts';

interface TemplatesTabProps {
  templates: PromptTemplate[];
  onAdd: (template: PromptTemplate) => void;
  onUpdate: (id: string, updates: Partial<PromptTemplate>) => void;
  onDelete: (id: string) => void;
}

export default function TemplatesTab({ templates, onAdd, onUpdate, onDelete }: TemplatesTabProps) {
  // 添加/编辑弹窗状态
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);

  // 表单状态
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [template, setTemplate] = useState('');

  // 复制状态
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 预设模板
  const presetTemplates = templates.filter((t) => t.isPreset);
  // 自定义模板
  const customTemplates = templates.filter((t) => !t.isPreset);

  // 打开添加弹窗
  const handleOpenAdd = () => {
    setEditingTemplate(null);
    setName('');
    setDescription('');
    setTemplate('');
    setDialogOpen(true);
  };

  // 打开编辑弹窗
  const handleOpenEdit = (t: PromptTemplate) => {
    setEditingTemplate(t);
    setName(t.name);
    setDescription(t.description || '');
    setTemplate(t.template);
    setDialogOpen(true);
  };

  // 复制模板
  const handleCopy = async (t: PromptTemplate) => {
    try {
      await navigator.clipboard.writeText(t.template);
      setCopiedId(t.id);
      notify('模板已复制');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      notify('复制失败', { error: true });
    }
  };

  // 基于预设创建自定义模板
  const handleDuplicate = (t: PromptTemplate) => {
    setEditingTemplate(null);
    setName(`${t.name} (副本)`);
    setDescription(t.description || '');
    setTemplate(t.template);
    setDialogOpen(true);
  };

  // 保存
  const handleSave = () => {
    if (!name.trim() || !template.trim()) {
      notify('请填写名称和模板内容', { error: true });
      return;
    }

    if (editingTemplate) {
      // 编辑模式
      onUpdate(editingTemplate.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        template: template.trim(),
      });
      notify('模板已更新');
    } else {
      // 添加模式
      const newTemplate: PromptTemplate = {
        id: generateId(),
        name: name.trim(),
        description: description.trim() || undefined,
        template: template.trim(),
        isPreset: false,
        createdAt: Date.now(),
      };
      onAdd(newTemplate);
      notify('模板已添加');
    }

    setDialogOpen(false);
  };

  // 删除确认
  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个模板吗？')) {
      onDelete(id);
      notify('模板已删除');
    }
  };

  const renderTemplateCard = (t: PromptTemplate, isPreset: boolean) => (
    <Card key={t.id} className="group relative p-3 transition-all hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            {isPreset && <Star className="h-3 w-3 flex-shrink-0 fill-amber-400 text-amber-400" />}
            <h3 className="truncate text-sm font-medium">{t.name}</h3>
          </div>
          {t.description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{t.description}</p>}
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(t)} title="复制模板内容">
            {copiedId === t.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
          {isPreset ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => handleDuplicate(t)}
              title="基于此创建"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenEdit(t)} title="编辑">
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(t.id)} title="删除">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 模板预览 */}
      <div className="mt-2 rounded bg-muted/50 p-2">
        <p className="line-clamp-2 text-xs text-muted-foreground">{t.template}</p>
      </div>
    </Card>
  );

  return (
    <div className="flex flex-col gap-4">
      {/* 标题和添加按钮 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium">提示词模板</h2>
          <p className="text-xs text-muted-foreground">快速应用常用的提示词</p>
        </div>
        <Button size="sm" onClick={handleOpenAdd}>
          <Plus className="mr-1 h-4 w-4" />
          添加模板
        </Button>
      </div>

      {/* 预设模板 */}
      <div className="flex flex-col gap-2">
        <h3 className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          预设模板
        </h3>
        <div className="flex flex-col gap-2">{presetTemplates.map((t) => renderTemplateCard(t, true))}</div>
      </div>

      {/* 自定义模板 */}
      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-medium text-muted-foreground">自定义模板</h3>
        {customTemplates.length === 0 ? (
          <Card className="flex flex-col items-center justify-center gap-2 border-dashed p-6">
            <p className="text-sm text-muted-foreground">还没有自定义模板</p>
            <Button variant="outline" size="sm" onClick={handleOpenAdd}>
              创建模板
            </Button>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">{customTemplates.map((t) => renderTemplateCard(t, false))}</div>
        )}
      </div>

      {/* 添加/编辑弹窗 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? '编辑模板' : '添加提示词模板'}</DialogTitle>
            <DialogDescription>使用 {'{theme}'} 作为主题占位符</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {/* 名称 */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="templateName">名称</Label>
              <Input
                id="templateName"
                placeholder="例如：3D 立体图标"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* 描述 */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="templateDesc">描述（可选）</Label>
              <Input
                id="templateDesc"
                placeholder="简单描述模板的用途"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* 模板内容 */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="templateContent">模板内容</Label>
              <Textarea
                id="templateContent"
                placeholder='例如：生成一个 3D 立体风格的图标，主题是"{theme}"，有阴影和深度感'
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">提示：使用 {'{theme}'} 作为主题占位符，生成时会自动替换</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave} disabled={!name.trim() || !template.trim()}>
              {editingTemplate ? '保存' : '添加'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
