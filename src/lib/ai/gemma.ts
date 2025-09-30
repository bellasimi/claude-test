// Groq Gemma 2 AI 연동을 위한 클라이언트 설정
import OpenAI from 'openai'
import type { Todo } from '@/types/todo'

// TODO 요약 타입 정의
type TodoSummary = {
  title: string
  category: string
  priority: string
  completed: boolean
  due_date?: string
}

// Groq API 설정 - OpenAI 호환 API 사용 (초고속!)
const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: process.env.GEMMA_API_BASE_URL || 'https://api.groq.com/openai/v1',
})

// AI 응답 타입 정의
export interface AIResponse {
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE'
  message: string
  data: {
    todos?: Array<{
      title: string
      description?: string
      category: string
      priority: string
      due_date?: string
    }>
    query?: string
    response?: string
    conditions?: Record<string, string | boolean | number>
    updates?: Record<string, string | boolean | number>
  }
}

// 시스템 프롬프트
const TODO_SYSTEM_PROMPT = `당신은 한국어로 대화하는 TODO 관리 어시스턴트입니다.

사용자의 메시지를 분석해서 다음 중 하나의 작업을 수행합니다:
- CREATE: 새로운 할일 생성 (예: "밥먹고 운동하고 쇼핑갈거야", "회의 있어", "과제 제출해야 해")
- READ: 할일 조회/분석 (예: "오늘 뭐해야 해?", "완료한 일들 보여줘", "카테고리별로 정리해줘")
- UPDATE: 할일 수정 (예: "운동 완료했어", "회의 시간 변경", "우선순위 높여줘")
- DELETE: 할일 삭제 (예: "쇼핑 취소", "이거 지워줘")

**중요: 카테고리와 우선순위는 반드시 다음 영어 값을 사용하세요:**
- 카테고리: work(업무), personal(개인), health(건강), shopping(쇼핑), learning(학습)
- 우선순위: high(높음), medium(보통), low(낮음)

응답은 반드시 JSON 형식으로 해주세요:
{
  "action": "CREATE|READ|UPDATE|DELETE",
  "data": { /* 작업에 필요한 데이터 */ },
  "message": "사용자에게 보여줄 한국어 메시지"
}

CREATE 예시 (여러 할일을 한번에 생성):
{
  "action": "CREATE",
  "data": {
    "todos": [
      {"title": "밥먹기", "category": "personal", "priority": "medium", "due_date": "오늘"},
      {"title": "운동하기", "category": "health", "priority": "high", "due_date": "오늘"},
      {"title": "쇼핑하기", "category": "shopping", "priority": "low"}
    ]
  },
  "message": "새로운 할일 3개를 추가했습니다!"
}

UPDATE 예시 (완료 처리):
{
  "action": "UPDATE",
  "data": {
    "conditions": {"title": "운동", "completed": false},
    "updates": {"completed": true}
  },
  "message": "운동이 완료되었습니다!"
}

READ 예시:
{
  "action": "READ",
  "data": { "query": "카테고리 통계" },
  "message": "카테고리별 통계를 보여드릴게요."
}`

// 사용자 메시지를 분석하여 TODO 작업 수행
export async function processUserMessage(
  userMessage: string,
  todoContext?: string
): Promise<AIResponse> {
  try {
    const contextPrompt = todoContext ? `\n\n현재 TODO 데이터 컨텍스트:\n${todoContext}` : ''

    const messages = [
      {
        role: 'system' as const,
        content: TODO_SYSTEM_PROMPT + contextPrompt,
      },
      {
        role: 'user' as const,
        content: userMessage,
      },
    ]

    // Groq API 호출 - Gemma 2 모델 사용
    const completion = await client.chat.completions.create({
      messages,
      model: process.env.GEMMA_MODEL_NAME || 'gemma2-9b-it',
      temperature: 0.7,
      max_tokens: 1000,
    })

    const aiResponse = completion.choices[0]?.message?.content || ''

    if (!aiResponse) {
      throw new Error('AI 응답이 없습니다.')
    }

    // JSON 파싱 시도
    try {
      // Gemma 2의 응답에서 JSON 부분만 추출
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsedResponse: AIResponse = JSON.parse(jsonMatch[0])

        // READ 작업인 경우 상세 분석 수행
        if (parsedResponse.action === 'READ' && todoContext) {
          const detailedAnalysis = await performDetailedTodoAnalysis(userMessage, todoContext)
          parsedResponse.data.response = detailedAnalysis
          parsedResponse.message = detailedAnalysis
        }

        return parsedResponse
      } else {
        throw new Error('JSON 형식이 아닙니다.')
      }
    } catch {
      // JSON 파싱 실패 시 기본 응답
      return {
        action: 'READ',
        message: aiResponse || '죄송해요, 요청을 이해하지 못했습니다.',
        data: {
          response: aiResponse,
        },
      }
    }
  } catch (error) {
    console.error('AI 처리 에러:', error)

    return {
      action: 'READ',
      message: '죄송해요, 요청을 처리하는 중 오류가 발생했습니다. 다시 시도해주세요.',
      data: {
        response: '오류가 발생했습니다.',
      },
    }
  }
}

