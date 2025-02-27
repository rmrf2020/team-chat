import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '@/lib/env.mjs';
import * as schema from './schema/index';

// 创建数据库连接
const client = postgres(env.DATABASE_URL);

// 创建 Drizzle 实例，包含所有模式
export const db = drizzle(client, { schema });
