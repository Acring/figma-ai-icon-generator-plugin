// ==================== 提示词工程 ====================

/**
 * 构建生成提示词
 */
export function buildPrompt(request: GenerateRequest): string {
  const { styleRefs, theme, customPrompt, outputWidth, outputHeight } = request;

  let prompt = '';

  // 添加风格参考
  if (styleRefs.length > 0) {
    prompt += '参考以下 SVG 的风格（保持配色、渐变、描边等细节）：\n\n';
    styleRefs.forEach((ref, index) => {
      prompt += `【参考 ${index + 1}: ${ref.name}】\n`;
      if (ref.description) {
        prompt += `说明: ${ref.description}\n`;
      }
      prompt += '```svg\n' + ref.svgCode + '\n```\n\n';
    });
  }

  // 添加草图说明
  if (request.sketch) {
    prompt += '根据附件中的草图生成插图。保持草图的构图和元素布局。\n\n';
  }

  // 添加主题描述
  prompt += `主题是："${theme}"\n\n`;

  // 添加自定义提示词
  if (customPrompt) {
    prompt += `其他要求：${customPrompt}\n\n`;
  }

  // 添加输出要求
  prompt += `请生成 ${outputWidth}x${outputHeight} 尺寸的 SVG 代码。\n`;
  prompt += '要求：\n';
  prompt += '- 使用参考 SVG 的设计语言和配色方案\n';
  prompt += '- 输出完整的、可直接使用的 SVG 代码\n';
  prompt += '- 确保 SVG 代码格式正确，可以被 Figma 解析\n';
  prompt += '- SVG 必须包含 width 和 height 属性\n';
  prompt += '- 只输出 SVG 代码，不需要其他解释\n';

  return prompt;
}

/**
 * 应用模板
 */
export function applyTemplate(template: PromptTemplate, theme: string): string {
  return template.template.replace(/\{theme\}/g, theme);
}

/**
 * 预设提示词模板
 */
export const PRESET_TEMPLATES: PromptTemplate[] = [
  {
    id: 'tech-icon',
    name: '科技风图标',
    description: '适合技术产品的科技感图标',
    template: '生成一个科技感的图标，主题是"{theme}"，使用渐变和光晕效果，现代简洁，适合科技产品使用',
    isPreset: true,
    createdAt: Date.now(),
  },
  {
    id: 'flat-icon',
    name: '扁平化图标',
    description: '简洁清晰的扁平化风格',
    template: '生成一个扁平化风格的图标，主题是"{theme}"，简洁清晰，无渐变无阴影，使用纯色填充',
    isPreset: true,
    createdAt: Date.now(),
  },
  {
    id: 'illustration',
    name: '插画风格',
    description: '适合营销页面的活泼插画',
    template: '生成一个插画风格的图形，主题是"{theme}"，活泼有趣，色彩丰富，适合营销页面使用',
    isPreset: true,
    createdAt: Date.now(),
  },
  {
    id: 'line-icon',
    name: '线性图标',
    description: '统一线条粗细的线性图标',
    template: '生成一个线性图标，主题是"{theme}"，线条粗细统一（建议 2px），简约优雅，适合 UI 界面',
    isPreset: true,
    createdAt: Date.now(),
  },
  {
    id: 'isometric',
    name: '等距图标',
    description: '2.5D 等距视角图标',
    template: '生成一个等距（2.5D）风格的图标，主题是"{theme}"，有立体感和深度，使用等距投影视角',
    isPreset: true,
    createdAt: Date.now(),
  },
  {
    id: 'gradient-icon',
    name: '渐变图标',
    description: '使用渐变色的现代图标',
    template: '生成一个使用渐变色的图标，主题是"{theme}"，渐变方向可以是线性或径向，颜色过渡自然',
    isPreset: true,
    createdAt: Date.now(),
  },
];

/**
 * 生成唯一 ID
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
