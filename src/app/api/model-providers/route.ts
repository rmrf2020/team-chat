import { NextRequest, NextResponse } from 'next/server';
import {
  createModelProvider,
  getAllModelProviders
} from '@/services/actions/modelProviders';
import { insertModelProviderSchema } from '@/db/schema/modelProviders';
import { ZodError } from 'zod';

// 获取所有模型提供商
export async function GET(req: NextRequest) {
  try {
    const result = await getAllModelProviders();

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('获取模型提供商失败:', error);
    return NextResponse.json({ error: '获取模型提供商失败' }, { status: 500 });
  }
}

// 创建新的模型提供商
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 验证请求数据
    try {
      insertModelProviderSchema.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          { error: '无效的请求数据', details: error.errors },
          { status: 400 }
        );
      }
    }

    const result = await createModelProvider(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('创建模型提供商失败:', error);
    return NextResponse.json({ error: '创建模型提供商失败' }, { status: 500 });
  }
}
