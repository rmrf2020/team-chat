import { NextRequest, NextResponse } from 'next/server';
import { deleteModel, updateModel } from '@/services/actions/modelProviders';

// 更新模型
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await req.json();

    const result = await updateModel(id, body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('更新模型失败:', error);
    return NextResponse.json({ error: '更新模型失败' }, { status: 500 });
  }
}

// 删除模型
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    const result = await deleteModel(id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('删除模型失败:', error);
    return NextResponse.json({ error: '删除模型失败' }, { status: 500 });
  }
}
