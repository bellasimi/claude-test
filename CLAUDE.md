# Claude와 함께하는 현대적 웹 앱 개발 가이드

> 이 문서는 Claude AI와 함께 TODO 2025 앱을 개발하고 배포한 실제 경험을 바탕으로 작성되었습니다.

## 📋 목차

1. [프로젝트 초기 설정](#프로젝트-초기-설정)
2. [현대적 기술 스택 선택](#현대적-기술-스택-선택)
3. [UI/UX 트렌드 적용](#uiux-트렌드-적용)
4. [데이터베이스 연동](#데이터베이스-연동)
5. [상태 관리](#상태-관리)
6. [배포 및 CI/CD](#배포-및-cicd)
7. [문제 해결 패턴](#문제-해결-패턴)
8. [베스트 프랙티스](#베스트-프랙티스)

---

## 🚀 프로젝트 초기 설정

### 1. Next.js 15 프로젝트 생성

```bash
npx create-next-app@latest todo-app-2025 --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

### 2. 핵심 의존성 설치

```bash
npm install @supabase/supabase-js @supabase/ssr
npm install @tanstack/react-query @tanstack/react-query-devtools
npm install zustand
npm install framer-motion
npm install react-hook-form @hookform/resolvers/zod
npm install zod
npm install react-hot-toast
npm install lucide-react
npm install date-fns
```

### 3. 프로젝트 구조 설계

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── globals.css        # 글로벌 스타일
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 메인 페이지
├── components/            # React 컴포넌트
│   ├── providers/         # Context Providers
│   └── ui/               # UI 컴포넌트
├── hooks/                # 커스텀 훅
├── lib/                  # 유틸리티 라이브러리
├── store/                # 상태 관리
└── types/                # TypeScript 타입 정의
```

---

## 🛠 현대적 기술 스택 선택

### Frontend 스택

- **Next.js 15**: React 프레임워크 (App Router 사용)
- **TypeScript**: 타입 안전성
- **Tailwind CSS**: 유틸리티 퍼스트 CSS
- **Framer Motion**: 애니메이션 라이브러리

### Backend & Database

- **Supabase**: Backend as a Service
- **PostgreSQL**: 관계형 데이터베이스

### 상태 관리

- **Zustand**: 클라이언트 상태 관리
- **TanStack Query**: 서버 상태 관리

### 폼 & 검증

- **React Hook Form**: 폼 관리
- **Zod**: 스키마 검증

---

## 🎨 UI/UX 트렌드 적용

### 2025 디자인 트렌드

1. **글래스모피즘 (Glassmorphism)**

   ```css
   .glass-card {
     @apply bg-white/10 dark:bg-gray-800/50 backdrop-blur-md;
     @apply border border-white/20 dark:border-gray-700/50;
     @apply shadow-glass hover:shadow-glass-dark;
     @apply rounded-2xl transition-all duration-300;
   }
   ```

2. **네온 글로우 효과**

   ```css
   .shadow-neon {
     box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
   }
   ```

3. **그라데이션 배경**

   ```css
   body {
     @apply bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900;
   }
   ```

4. **부드러운 애니메이션**
   ```tsx
   <motion.div
     initial={{ opacity: 0, y: 20 }}
     animate={{ opacity: 1, y: 0 }}
     transition={{ delay: index * 0.1 }}
   >
   ```

### 색상 시스템

```typescript
const colors = {
  primary: '#3b82f6', // Blue
  success: '#10b981', // Green
  warning: '#f59e0b', // Orange
  error: '#ef4444', // Red
  purple: '#8b5cf6', // Purple
}
```

---

## 🗄 데이터베이스 연동

### 1. Supabase 설정

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
```

### 2. 서버 사이드 클라이언트

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = async () => {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    }
  )
}
```

### 3. 데이터베이스 스키마

```sql
CREATE TABLE todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE NOT NULL,
  priority VARCHAR(10) DEFAULT 'medium' NOT NULL,
  category VARCHAR(20) DEFAULT 'personal' NOT NULL,
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

---

## 🔄 상태 관리

### 1. Zustand 스토어

```typescript
// store/todoStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface TodoStore {
  filter: 'all' | 'pending' | 'completed'
  searchTerm: string
  selectedCategory: Category | null
  selectedPriority: Priority | null
  isFormOpen: boolean
  isDarkMode: boolean

  setFilter: (filter: 'all' | 'pending' | 'completed') => void
  setSearchTerm: (term: string) => void
  // ... 기타 액션들
}

export const useTodoStore = create<TodoStore>()(
  persist(
    (set) => ({
      filter: 'all',
      searchTerm: '',
      selectedCategory: null,
      selectedPriority: null,
      isFormOpen: false,
      isDarkMode: true,

      setFilter: (filter) => set({ filter }),
      setSearchTerm: (searchTerm) => set({ searchTerm }),
      // ... 기타 구현
    }),
    {
      name: 'todo-store',
      partialize: (state) => ({
        isDarkMode: state.isDarkMode,
        filter: state.filter,
      }),
    }
  )
)
```

### 2. TanStack Query 훅

```typescript
// hooks/useTodos.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export const useTodos = (params: TodoQueryParams) => {
  return useQuery({
    queryKey: ['todos', params],
    queryFn: () => fetchTodos(params),
    staleTime: 1000 * 60 * 5, // 5분
  })
}

export const useCreateTodo = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}
```

---

## 🚀 배포 및 CI/CD

### 1. Vercel 설정 파일

```json
// vercel.json
{
  "version": 2,
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "regions": ["icn1"]
}
```

### 2. 환경 변수 설정

```bash
# Vercel CLI로 환경 변수 추가
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
```

### 3. 배포 명령어

```bash
# 프로덕션 배포
vercel --prod --yes

# 배포 상태 확인
vercel ls

# 배포 정보 확인
vercel inspect <deployment-url>
```

---

## 🔧 문제 해결 패턴

### 1. Tailwind CSS v4 호환성

**문제**: `@tailwind base` 등이 v4에서 deprecated
**해결**:

```css
/* 기존 */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* v4 호환 */
@import 'tailwindcss/preflight';
@tailwind utilities;
```

### 2. Vercel 배포 에러

**문제**: Function Runtime 에러
**해결**: `vercel.json`에서 불필요한 설정 제거

```json
{
  // ❌ 제거
  "functions": {
    "src/app/api/**/*.ts": {
      "runtime": "nodejs20.x"
    }
  },
  "name": "project-name", // deprecated

  // ✅ 유지
  "version": 2,
  "framework": "nextjs"
}
```

### 3. 환경 변수 참조 에러

**문제**: `@supabase_url` 같은 참조가 작동하지 않음
**해결**: Vercel CLI로 직접 환경 변수 설정

### 4. 타입 에러 해결

**문제**: 타입 불일치
**해결**: 일관된 타입 정의 사용

```typescript
// types/todo.ts에서 중앙 관리
export type CreateTodoData = z.infer<typeof todoCreateSchema>
```

---

## ✨ 베스트 프랙티스

### 1. 컴포넌트 설계

- **단일 책임 원칙**: 각 컴포넌트는 하나의 역할만
- **재사용성**: 공통 UI 컴포넌트 분리
- **타입 안전성**: 모든 props에 타입 정의

### 2. 상태 관리

- **클라이언트 상태**: Zustand (UI 상태, 사용자 설정)
- **서버 상태**: TanStack Query (API 데이터)
- **폼 상태**: React Hook Form (폼 데이터)

### 3. 스타일링

- **일관성**: 디자인 시스템 구축
- **반응형**: 모바일 퍼스트 접근
- **성능**: CSS-in-JS 대신 Tailwind CSS 사용

### 4. API 설계

- **RESTful**: 명확한 엔드포인트 구조
- **에러 처리**: 일관된 에러 응답 형식
- **타입 안전성**: Zod로 입력 검증

### 5. 배포 전략

- **환경 분리**: development, staging, production
- **자동화**: GitHub → Vercel 자동 배포
- **모니터링**: 배포 상태 및 에러 추적

---

## 📚 추천 학습 자료

### 공식 문서

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TanStack Query](https://tanstack.com/query/latest)

### 디자인 트렌드

- [Glassmorphism Generator](https://glassmorphism.com/)
- [UI/UX Trends 2025](https://www.figma.com/community)

### 배포 및 DevOps

- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Actions](https://docs.github.com/en/actions)

---

## 🎯 다음 프로젝트를 위한 체크리스트

### 프로젝트 시작 전

- [ ] 요구사항 명확히 정의
- [ ] 기술 스택 선택 및 검증
- [ ] 디자인 시스템 계획
- [ ] 데이터베이스 스키마 설계

### 개발 중

- [ ] 타입 안전성 확보
- [ ] 컴포넌트 재사용성 고려
- [ ] 성능 최적화 (이미지, 번들 크기)
- [ ] 접근성 (a11y) 고려

### 배포 전

- [ ] 환경 변수 설정
- [ ] 빌드 에러 해결
- [ ] 크로스 브라우저 테스트
- [ ] 모바일 반응형 확인

### 배포 후

- [ ] 실제 사용자 테스트
- [ ] 성능 모니터링
- [ ] 에러 추적 설정
- [ ] 문서화 완료

---

## 💡 Claude와 협업 팁

### 효과적인 질문 방법

1. **구체적인 요구사항 제시**: "TODO 앱을 만들어줘" → "Next.js 15와 Supabase를 사용한 TODO 앱을 만들어줘"
2. **기술 스택 명시**: 사용하고 싶은 라이브러리나 프레임워크 명시
3. **단계별 진행**: 큰 작업을 작은 단위로 나누어 요청

### 문제 해결 시

1. **에러 메시지 공유**: 정확한 에러 메시지와 상황 설명
2. **현재 상태 설명**: 어떤 단계에서 문제가 발생했는지
3. **시도한 방법**: 이미 시도해본 해결 방법들

### 코드 리뷰 요청

1. **특정 부분 지정**: 전체 코드보다는 특정 함수나 컴포넌트
2. **개선 목표 명시**: 성능, 가독성, 유지보수성 등
3. **제약사항 공유**: 기존 코드와의 호환성, 라이브러리 제한 등

---

**📝 작성일**: 2025년 9월 29일  
**📋 프로젝트**: TODO 2025  
**🔗 배포 URL**: https://todo-app-2025-mu.vercel.app

> 이 가이드는 실제 프로젝트 경험을 바탕으로 작성되었으며, 지속적으로 업데이트될 예정입니다.
