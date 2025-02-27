import { createResource } from '@/services/actions/resources';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { findRelevantContent } from '@/services/ai/embedding';
import { getModelFromProvider } from '@/services/ai/modelAdapter';
import { getDefaultModelProvider } from '@/services/actions/modelProviders';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, modelId } = await req.json();

  // 获取默认提供商或使用指定的模型ID
  const { success, data: defaultProvider } = await getDefaultModelProvider();

  // 如果没有配置提供商，使用默认的Google模型
  const model = defaultProvider
    ? getModelFromProvider(defaultProvider, modelId || 'gemini-2.0-flash')
    : 'google.gemini-2.0-flash';

  const result = streamText({
    model,
    messages,
    system: `You are a helpful assistant. Check your knowledge base before answering any questions.
    Only respond to questions using information from tool calls.
    if no relevant information is found in the tool calls, respond, "Sorry, I don't know."`,
    tools: {
      addResource: tool({
        description: `add a resource to your knowledge base.
          If the user provides a random piece of knowledge unprompted, use this tool without asking for confirmation.`,
        parameters: z.object({
          content: z
            .string()
            .describe('the content or resource to add to the knowledge base')
        }),
        execute: async ({ content }) => createResource({ content })
      }),
      getInformation: tool({
        description: `get information from your knowledge base to answer questions.`,
        parameters: z.object({
          question: z.string().describe('the users question')
        }),
        execute: async ({ question }) => findRelevantContent(question)
      })
    }
  });
  return result.toDataStreamResponse();
}
