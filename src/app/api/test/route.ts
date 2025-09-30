import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/test - Supabase 연결 테스트
export async function GET(request: NextRequest) {
  try {
    console.log('=== Supabase 연결 테스트 시작 ===')

    // 환경 변수 확인
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    console.log('Supabase URL:', supabaseUrl ? '✅ 설정됨' : '❌ 없음')
    console.log('Supabase Key:', supabaseKey ? '✅ 설정됨' : '❌ 없음')

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        {
          success: false,
          error: '환경 변수가 설정되지 않았습니다.',
          details: {
            url: !!supabaseUrl,
            key: !!supabaseKey,
          },
        },
        { status: 500 }
      )
    }

    // Supabase 클라이언트 생성
    const supabase = await createClient()
    console.log('Supabase 클라이언트 생성:', '✅ 성공')

    // 기본 연결 테스트 - 현재 시간 조회
    const { data: timeData, error: timeError } = await supabase
      .from('pg_stat_activity')
      .select('now()')
      .limit(1)

    if (timeError) {
      console.log('시간 조회 에러:', timeError)

      // 더 간단한 테스트 - auth 상태 확인
      const { data: authData, error: authError } = await supabase.auth.getSession()

      if (authError) {
        console.log('Auth 에러:', authError)
        return NextResponse.json(
          {
            success: false,
            error: 'Supabase 연결 실패',
            details: {
              timeError: timeError.message,
              authError: authError.message,
            },
          },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Supabase 연결 성공 (Auth 확인)',
        data: {
          authStatus: 'connected',
          session: authData.session ? 'exists' : 'none',
        },
      })
    }

    console.log('시간 조회 성공:', timeData)

    // 테이블 목록 조회 시도
    const { data: tablesData, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(10)

    console.log('테이블 조회 결과:', tablesError ? '❌ 실패' : '✅ 성공')
    if (tablesError) {
      console.log('테이블 조회 에러:', tablesError)
    } else {
      console.log(
        '사용 가능한 테이블:',
        tablesData?.map((t) => t.table_name)
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase 연결 테스트 완료',
      data: {
        connection: 'success',
        timestamp: timeData,
        tables: tablesData?.map((t) => t.table_name) || [],
        tablesError: tablesError?.message || null,
      },
    })
  } catch (error) {
    console.error('=== 연결 테스트 에러 ===')
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
