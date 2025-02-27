import { embed, embedMany } from 'ai';
import { db } from '@/db';
import { cosineDistance, desc, gt, sql } from 'drizzle-orm';
import { embeddings } from '@/db/schema/embeddings';
import { getDefaultModelProvider } from '../actions/modelProviders';
import { getEmbeddingModelFromProvider } from './modelAdapter';

// 默认嵌入模型ID
const DEFAULT_EMBEDDING_MODEL_ID = 'text-embedding-004';

// 获取嵌入模型
const getEmbeddingModel = async () => {
  // 获取默认提供商
  const { success, data: provider } = await getDefaultModelProvider();

  if (!success || !provider) {
    // 如果没有配置提供商，使用默认的Google嵌入模型
    return { model: 'google.textEmbeddingModel("text-embedding-004")' };
  }

  // 使用提供商配置获取嵌入模型
  return {
    model: getEmbeddingModelFromProvider(provider, DEFAULT_EMBEDDING_MODEL_ID)
  };
};

const generateChunks = (input: string): string[] => {
  return input
    .trim()
    .split('.')
    .filter((i) => i !== '');
};

export const generateEmbeddings = async (
  value: string
): Promise<Array<{ embedding: number[]; content: string }>> => {
  const chunks = generateChunks(value);
  const { model } = await getEmbeddingModel();

  const { embeddings } = await embedMany({
    model,
    values: chunks
  });
  return embeddings.map((e, i) => ({ content: chunks[i], embedding: e }));
};

export const generateEmbedding = async (value: string): Promise<number[]> => {
  const input = value.replaceAll('\\n', ' ');
  const { model } = await getEmbeddingModel();

  const { embedding } = await embed({
    model,
    value: input
  });
  return embedding;
};

export const findRelevantContent = async (userQuery: string) => {
  const userQueryEmbedded = await generateEmbedding(userQuery);
  const similarity = sql<number>`1 - (${cosineDistance(
    embeddings.embedding,
    userQueryEmbedded
  )})`;
  const similarGuides = await db
    .select({ name: embeddings.content, similarity })
    .from(embeddings)
    .where(gt(similarity, 0.5))
    .orderBy((t) => desc(t.similarity))
    .limit(4);
  return similarGuides;
};