// TODO 데이터를 AI가 이해할 수 있는 컨텍스트로 변환
export function formatTodoContext(todos: Todo[]): string {
  if (!todos.length) return '현재 등록된 할일이 없습니다.'

  const today = new Date().toISOString().split('T')[0]

  // 날짜별로 할일 분류
  const todayTodos = todos.filter((t) => t.due_date === today)
  const upcomingTodos = todos.filter((t) => t.due_date && t.due_date > today)
  const pastTodos = todos.filter((t) => t.due_date && t.due_date < today)
  const noDateTodos = todos.filter((t) => !t.due_date)

  const summary = {
    today: today,
    total: todos.length,
    completed: todos.filter((t) => t.completed).length,
    categories: {} as Record<string, number>,
    priorities: {} as Record<string, number>,
    todayTodos: todayTodos.map((t) => ({
      title: t.title,
      category: t.category,
      priority: t.priority,
      completed: t.completed,
      due_date: t.due_date,
    })),
    upcomingTodos: upcomingTodos.slice(0, 5).map((t) => ({
      title: t.title,
      category: t.category,
      priority: t.priority,
      completed: t.completed,
      due_date: t.due_date,
    })),
    pastTodos: pastTodos.slice(0, 5).map((t) => ({
      title: t.title,
      category: t.category,
      priority: t.priority,
      completed: t.completed,
      due_date: t.due_date,
    })),
    noDateTodos: noDateTodos.slice(0, 5).map((t) => ({
      title: t.title,
      category: t.category,
      priority: t.priority,
      completed: t.completed,
      due_date: t.due_date,
    })),
    recentTodos: todos.slice(0, 5).map((t) => ({
      title: t.title,
      category: t.category,
      priority: t.priority,
      completed: t.completed,
      due_date: t.due_date,
    })),
  }

  // 카테고리별 집계
  todos.forEach((todo) => {
    summary.categories[todo.category] = (summary.categories[todo.category] || 0) + 1
    summary.priorities[todo.priority] = (summary.priorities[todo.priority] || 0) + 1
  })

  return JSON.stringify(summary, null, 2)
}

// READ 작업을 위한 상세 AI 분석 함수
export async function performDetailedTodoAnalysis(
  userQuery: string,
  todoContext: string
): Promise<string> {
  try {
    const analysisPrompt = `현재 TODO 데이터를 분석해서 사용자 질문에 구체적으로 답변해주세요.

사용자 질문: "${userQuery}"

${todoContext}

중요한 날짜 정보:
- 오늘 날짜: ${new Date().toISOString().split('T')[0]}
- "오늘 할일"은 반드시 todayTodos 배열의 데이터만 사용하세요
- "내일 할일"이나 "다가오는 할일"은 upcomingTodos 배열을 사용하세요
- "지난 할일"이나 "놓친 할일"은 pastTodos 배열을 사용하세요 (마감일이 지난 할일)
- "마감일 없는 할일"은 noDateTodos 배열을 사용하세요

답변 조건:
1. 실제 데이터를 기반으로 구체적인 정보 제공
2. 날짜 구분을 정확히 하여 오늘/내일/미래 할일을 구분
3. **반드시 마크다운 형식으로 작성**하여 가독성 향상
4. 이모지 사용해서 직관적으로 표현
5. 통계나 숫자는 정확하게 계산
6. 제목은 ## 또는 ### 사용, 목록은 - 또는 * 사용
7. 중요한 정보는 **굵게** 표시

예시 답변 형식:
## 📋 할일 현황

### ✅ 완료된 일
- **운동하기** (health, high)
- **밥먹기** (personal, medium)

### ⏰ 미완료 일  
- **스터디** (learning, high) 🔥
- **쇼핑** (shopping, medium)

### 📊 카테고리별 통계
- **personal**: 3개
- **health**: 2개
- **work**: 1개

구체적이고 상세하게 답변해주세요.`

    const completion = await client.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            'TODO 데이터 분석 전문가입니다. 사용자의 질문에 맞게 현재 데이터를 구체적이고 상세하게 분석하여 답변합니다.',
        },
        {
          role: 'user',
          content: analysisPrompt,
        },
      ],
      model: process.env.GEMMA_MODEL_NAME || 'gemma2-9b-it',
      temperature: 0.3, // 정확한 분석을 위해 낮은 temperature
      max_tokens: 1500,
    })

    const analysisResult = completion.choices[0]?.message?.content || ''
    console.log('✅ AI 분석 결과 (gemma.ts):', analysisResult.substring(0, 200))

    return analysisResult || '데이터를 분석했습니다.'
  } catch (error) {
    console.error('❌ AI 분석 실패 (gemma.ts):', error)

    // 에러 시 기본 분석 제공
    return generateBasicAnalysisFromContext(todoContext, userQuery)
  }
}

