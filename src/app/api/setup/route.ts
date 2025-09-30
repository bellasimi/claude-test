import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/setup - todos 테이블 생성
export async function POST(request: NextRequest) {
  try {
    console.log('=== todos 테이블 생성 시작 ===')

    const supabase = await createClient()

    // 1. todos 테이블 생성
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS todos (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT FALSE NOT NULL,
        priority VARCHAR(10) DEFAULT 'medium' NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
        category VARCHAR(20) DEFAULT 'personal' NOT NULL CHECK (category IN ('work', 'personal', 'health', 'shopping', 'learning')),
        due_date DATE,
        order_index INTEGER DEFAULT 0 NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
    `

    const { data: createResult, error: createError } = await supabase.rpc('exec_sql', {
      sql: createTableQuery,
    })

    if (createError) {
      console.log('테이블 생성 에러:', createError)

      // RPC가 없다면 직접 SQL 실행 시도
      const { error: directError } = await supabase.from('todos').select('id').limit(1)

      if (directError && directError.code === 'PGRST116') {
        return NextResponse.json(
          {
            success: false,
            error:
              'todos 테이블이 존재하지 않습니다. Supabase Dashboard에서 수동으로 생성해주세요.',
            sqlScript: createTableQuery,
            instructions: [
              '1. Supabase Dashboard → SQL Editor로 이동',
              '2. 위의 sqlScript를 복사하여 실행',
              '3. 또는 supabase-setup.sql 파일 내용을 실행',
            ],
          },
          { status: 400 }
        )
      }
    }

    // 2. 샘플 데이터 삽입
    const sampleData = [
      {
        title: '프로젝트 기획서 작성',
        description: '2025년 신규 프로젝트 기획서를 작성해야 합니다.',
        priority: 'high',
        category: 'work',
        due_date: '2025-01-15',
      },
      {
        title: '운동하기',
        description: '주 3회 이상 운동하기',
        priority: 'medium',
        category: 'health',
      },
      {
        title: '장보기',
        description: '주말 장보기 - 우유, 빵, 과일',
        priority: 'low',
        category: 'shopping',
        due_date: '2025-01-10',
      },
    ]

    const { data: insertResult, error: insertError } = await supabase
      .from('todos')
      .insert(sampleData)
      .select()

    if (insertError) {
      console.log('샘플 데이터 삽입 에러:', insertError)
    }

    // 3. 생성된 테이블 확인
    const { data: todos, error: selectError } = await supabase.from('todos').select('*').limit(5)

    return NextResponse.json({
      success: true,
      message: 'todos 테이블 설정 완료',
      data: {
        tableCreated: !createError,
        sampleDataInserted: !insertError,
        todos: todos || [],
        errors: {
          create: createError?.message || null,
          insert: insertError?.message || null,
          select: selectError?.message || null,
        },
      },
    })
  } catch (error) {
    console.error('=== 테이블 설정 에러 ===')
    console.error('Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// GET /api/setup - 현재 테이블 상태 확인
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // todos 테이블 존재 여부 확인
    const { data: todos, error: todosError } = await supabase.from('todos').select('*').limit(5)

    const tableExists = !todosError || todosError.code !== 'PGRST116'

    return NextResponse.json({
      success: true,
      data: {
        tableExists,
        todosCount: todos?.length || 0,
        todos: todos || [],
        error: todosError?.message || null,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
