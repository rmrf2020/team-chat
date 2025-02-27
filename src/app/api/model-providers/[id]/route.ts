import { NextRequest, NextResponse } from 'next/server';
import {
  deleteModelProvider,
  updateModelProvider
} from '@/services/actions/modelProviders';
import { ZodError } from 'zod';

// 更新模型提供商
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const result = await updateModelProvider(id, body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('更新模型提供商失败:', error);
    return NextResponse.json({ error: '更新模型提供商失败' }, { status: 500 });
  }
}

// 删除模型提供商
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await deleteModelProvider(id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('删除模型提供商失败:', error);
    return NextResponse.json({ error: '删除模型提供商失败' }, { status: 500 });
  }
}
