import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { todoUpdateSchema } from '@/lib/validations/todo'

// GET /api/todos/[id] - 특정 TODO 조회
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: todo, error } = await supabase.from('todos').select('*').eq('id', id).single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ success: false, error: 'Todo not found' }, { status: 404 })
      }
      console.error('Database error:', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch todo' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: todo,
    })
  } catch (error) {
    const { id } = await params
    console.error(`GET /api/todos/${id} error:`, error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/todos/[id] - TODO 업데이트
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    // 유효성 검사
    const validatedData = todoUpdateSchema.parse(body)

    const supabase = await createClient()

    const { data: updatedTodo, error } = await supabase
      .from('todos')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ success: false, error: 'Todo not found' }, { status: 404 })
      }
      console.error('Database error:', error)
      return NextResponse.json({ success: false, error: 'Failed to update todo' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: updatedTodo,
    })
  } catch (error) {
    const { id } = await params
    console.error(`PUT /api/todos/${id} error:`, error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid input data', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/todos/[id] - TODO 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { error } = await supabase.from('todos').delete().eq('id', id)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ success: false, error: 'Failed to delete todo' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Todo deleted successfully',
    })
  } catch (error) {
    const { id } = await params
    console.error(`DELETE /api/todos/${id} error:`, error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
