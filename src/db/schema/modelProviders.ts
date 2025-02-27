import { sql } from 'drizzle-orm';
import {
  text,
  varchar,
  timestamp,
  pgTable,
  boolean
} from 'drizzle-orm/pg-core';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { nanoid } from '@/utils/utils';

export const modelProviders = pgTable('model_providers', {
  id: varchar('id', { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  name: varchar('name', { length: 255 }).notNull(),
  provider: varchar('provider', { length: 100 }).notNull(), // 'google', 'openai', 'anthropic', etc.
  baseUrl: text('base_url'),
  apiKey: text('api_key'),
  isActive: boolean('is_active').default(true),
  isDefault: boolean('is_default').default(false),

  createdAt: timestamp('created_at')
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp('updated_at')
    .notNull()
    .default(sql`now()`)
});

// 模型表，每个提供商可以有多个模型
export const models = pgTable('models', {
  id: varchar('id', { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  providerId: varchar('provider_id', { length: 191 }).references(
    () => modelProviders.id,
    { onDelete: 'cascade' }
  ),
  name: varchar('name', { length: 255 }).notNull(),
  modelId: varchar('model_id', { length: 255 }).notNull(), // 实际的模型ID，如 'gemini-2.0-flash'
  isActive: boolean('is_active').default(true),
  isDefault: boolean('is_default').default(false), // 全局默认模型标志，只能有一个模型为默认

  createdAt: timestamp('created_at')
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp('updated_at')
    .notNull()
    .default(sql`now()`)
});

// Schema for model providers - used to validate API requests
export const insertModelProviderSchema = createSelectSchema(modelProviders)
  .extend({})
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true
  });

// Schema for models - used to validate API requests
export const insertModelSchema = createSelectSchema(models).extend({}).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Types for model providers and models
export type NewModelProviderParams = z.infer<typeof insertModelProviderSchema>;
export type NewModelParams = z.infer<typeof insertModelSchema>;
