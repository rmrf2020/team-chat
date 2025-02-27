import { relations } from 'drizzle-orm';
import { modelProviders, models } from './modelProviders';

// 定义模型提供商与模型之间的关系
export const modelProvidersRelations = relations(
  modelProviders,
  ({ many }) => ({
    models: many(models)
  })
);

// 定义模型与模型提供商之间的关系
export const modelsRelations = relations(models, ({ one }) => ({
  provider: one(modelProviders, {
    fields: [models.providerId],
    references: [modelProviders.id]
  })
}));
