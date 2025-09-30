import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { todoCreateSchema, todoFiltersSchema } from '@/lib/validations/todo'
import type { Todo, TodoFilters } from '@/types/todo'

// GET /api/todos - 모든 TODO 조회 (필터링 지원)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // 쿼리 파라미터 파싱 및 검증
    const filters: TodoFilters = {
      status: (searchParams.get('status') as TodoFilters['status']) || 'all',
      priority: searchParams.get('priority') as TodoFilters['priority'],
      category: searchParams.get('category') as TodoFilters['category'],
      search: searchParams.get('search'),
      sortBy: (searchParams.get('sortBy') as TodoFilters['sortBy']) || 'created_at',
      sortOrder: (searchParams.get('sortOrder') as TodoFilters['sortOrder']) || 'desc',
    }

    const supabase = await createClient()
    let query = supabase.from('todos').select('*')

    // 상태 필터링
    if (filters.status === 'completed') {
      query = query.eq('completed', true)
    } else if (filters.status === 'pending') {
      query = query.eq('completed', false)
    }

    // 우선순위 필터링
    if (filters.priority) {
      query = query.eq('priority', filters.priority)
    }

    // 카테고리 필터링
    if (filters.category) {
      query = query.eq('category', filters.category)
    }

    // 검색 필터링
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    // 정렬
    if (filters.sortBy && filters.sortOrder) {
      query = query
        .order(filters.sortBy, { ascending: filters.sortOrder === 'asc' })
        .order('completed', { ascending: true })
    }

    const { data: todos, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch todos' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: todos || [],
      count: todos?.length || 0,
    })
  } catch (error) {
    console.error('GET /api/todos error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/todos - 새 TODO 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 유효성 검사
    const validatedData = todoCreateSchema.parse(body)

    const supabase = await createClient()

    // 새로운 order_index 계산 (가장 높은 값 + 1)
    const { data: maxOrderData } = await supabase
      .from('todos')
      .select('order_index')
      .order('order_index', { ascending: false })
      .limit(1)

    const nextOrderIndex = (maxOrderData?.[0]?.order_index || 0) + 1

    const { data: newTodo, error } = await supabase
      .from('todos')
      .insert([
        {
          ...validatedData,
          order_index: nextOrderIndex,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ success: false, error: 'Failed to create todo' }, { status: 500 })
    }

    return NextResponse.json(
      {
        success: true,
        data: newTodo,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/todos error:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid input data', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
