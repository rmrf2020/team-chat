'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useRef, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { ModelOption } from '@/types/models';

export default function Chat() {
  const [chatKey, setChatKey] = useState<number>(1); // 用于重置聊天
  const [models, setModels] = useState<ModelOption[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  // 加载可用模型
  useEffect(() => {
    async function loadModels() {
      try {
        setIsLoadingModels(true);
        const response = await fetch('/api/models');
        if (!response.ok) {
          throw new Error('获取模型失败');
        }
        const result = await response.json();

        if (result.success && result.data) {
          const modelOptions: ModelOption[] = result.data.map((model: any) => ({
            id: model.id,
            name: model.name,
            modelId: model.modelId,
            isDefault: model.isDefault,
            provider: {
              id: model.provider.id,
              name: model.provider.name,
              provider: model.provider.provider
            }
          }));

          setModels(modelOptions);

          // 如果有默认模型，选择默认模型，否则选择第一个
          const defaultModel = modelOptions.find((m) => m.isDefault);
          if (defaultModel) {
            setSelectedModel(defaultModel.id);
          } else if (modelOptions.length > 0) {
            setSelectedModel(modelOptions[0].id);
          }
        }
      } catch (error) {
        console.error('加载模型失败:', error);
      } finally {
        setIsLoadingModels(false);
      }
    }

    loadModels();
  }, []);

  // 按提供商分组模型
  const groupedModels = models.reduce(
    (groups: Record<string, ModelOption[]>, model) => {
      const providerName = model.provider.name;
      if (!groups[providerName]) {
        groups[providerName] = [];
      }
      groups[providerName].push(model);
      return groups;
    },
    {}
  );

  const { messages, input, handleInputChange, handleSubmit, setMessages } =
    useChat({
      maxSteps: 3,
      id: `chat-${chatKey}`, // 使用key重新初始化聊天
      body: selectedModel
        ? {
            modelId: models.find((m) => m.id === selectedModel)?.modelId
          }
        : undefined
    });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  // 自动滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 处理提交并显示加载状态
  const handleFormSubmit = (e: React.FormEvent) => {
    setLoading(true);
    handleSubmit(e);
    // 使用setTimeout来模拟异步操作完成后关闭加载状态
    setTimeout(() => setLoading(false), 500);
  };

  // 新建对话 - 无需刷新页面
  const handleNewChat = () => {
    // 增加聊天key，强制useChat重新初始化
    setChatKey((prev) => prev + 1);
  };

  // 处理模型选择变化
  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    // 重置聊天
    setChatKey((prev) => prev + 1);
  };

  // 获取当前选中模型的完整信息
  const selectedModelInfo = models.find((m) => m.id === selectedModel);

  return (
    <div className='relative flex h-full flex-col'>
      {/* 聊天控制栏 */}
      <div className='border-b border-neutral-100 py-3'>
        <div className='flex items-center justify-between px-4'>
          <h1 className='text-base font-medium text-neutral-900'>对话</h1>
          <div className='flex items-center gap-4'>
            <Select
              value={selectedModel || ''}
              onValueChange={handleModelChange}
              disabled={isLoadingModels}
            >
              <SelectTrigger className='w-[220px] truncate'>
                <SelectValue>
                  {selectedModelInfo ? (
                    <div className='flex items-center'>
                      <span className='truncate'>{selectedModelInfo.name}</span>
                      <span className='ml-1 text-xs text-gray-500'>
                        ({selectedModelInfo.provider.name})
                        {selectedModelInfo.isDefault && (
                          <span className='ml-1 text-green-500'>默认</span>
                        )}
                      </span>
                    </div>
                  ) : isLoadingModels ? (
                    '加载中...'
                  ) : (
                    '选择模型'
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(groupedModels).map(
                  ([providerName, providerModels]) => (
                    <SelectGroup key={providerName}>
                      <SelectLabel className='text-sm font-semibold'>
                        {providerName}
                      </SelectLabel>
                      {providerModels.map((model) => (
                        <SelectItem
                          key={model.id}
                          value={model.id}
                          className='pl-6'
                        >
                          <div className='flex items-center'>
                            <div className='max-w-[180px] truncate'>
                              {model.name}
                            </div>
                            {model.isDefault && (
                              <span className='ml-1 text-xs text-green-500'>
                                默认
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )
                )}
              </SelectContent>
            </Select>
            <button
              onClick={handleNewChat}
              className='flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-4 w-4'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M12 4v16m8-8H4'
                />
              </svg>
              <span>新建对话</span>
            </button>
          </div>
        </div>
      </div>

      {/* 主聊天区域 */}
      <div className='scrollbar-hide flex-1 overflow-y-auto pb-20'>
        <div className='mx-auto max-w-2xl px-4 py-4'>
          {messages.length === 0 && (
            <div className='animate-fade-in py-20 text-center'>
              <div className='mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-50 shadow-sm'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-6 w-6 text-neutral-400'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
                  />
                </svg>
              </div>
              <h2 className='text-lg font-medium text-neutral-800'>
                开始新对话
              </h2>
              <p className='mt-1 text-sm text-neutral-500'>
                {selectedModelInfo
                  ? `使用 ${selectedModelInfo.name} (${selectedModelInfo.provider.name}) ${selectedModelInfo.isDefault ? '默认' : ''} 模型开始对话`
                  : '请先选择一个模型'}
              </p>
            </div>
          )}

          <div className='space-y-3'>
            {messages.map((m, index) => (
              <div
                key={m.id}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                style={{
                  opacity: 0,
                  animation: `fadeInUp 0.3s ease-out ${index * 0.1}s forwards`
                }}
              >
                <div
                  className={`max-w-[82%] px-3.5 py-2.5 ${
                    m.role === 'user'
                      ? 'rounded-2xl rounded-tr-sm bg-black text-white'
                      : 'rounded-2xl rounded-tl-sm bg-neutral-100 text-neutral-800'
                  } shadow-sm transition-all`}
                >
                  <div className='whitespace-pre-wrap text-[14px] leading-relaxed'>
                    {m.content.length > 0 ? (
                      m.content
                    ) : (
                      <div className='flex items-center gap-1.5 text-xs text-neutral-500'>
                        <div className='animate-pulse'>
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            className='h-3.5 w-3.5'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              d='M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z'
                            />
                          </svg>
                        </div>
                        <span className='font-light'>
                          正在调用工具: {m?.toolInvocations?.[0].toolName}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 底部输入区域 - 固定在底部 */}
      <div className='absolute bottom-0 left-0 right-0 border-t border-neutral-100 bg-white/80 backdrop-blur-md'>
        <div className='mx-auto max-w-2xl px-4 py-3'>
          <form onSubmit={handleFormSubmit} className='relative'>
            <input
              className='w-full rounded-full border border-neutral-200 bg-white px-3.5 py-2.5 text-[14px] text-neutral-800 transition-all placeholder:text-neutral-400 focus:border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-300'
              value={input}
              placeholder={selectedModel ? '输入消息...' : '请先选择一个模型'}
              onChange={handleInputChange}
              disabled={loading || !selectedModel}
            />
            <button
              type='submit'
              className='absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full bg-black p-1.5 text-white transition-all hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300'
              disabled={loading || !input.trim() || !selectedModel}
              style={{
                transform:
                  loading || !input.trim() || !selectedModel
                    ? 'translateY(-50%) scale(0.95)'
                    : 'translateY(-50%) scale(1)',
                opacity: loading || !input.trim() || !selectedModel ? 0.8 : 1
              }}
            >
              {loading ? (
                <svg
                  className='h-4 w-4 animate-spin'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                >
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='3'
                  ></circle>
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  ></path>
                </svg>
              ) : (
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-4 w-4'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path d='M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z' />
                </svg>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* 添加CSS动画 */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
