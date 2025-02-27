import { google, createGoogleGenerativeAI } from '@ai-sdk/google';
import { openai, createOpenAI } from '@ai-sdk/openai';
import { anthropic, createAnthropic } from '@ai-sdk/anthropic';
import { ModelProvider } from '@/types/models';

// 模型适配器类型
export type ModelAdapter = {
  getTextModel: (modelId: string, options?: any) => any;
  getEmbeddingModel: (modelId: string, options?: any) => any;
};

// Google模型适配器
export const googleAdapter: ModelAdapter = {
  getTextModel: (modelId: string, options?: any) => {
    // 为每次调用创建新的配置了的实例
    const configuredGoogle = createGoogleGenerativeAI(options);
    return configuredGoogle(modelId);
  },
  getEmbeddingModel: (modelId: string, options?: any) => {
    // 为每次调用创建新的配置了的实例
    const configuredGoogle = createGoogleGenerativeAI(options);
    return configuredGoogle.textEmbeddingModel(modelId);
  }
};

// OpenAI模型适配器
export const openaiAdapter: ModelAdapter = {
  getTextModel: (modelId: string, options?: any) => {
    // 为每次调用创建新的配置了的实例
    const configuredOpenAI = createOpenAI(options);
    return configuredOpenAI(modelId);
  },
  getEmbeddingModel: (modelId: string, options?: any) => {
    // 为每次调用创建新的配置了的实例
    const configuredOpenAI = createOpenAI(options);
    return configuredOpenAI.textEmbeddingModel(modelId);
  }
};

// Anthropic模型适配器
export const anthropicAdapter: ModelAdapter = {
  getTextModel: (modelId: string, options?: any) => {
    // 为每次调用创建新的配置了的实例
    const configuredAnthropic = createAnthropic(options);
    return configuredAnthropic(modelId);
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
