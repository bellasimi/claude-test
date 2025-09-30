import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { processUserMessage, formatTodoContext, type AIResponse } from '@/lib/ai/gemma'
import { todoCreateSchema } from '@/lib/validations/todo'
import type { Todo } from '@/types/todo'

type CreateTodoInput = {
  title: string
  description?: string
  category: string
  priority: string
  due_date?: string
}

type QueryConditions = Record<string, string | boolean | number>
type UpdateData = Record<string, string | boolean | number>

// POST /api/ai/chat - AI와 대화하여 TODO 작업 수행
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ success: false, error: '메시지가 필요합니다.' }, { status: 400 })
    }

    const supabase = await createClient()

    // 현재 TODO 데이터 조회
    const { data: todos, error: fetchError } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('TODO 데이터 조회 에러:', fetchError)
      return NextResponse.json(
        { success: false, error: 'TODO 데이터를 불러올 수 없습니다.' },
        { status: 500 }
      )
    }

    // TODO 컨텍스트 생성
    const todoContext = formatTodoContext(todos || [])

    // AI 처리
    const aiResponse: AIResponse = await processUserMessage(message, todoContext)
    console.log('API에서 받은 AI 응답:', aiResponse) // 디버깅용

    // AI 응답에 따른 데이터베이스 작업 수행
    let result = null
    let error = null

    try {
      console.log('수행할 작업:', aiResponse.action) // 디버깅용
      switch (aiResponse.action) {
        case 'CREATE':
          console.log('CREATE 데이터:', aiResponse.data.todos) // 디버깅용
          result = await handleCreateTodos(supabase, aiResponse.data.todos || [])
          break

        case 'READ':
          console.log('READ 쿼리:', aiResponse.data.query) // 디버깅용

          // AI가 이미 상세한 분석을 제공했으므로 그대로 사용
          result = await handleReadTodos(supabase, todos || [], aiResponse.message)
          break

        case 'UPDATE':
          console.log(
            'UPDATE 조건:',
            aiResponse.data.conditions,
            '업데이트 데이터:',
            aiResponse.data.updates
          ) // 디버깅용
          result = await handleUpdateTodos(
            supabase,
            aiResponse.data.conditions || {},
            aiResponse.data.updates || {}
          )
          break

        case 'DELETE':
          result = await handleDeleteTodos(supabase, aiResponse.data.conditions || {})
          break

        default:
          result = { message: '지원하지 않는 작업입니다.' }
      }
    } catch (dbError) {
      console.error('데이터베이스 작업 에러:', dbError)
      error = '데이터베이스 작업 중 오류가 발생했습니다.'
    }

    return NextResponse.json({
      success: !error,
      data: {
        action: aiResponse.action,
        message: aiResponse.message,
        result: result,
        error: error,
      },
    })
  } catch (error) {
    console.error('AI 채팅 API 에러:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// CREATE 작업 처리
async function handleCreateTodos(
  supabase: Awaited<ReturnType<typeof createClient>>,
  todos: CreateTodoInput[]
) {
  console.log('handleCreateTodos 호출됨, todos:', todos) // 디버깅용

  if (!todos.length) {
    console.log('생성할 TODO가 없음') // 디버깅용
    return { message: '생성할 TODO가 없습니다.' }
  }

  const validTodos = []
  for (const todo of todos) {
    console.log('처리 중인 todo:', todo) // 디버깅용
    try {
      // 날짜 처리
      let due_date = null
      if (todo.due_date) {
        if (todo.due_date === '오늘') {
          due_date = new Date().toISOString().split('T')[0]
        } else if (todo.due_date === '내일') {
          const tomorrow = new Date()
          tomorrow.setDate(tomorrow.getDate() + 1)
          due_date = tomorrow.toISOString().split('T')[0]
        } else {
          due_date = todo.due_date
        }
      }

      const todoToValidate = {
        title: todo.title,
        description: todo.description || '',
        category: todo.category,
        priority: todo.priority,
        due_date: due_date,
      }
      console.log('유효성 검사할 todo:', todoToValidate) // 디버깅용

      const validatedTodo = todoCreateSchema.parse(todoToValidate)
      console.log('유효성 검사 통과:', validatedTodo) // 디버깅용

      validTodos.push(validatedTodo)
    } catch (validationError) {
      console.error('TODO 유효성 검사 실패:', todo, validationError)
    }
  }

  console.log('유효한 TODOs:', validTodos) // 디버깅용

  if (!validTodos.length) {
    console.log('유효한 TODO가 없음') // 디버깅용
    return { message: '유효한 TODO가 없습니다.' }
  }

  const { data: createdTodos, error } = await supabase.from('todos').insert(validTodos).select()

  if (error) {
    console.error('Supabase 삽입 에러:', error) // 디버깅용
    throw error
  }

  console.log('생성된 TODOs:', createdTodos) // 디버깅용
  return {
    message: `${createdTodos.length}개의 TODO가 생성되었습니다.`,
    created: createdTodos,
  }
}

// READ 작업 처리 - AI에서 받은 메시지와 함께 통계 제공
async function handleReadTodos(
  supabase: Awaited<ReturnType<typeof createClient>>,
  todos: Todo[],
  aiMessage: string
) {
  console.log('📊 READ 작업 실행:', { todosCount: todos.length })

  const stats = generateStats(todos)

  return {
    message: aiMessage || 'TODO 데이터를 분석했습니다.',
    stats,
  }
}

// 통계 생성 함수
function generateStats(todos: Todo[]) {
  const today = new Date().toISOString().split('T')[0]

  return {
    total: todos.length,
    completed: todos.filter((t) => t.completed).length,
    pending: todos.filter((t) => !t.completed).length,
    todayTotal: todos.filter((t) => t.due_date === today).length,
    todayCompleted: todos.filter((t) => t.due_date === today && t.completed).length,
    categories: todos.reduce((acc, todo) => {
      acc[todo.category] = (acc[todo.category] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    priorities: todos.reduce((acc, todo) => {
      acc[todo.priority] = (acc[todo.priority] || 0) + 1
      return acc
    }, {} as Record<string, number>),
  }
}

// UPDATE 작업 처리
async function handleUpdateTodos(
  supabase: Awaited<ReturnType<typeof createClient>>,
  conditions: QueryConditions,
  updates: UpdateData
) {
  // 시간 관련 조건 처리
  const today = new Date().toISOString().split('T')[0]

  // 조건에 따라 쿼리 구성
  let query = supabase.from('todos').select('*')

  if (conditions.due_date === '오늘') {
    query = query.eq('due_date', today)
  }

  if (conditions.title) {
    query = query.ilike('title', `%${conditions.title}%`)
  }

  if (conditions.category) {
    query = query.eq('category', conditions.category)
  }

  if (conditions.completed !== undefined) {
    query = query.eq('completed', conditions.completed)
  }

  const { data: targetTodos, error: findError } = await query

  if (findError) {
    throw findError
  }

  if (!targetTodos?.length) {
    return { message: '조건에 맞는 TODO를 찾을 수 없습니다.' }
  }

  // 시간 업데이트 처리
  const processedUpdates = { ...updates }
  if (updates.time || updates.시간) {
    // 시간 정보를 description에 추가하거나 별도 처리
    const timeInfo = updates.time || updates.시간
    processedUpdates.description = targetTodos[0].description
      ? `${targetTodos[0].description} (시간: ${timeInfo})`
      : `시간: ${timeInfo}`
    delete processedUpdates.time
    delete processedUpdates.시간
  }

  // 업데이트 실행
  const { data: updatedTodos, error: updateError } = await supabase
    .from('todos')
    .update(processedUpdates)
    .in(
      'id',
      targetTodos.map((todo) => todo.id)
    )
    .select()

  if (updateError) {
    throw updateError
  }

  return {
    message: `${updatedTodos.length}개의 TODO가 업데이트되었습니다.`,
    updated: updatedTodos,
  }
}

// DELETE 작업 처리
async function handleDeleteTodos(
  supabase: Awaited<ReturnType<typeof createClient>>,
  conditions: QueryConditions
) {
  const today = new Date().toISOString().split('T')[0]

  // 조건에 따라 삭제할 TODO 찾기
  let query = supabase.from('todos').select('*')

  if (conditions.due_date === '오늘') {
    query = query.eq('due_date', today)
  }

  if (conditions.completed === false) {
    query = query.eq('completed', false)
  }

  if (conditions.title) {
    query = query.ilike('title', `%${conditions.title}%`)
  }

  if (conditions.category) {
    query = query.eq('category', conditions.category)
  }

  const { data: targetTodos, error: findError } = await query

  if (findError) {
    throw findError
  }

  if (!targetTodos?.length) {
    return { message: '삭제할 TODO를 찾을 수 없습니다.' }
  }

  // 삭제 실행
  const { error: deleteError } = await supabase
    .from('todos')
    .delete()
    .in(
      'id',
      targetTodos.map((todo) => todo.id)
    )

  if (deleteError) {
    throw deleteError
  }

  return {
    message: `${targetTodos.length}개의 TODO가 삭제되었습니다.`,
    deleted: targetTodos,
  }
}
