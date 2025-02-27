'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useRef, useEffect } from 'react';

export default function Chat() {
  const [chatKey, setChatKey] = useState<number>(1); // 用于重置聊天

  const { messages, input, handleInputChange, handleSubmit, setMessages } =
    useChat({
      maxSteps: 3,
      id: `chat-${chatKey}` // 使用key重新初始化聊天
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

  return (
    <div className='flex h-screen flex-col'>
      {/* 头部导航栏 */}
      <header className='sticky top-0 z-10 border-b border-neutral-100 backdrop-blur-sm'>
        <div className='mx-auto flex max-w-5xl items-center justify-between px-6 py-3'>
          <h1 className='text-base font-medium text-neutral-900'>对话</h1>
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
      </header>

      {/* 主聊天区域 */}
      <main className='scrollbar-hide mx-auto w-full flex-1 overflow-y-auto'>
        <div className='mx-auto max-w-2xl px-4 py-4 pb-24'>
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
                输入消息开始与AI助手对话
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
      </main>

      {/* 底部输入区域 */}
      <footer className='fixed inset-x-0 bottom-0 border-t border-neutral-100 backdrop-blur-md'>
        <div className='mx-auto max-w-2xl px-4 py-3'>
          <form onSubmit={handleFormSubmit} className='relative'>
            <input
              className='w-full rounded-full border border-neutral-200 bg-white px-3.5 py-2.5 text-[14px] text-neutral-800 transition-all placeholder:text-neutral-400 focus:border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-300'
              value={input}
              placeholder='输入消息...'
              onChange={handleInputChange}
              disabled={loading}
            />
            <button
              type='submit'
              className='absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full bg-black p-1.5 text-white transition-all hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300'
              disabled={loading || !input.trim()}
              style={{
                transform:
                  loading || !input.trim()
                    ? 'translateY(-50%) scale(0.95)'
                    : 'translateY(-50%) scale(1)',
                opacity: loading || !input.trim() ? 0.8 : 1
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
      </footer>

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
