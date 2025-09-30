# TODO 2025 - 미래형 할 일 관리 앱

2025 UI 트렌드를 적용한 현대적인 TODO 관리 애플리케이션입니다. 글래스모피즘, 네온 효과, 부드러운 애니메이션을 통해 미래지향적인 사용자 경험을 제공합니다.

## ✨ 주요 기능

- **🎨 2025 UI 트렌드**: 글래스모피즘, 네온 글로우, 그라데이션 효과
- **📱 반응형 디자인**: 모든 디바이스에서 완벽한 사용자 경험
- **🌙 다크모드**: 눈에 편안한 다크 테마 기본 제공
- **⚡ 실시간 업데이트**: TanStack Query를 통한 효율적인 데이터 관리
- **🎯 스마트 필터링**: 카테고리, 우선순위, 상태별 필터링
- **🔍 실시간 검색**: 제목과 설명에서 즉시 검색
- **📊 통계 대시보드**: 할 일 진행 상황을 한눈에 파악
- **🎭 부드러운 애니메이션**: Framer Motion을 활용한 자연스러운 인터랙션

## 🛠 기술 스택

### Frontend

- **Next.js 15** - React 프레임워크
- **TypeScript** - 타입 안전성
- **Tailwind CSS** - 유틸리티 퍼스트 CSS 프레임워크
- **Framer Motion** - 애니메이션 라이브러리
- **Zustand** - 상태 관리
- **TanStack Query** - 서버 상태 관리
- **React Hook Form** - 폼 관리
- **Zod** - 스키마 검증

### Backend & Database

- **Supabase** - Backend as a Service
- **PostgreSQL** - 관계형 데이터베이스
- **Next.js API Routes** - API 엔드포인트

### UI/UX

- **Lucide React** - 아이콘 라이브러리
- **React Hot Toast** - 알림 시스템
- **date-fns** - 날짜 처리

## 🚀 시작하기

### 1. 프로젝트 클론

```bash
git clone <repository-url>
cd todo-app-2025
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Supabase 데이터베이스 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트를 생성합니다.
2. `supabase-setup.sql` 파일의 내용을 Supabase SQL Editor에서 실행합니다.
3. 테이블과 샘플 데이터가 생성됩니다.

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 앱을 확인하세요.

## 📁 프로젝트 구조

```
todo-app-2025/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   └── todos/         # TODO API 엔드포인트
│   │   ├── globals.css        # 글로벌 스타일
│   │   ├── layout.tsx         # 루트 레이아웃
│   │   └── page.tsx           # 메인 페이지
│   ├── components/            # React 컴포넌트
│   │   ├── providers/         # Context Providers
│   │   └── ui/               # UI 컴포넌트
│   ├── hooks/                # 커스텀 훅
│   ├── lib/                  # 유틸리티 라이브러리
│   │   ├── supabase/         # Supabase 클라이언트
│   │   └── validations/      # Zod 스키마
│   ├── store/                # Zustand 스토어
│   └── types/                # TypeScript 타입 정의
├── supabase-setup.sql        # 데이터베이스 설정 스크립트
└── tailwind.config.ts        # Tailwind 설정
```

## 🎨 디자인 시스템

### 색상 팔레트

- **Primary**: Blue (#3b82f6)
- **Success**: Green (#10b981)
- **Warning**: Orange (#f59e0b)
- **Error**: Red (#ef4444)
- **Purple**: Purple (#8b5cf6)

### 카테고리별 색상

- **업무**: 파란색 (#3b82f6)
- **개인**: 초록색 (#10b981)
- **건강**: 주황색 (#f59e0b)
- **쇼핑**: 빨간색 (#ef4444)
- **학습**: 보라색 (#8b5cf6)

### 애니메이션

- **Fade In**: 부드러운 페이드 인 효과
- **Slide Up**: 아래에서 위로 슬라이드
- **Bounce In**: 탄성 있는 등장 효과
- **Float**: 부유하는 듯한 애니메이션

## 📱 주요 화면

### 메인 대시보드

- 통계 카드 (전체, 완료, 진행중, 긴급)
- 검색 및 필터 기능
- TODO 목록 (카드 형태)

### TODO 관리

- 새 TODO 추가/수정 모달
- 카테고리 및 우선순위 설정
- 마감일 설정
- 실시간 상태 업데이트

## 🔧 개발 가이드

### 새 컴포넌트 추가

```typescript
// src/components/ui/NewComponent.tsx
'use client'

import { motion } from 'framer-motion'

interface NewComponentProps {
  // props 정의
}

export default function NewComponent({}: NewComponentProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='glass-card p-4'>
      {/* 컴포넌트 내용 */}
    </motion.div>
  )
}
```

### API 엔드포인트 추가

```typescript
// src/app/api/new-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    // API 로직
    return NextResponse.json({ success: true, data: [] })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
```

## 🚀 배포

### Vercel 배포

1. GitHub에 프로젝트를 푸시합니다.
2. [Vercel](https://vercel.com)에서 프로젝트를 import합니다.
3. 환경 변수를 설정합니다.
4. 배포를 완료합니다.

### 환경 변수 (프로덕션)

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🙏 감사의 말

- [Next.js](https://nextjs.org/) - React 프레임워크
- [Supabase](https://supabase.com/) - Backend as a Service
- [Tailwind CSS](https://tailwindcss.com/) - CSS 프레임워크
- [Framer Motion](https://www.framer.com/motion/) - 애니메이션 라이브러리
- [Lucide](https://lucide.dev/) - 아이콘 라이브러리

---

**TODO 2025** - 미래를 향한 할 일 관리의 새로운 경험 ✨
# Test commit to trigger GitHub Actions
