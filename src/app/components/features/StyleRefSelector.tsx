import { Check, Plus } from 'lucide-react';
import { Card } from '../ui/card';

interface StyleRefSelectorProps {
  styleRefs: StyleReference[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onGoToLibrary?: () => void;
}

export default function StyleRefSelector({
  styleRefs,
  selectedIds,
  onSelectionChange,
  onGoToLibrary,
}: StyleRefSelectorProps) {
  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((i) => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">风格参考</label>
        {selectedIds.length > 0 && <span className="text-xs text-muted-foreground">已选 {selectedIds.length} 个</span>}
      </div>

      {styleRefs.length === 0 ? (
        <Card
          className="flex cursor-pointer flex-col items-center justify-center gap-2 border-dashed p-6 transition-colors hover:bg-muted/50"
          onClick={onGoToLibrary}
        >
          <Plus className="h-6 w-6 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">去参考库添加风格参考</span>
        </Card>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {styleRefs.map((ref) => {
            const isSelected = selectedIds.includes(ref.id);
            return (
              <Card
                key={ref.id}
                className={`relative cursor-pointer overflow-hidden p-1.5 transition-all ${
                  isSelected ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
                }`}
                onClick={() => toggleSelection(ref.id)}
                title={ref.name}
              >
                {/* SVG 预览 */}
                <div
                  className="aspect-square w-full overflow-hidden rounded bg-muted/30"
                  dangerouslySetInnerHTML={{
                    __html: ref.svgCode.replace(/<svg/, '<svg style="width:100%;height:100%;object-fit:contain"'),
                  }}
                />

                {/* 选中标记 */}
                {isSelected && (
                  <div className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}

                {/* 名称 */}
                <p className="mt-1 truncate text-center text-[10px] text-muted-foreground">{ref.name}</p>
              </Card>
            );
          })}

          {/* 添加更多按钮 */}
          <Card
            className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 border-dashed transition-colors hover:bg-muted/50"
            onClick={onGoToLibrary}
          >
            <Plus className="h-5 w-5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">添加</span>
          </Card>
        </div>
      )}

      <p className="text-xs text-muted-foreground">选择参考图标，AI 将学习其配色、渐变、描边等风格</p>
    </div>
  );
}
