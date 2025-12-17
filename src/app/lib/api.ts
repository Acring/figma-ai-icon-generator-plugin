// ==================== Claude API 客户端 ====================

export const DEFAULT_BASE_URL = 'https://api.anthropic.com/v1/messages';
export const DEFAULT_MODEL = 'claude-sonnet-4-5-20250929';
const MAX_TOKENS = 4096;

// 预设模型列表
export const PRESET_MODELS = [
  { value: 'claude-sonnet-4-5-20250929', label: 'Claude Sonnet 4.5' },
  { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4' },
  { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
  { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku' },
  { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
] as const;

interface ClaudeContent {
  type: 'text' | 'image';
  text?: string;
  source?: {
    type: 'base64';
    media_type: string;
    data: string;
  };
}

interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: ClaudeContent[];
}

interface ClaudeRequest {
  model: string;
  max_tokens: number;
  messages: ClaudeMessage[];
}

// Anthropic 原生格式响应
interface AnthropicResponse {
  content: { type: 'text'; text: string }[];
  error?: {
    type: string;
    message: string;
  };
}

// OpenAI 兼容格式响应
interface OpenAICompatibleResponse {
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  error?: {
    message: string;
  };
}

type APIResponse = AnthropicResponse | OpenAICompatibleResponse;

interface ClaudeErrorResponse {
  error: {
    type: string;
    message: string;
  };
}

/**
 * 调用 Claude API
 */
export async function callClaudeAPI(apiConfig: APIConfig, prompt: string, imageBase64?: string): Promise<string> {
  const { apiKey, baseUrl = DEFAULT_BASE_URL, model = DEFAULT_MODEL } = apiConfig;

  const content: ClaudeContent[] = [];

  // 添加图片（草图）
  if (imageBase64) {
    content.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: 'image/png',
        data: imageBase64,
      },
    });
  }

  // 添加文本提示词
  content.push({ type: 'text', text: prompt });

  const requestBody: ClaudeRequest = {
    model,
    max_tokens: MAX_TOKENS,
    messages: [{ role: 'user', content }],
  };

  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = (await response.json()) as ClaudeErrorResponse;
    const errorMessage = errorData.error?.message || `API 请求失败: ${response.status}`;

    // 处理特定错误
    if (response.status === 401) {
      throw new Error('API Key 无效，请检查后重试');
    }
    if (response.status === 429) {
      throw new Error('API 请求过于频繁，请稍后重试');
    }
    if (response.status === 400) {
      throw new Error(`请求参数错误: ${errorMessage}`);
    }

    throw new Error(errorMessage);
  }

  const data: APIResponse = await response.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  console.log(data);

  // 解析响应内容，兼容 Anthropic 原生格式和 OpenAI 兼容格式
  let textContent: string | undefined;

  // 检查 OpenAI 兼容格式：choices[0].message.content
  if ('choices' in data && data.choices?.length > 0) {
    textContent = data.choices[0].message.content;
  }
  // 检查 Anthropic 原生格式：content[0].text
  else if ('content' in data && data.content?.length > 0) {
    textContent = data.content[0].text;
  }

  if (!textContent) {
    throw new Error('API 返回内容为空');
  }

  return textContent;
}

/**
 * 从 Claude 响应中提取 SVG 代码
 */
export function extractSVGFromResponse(response: string): string {
  // 尝试匹配 ```svg ... ``` 或 ```xml ... ``` 代码块
  const codeBlockMatch = response.match(/```(?:svg|xml)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    const content = codeBlockMatch[1].trim();
    // 确保内容是 SVG
    if (content.includes('<svg')) {
      return content;
    }
  }

  // 尝试直接匹配 <svg> 标签
  const svgMatch = response.match(/<svg[\s\S]*?<\/svg>/i);
  if (svgMatch) {
    return svgMatch[0];
  }

  throw new Error('AI 返回的内容无法解析为 SVG，请重新生成');
}

/**
 * 验证 API 配置
 */
export async function validateAPIConfig(apiConfig: APIConfig): Promise<boolean> {
  const { apiKey, baseUrl = DEFAULT_BASE_URL, model = DEFAULT_MODEL } = apiConfig;

  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model,
        max_tokens: 10,
        messages: [{ role: 'user', content: [{ type: 'text', text: 'Hi' }] }],
      }),
    });

    // 401 表示 API Key 无效
    if (response.status === 401) {
      return false;
    }

    // 其他状态码都认为是有效的（包括 200 和其他错误）
    return true;
  } catch {
    // 网络错误
    throw new Error('无法连接到 API 服务器，请检查网络或 Base URL');
  }
}

/**
 * 生成图标
 */
export async function generateIcon(
  apiConfig: APIConfig,
  request: GenerateRequest,
  buildPromptFn: (request: GenerateRequest) => string
): Promise<GenerateResult> {
  const prompt = buildPromptFn(request);

  const response = await callClaudeAPI(apiConfig, prompt, request.sketch?.imageBase64);

  const svgCode = extractSVGFromResponse(response);

  return {
    svgCode,
    width: request.outputWidth,
    height: request.outputHeight,
  };
}
