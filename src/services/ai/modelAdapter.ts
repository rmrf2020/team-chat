import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { ModelProvider } from '@/types/models';

// 模型适配器类型
export type ModelAdapter = {
  getTextModel: (modelId: string, options?: any) => any;
  getEmbeddingModel: (modelId: string, options?: any) => any;
};

// Google模型适配器
export const googleAdapter: ModelAdapter = {
  getTextModel: (modelId: string, options?: any) => {
    return google(modelId, options);
  },
  getEmbeddingModel: (modelId: string, options?: any) => {
    return google.textEmbeddingModel(modelId, options);
  }
};

// OpenAI模型适配器
export const openaiAdapter: ModelAdapter = {
  getTextModel: (modelId: string, options?: any) => {
    return openai(modelId, options);
  },
  getEmbeddingModel: (modelId: string, options?: any) => {
    return openai.textEmbeddingModel(modelId, options);
  }
};

// Anthropic模型适配器
export const anthropicAdapter: ModelAdapter = {
  getTextModel: (modelId: string, options?: any) => {
    return anthropic(modelId, options);
  },
  getEmbeddingModel: (modelId: string, options?: any) => {
    // Anthropic目前不支持嵌入模型，可以返回null或抛出错误
    throw new Error('Anthropic不支持嵌入模型');
  }
};

// 获取适配器
export function getAdapter(provider: string): ModelAdapter {
  switch (provider.toLowerCase()) {
    case 'google':
      return googleAdapter;
    case 'openai':
      return openaiAdapter;
    case 'anthropic':
      return anthropicAdapter;
    default:
      throw new Error(`不支持的提供商: ${provider}`);
  }
}

// 根据提供商配置获取模型
export function getModelFromProvider(provider: ModelProvider, modelId: string) {
  const adapter = getAdapter(provider.provider);

  // 设置API密钥和基础URL（如果有）
  const options: any = {};

  if (provider.apiKey) {
    options.apiKey = provider.apiKey;
  }

  if (provider.baseUrl) {
    options.baseURL = provider.baseUrl;
  }

  return adapter.getTextModel(modelId, options);
}

// 根据提供商配置获取嵌入模型
export function getEmbeddingModelFromProvider(
  provider: ModelProvider,
  modelId: string
) {
  const adapter = getAdapter(provider.provider);

  // 设置API密钥和基础URL（如果有）
  const options: any = {};

  if (provider.apiKey) {
    options.apiKey = provider.apiKey;
  }

  if (provider.baseUrl) {
    options.baseURL = provider.baseUrl;
  }

  return adapter.getEmbeddingModel(modelId, options);
}
