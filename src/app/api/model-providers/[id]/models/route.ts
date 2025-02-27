import { NextRequest, NextResponse } from 'next/server';
import { getModelsByProvider } from '@/services/actions/modelProviders';

// 获取提供商的所有模型
export async function GET(
  req: NextRequest,
  {
    params
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    // 确保 params 是已解析的
    const { id: providerId } = await params;

    const result = await getModelsByProvider(providerId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('获取提供商模型失败:', error);
    return NextResponse.json({ error: '获取提供商模型失败' }, { status: 500 });
  }
}