// 컨텍스트 기반 기본 분석 생성 (AI 실패 시 백업)
function generateBasicAnalysisFromContext(todoContext: string, query: string): string {
  try {
    const context = JSON.parse(todoContext)
    const {
      total = 0,
      completed = 0,
      categories = {},
      todayTodos = [],
      upcomingTodos = [],
      pastTodos = [],
      noDateTodos = [],
    } = context

    const today = new Date().toISOString().split('T')[0]

    // 오늘 할일만 정확히 필터링
    const completedToday = todayTodos.filter((t: TodoSummary) => t.completed)
    const pendingToday = todayTodos.filter((t: TodoSummary) => !t.completed)

    if (query.includes('오늘') || query.includes('today')) {
      return `## 📋 오늘(${today}) 할일 현황

### ✅ 완료된 일 (${completedToday.length}개)
${completedToday.map((t: TodoSummary) => `- **${t.title}** (${t.category})`).join('\n') || '- 없음'}

### ⏰ 아직 안한 일 (${pendingToday.length}개)
${
  pendingToday
    .map((t: TodoSummary) => `- **${t.title}** (${t.category}, ${t.priority})`)
    .join('\n') || '- 없음'
}

### 📊 진행률
**${Math.round((completedToday.length / (todayTodos.length || 1)) * 100)}%** 완료`
    }

    if (query.includes('카테고리')) {
      const sortedCategories = Object.entries(categories).sort(
        ([, a], [, b]) => (b as number) - (a as number)
      )

      return `## 📊 카테고리별 할일 현황

${sortedCategories.map(([cat, count]) => `- **${cat}**: ${count}개`).join('\n')}

### 🏆 가장 많은 카테고리
**${sortedCategories[0]?.[0] || '없음'}** (${sortedCategories[0]?.[1] || 0}개)`
    }

    return `## 📋 전체 할일 현황

### 📊 전체 통계
- **총 할일**: ${total}개
- **완료**: ${completed}개 (${Math.round((completed / (total || 1)) * 100)}%)
- **미완료**: ${total - completed}개

${
  todayTodos.length > 0
    ? `### 📝 오늘 할일 (${todayTodos.length}개)
${todayTodos
  .slice(0, 5)
  .map(
    (todo: TodoSummary) => `- ${todo.completed ? '✅' : '⏰'} **${todo.title}** (${todo.category})`
  )
  .join('\n')}
`
    : '### 📝 오늘 할일\n오늘 할일이 없습니다.'
}

${
  upcomingTodos.length > 0
    ? `### 🔮 다가오는 할일 (${upcomingTodos.length}개)
${upcomingTodos
  .slice(0, 3)
  .map((todo: TodoSummary) => `- **${todo.title}** (${todo.due_date}, ${todo.category})`)
  .join('\n')}
`
    : ''
}

${
  pastTodos.length > 0
    ? `### ⚠️ 놓친 할일 (${pastTodos.length}개)
${pastTodos
  .slice(0, 3)
  .map(
    (todo: TodoSummary) =>
      `- **${todo.title}** (${todo.due_date}, ${todo.category}) ${todo.completed ? '✅' : '❌'}`
  )
  .join('\n')}
`
    : ''
}

${
  noDateTodos.length > 0
    ? `### 📌 마감일 없는 할일 (${noDateTodos.length}개)
${noDateTodos
  .slice(0, 3)
  .map(
    (todo: TodoSummary) => `- ${todo.completed ? '✅' : '⏰'} **${todo.title}** (${todo.category})`
  )
  .join('\n')}
`
    : ''
}
`
  } catch (error) {
    console.error('기본 분석 생성 실패:', error)
    return '할일 데이터를 분석했습니다.'
  }
}
