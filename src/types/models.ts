// 模型提供商类型
export interface ModelProvider {
  id: string;
  name: string;
  provider: string; // 'google', 'openai', 'anthropic', etc.
  baseUrl?: string | null;
  apiKey?: string | null;
  isActive: boolean | null;
  isDefault: boolean | null;
  createdAt: Date;
  updatedAt: Date;
}

// 模型类型
export interface Model {
  id: string;
  providerId: string;
  name: string;
  modelId: string; // 实际的模型ID，如 'gemini-2.0-flash'
  isActive: boolean | null;
  isDefault: boolean | null; // 是否为全局默认模型
  createdAt: Date;
  updatedAt: Date;
  provider?: ModelProvider; // 关联的提供商
}

// 带有提供商信息的模型类型
export interface ModelWithProvider extends Model {
  provider: ModelProvider;
}

// 用于前端选择的模型选项
export interface ModelOption {
  id: string;
  name: string;
  modelId: string;
  isDefault?: boolean | null;
  provider: {
    id: string;
    name: string;
    provider: string;
  };
}
