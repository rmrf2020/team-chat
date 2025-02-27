'use server';

import { db } from '@/db';
import {
  NewModelParams,
  NewModelProviderParams,
  insertModelProviderSchema,
  insertModelSchema,
  modelProviders,
  models
} from '@/db/schema/modelProviders';
import { eq } from 'drizzle-orm';

// 创建新的模型提供商
export const createModelProvider = async (input: NewModelProviderParams) => {
  try {
    const validatedData = insertModelProviderSchema.parse(input);

    // 如果设置为默认，先将所有其他提供商设为非默认
    if (validatedData.isDefault) {
      await db
        .update(modelProviders)
        .set({ isDefault: false })
        .where(eq(modelProviders.isDefault, true));
    }

    const [provider] = await db
      .insert(modelProviders)
      .values(validatedData)
      .returning();

    return { success: true, data: provider };
  } catch (error) {
    console.error('创建模型提供商失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '创建模型提供商失败'
    };
  }
};

// 更新模型提供商
export const updateModelProvider = async (
  id: string,
  input: Partial<NewModelProviderParams>
) => {
  try {
    // 如果设置为默认，先将所有其他提供商设为非默认
    if (input.isDefault) {
      await db
        .update(modelProviders)
        .set({ isDefault: false })
        .where(eq(modelProviders.isDefault, true));
    }

    const [updatedProvider] = await db
      .update(modelProviders)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(modelProviders.id, id))
      .returning();

    if (!updatedProvider) {
      return { success: false, error: '未找到模型提供商' };
    }

    return { success: true, data: updatedProvider };
  } catch (error) {
    console.error('更新模型提供商失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '更新模型提供商失败'
    };
  }
};

// 删除模型提供商
export const deleteModelProvider = async (id: string) => {
  try {
    const [deletedProvider] = await db
      .delete(modelProviders)
      .where(eq(modelProviders.id, id))
      .returning();

    if (!deletedProvider) {
      return { success: false, error: '未找到模型提供商' };
    }

    return { success: true, data: deletedProvider };
  } catch (error) {
    console.error('删除模型提供商失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '删除模型提供商失败'
    };
  }
};

// 获取所有模型提供商
export const getAllModelProviders = async () => {
  try {
    const providers = await db.select().from(modelProviders);
    return { success: true, data: providers };
  } catch (error) {
    console.error('获取模型提供商失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取模型提供商失败'
    };
  }
};

// 获取默认模型提供商
export const getDefaultModelProvider = async () => {
  try {
    const [defaultProvider] = await db
      .select()
      .from(modelProviders)
      .where(eq(modelProviders.isDefault, true))
      .limit(1);

    return { success: true, data: defaultProvider };
  } catch (error) {
    console.error('获取默认模型提供商失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取默认模型提供商失败'
    };
  }
};

// 创建新模型
export const createModel = async (input: NewModelParams) => {
  try {
    const validatedData = insertModelSchema.parse(input);

    // 如果设置为默认，先将所有其他模型设为非默认
    if (validatedData.isDefault) {
      await db
        .update(models)
        .set({ isDefault: false })
        .where(eq(models.isDefault, true));
    }

    const [model] = await db.insert(models).values(validatedData).returning();

    return { success: true, data: model };
  } catch (error) {
    console.error('创建模型失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '创建模型失败'
    };
  }
};

// 更新模型
export const updateModel = async (
  id: string,
  input: Partial<NewModelParams>
) => {
  try {
    // 如果设置为默认，先将所有其他模型设为非默认
    if (input.isDefault) {
      await db
        .update(models)
        .set({ isDefault: false })
        .where(eq(models.isDefault, true));
    }

    const [updatedModel] = await db
      .update(models)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(models.id, id))
      .returning();

    if (!updatedModel) {
      return { success: false, error: '未找到模型' };
    }

    return { success: true, data: updatedModel };
  } catch (error) {
    console.error('更新模型失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '更新模型失败'
    };
  }
};

// 删除模型
export const deleteModel = async (id: string) => {
  try {
    const [deletedModel] = await db
      .delete(models)
      .where(eq(models.id, id))
      .returning();

    if (!deletedModel) {
      return { success: false, error: '未找到模型' };
    }

    return { success: true, data: deletedModel };
  } catch (error) {
    console.error('删除模型失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '删除模型失败'
    };
  }
};

// 获取提供商的所有模型
export const getModelsByProvider = async (providerId: string) => {
  try {
    const providerModels = await db
      .select()
      .from(models)
      .where(eq(models.providerId, providerId));

    return { success: true, data: providerModels };
  } catch (error) {
    console.error('获取提供商模型失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取提供商模型失败'
    };
  }
};

// 获取所有活跃模型及其提供商信息
export const getAllActiveModelsWithProviders = async () => {
  try {
    const result = await db.query.models.findMany({
      where: eq(models.isActive, true),
      with: {
        provider: true
      }
    });

    return { success: true, data: result };
  } catch (error) {
    console.error('获取活跃模型失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取活跃模型失败'
    };
  }
};

// 获取默认模型及其提供商信息
export const getDefaultModel = async () => {
  try {
    const result = await db.query.models.findFirst({
      where: eq(models.isDefault, true),
      with: {
        provider: true
      }
    });

    return { success: true, data: result };
  } catch (error) {
    console.error('获取默认模型失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取默认模型失败'
    };
  }
};
