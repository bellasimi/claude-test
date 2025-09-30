# GitHub Secrets 설정 가이드

이 프로젝트의 CI/CD가 정상 작동하려면 다음 GitHub Secrets을 설정해야 합니다.

## 🔧 GitHub Secrets 설정 방법

1. GitHub 저장소 페이지로 이동: https://github.com/bellasimi/claude-test
2. `Settings` → `Secrets and variables` → `Actions` 클릭
3. `New repository secret` 버튼으로 아래 값들을 하나씩 추가

## 📋 필수 Secrets 목록

### Supabase 설정
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: [실제 Supabase 프로젝트 URL]

Name: NEXT_PUBLIC_SUPABASE_ANON_KEY  
Value: [실제 Supabase anon key]

Name: SUPABASE_SERVICE_ROLE_KEY
Value: [실제 Supabase service role key]
```

### Groq API 설정 (AI 기능용)
```
Name: GROQ_API_KEY
Value: [실제 Groq API key]

Name: GEMMA_API_BASE_URL
Value: https://api.groq.com/openai/v1

Name: GEMMA_MODEL_NAME
Value: gemma2-9b-it
```

### Vercel 배포 설정 (선택사항)
```
Name: VERCEL_TOKEN
Value: [실제 Vercel token]

Name: VERCEL_ORG_ID
Value: [실제 Vercel organization ID]

Name: VERCEL_PROJECT_ID
Value: [실제 Vercel project ID]
```

## 🔍 값 찾는 방법

### Supabase 값들:
1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택 → Settings → API
3. 필요한 값들을 복사

### Groq API 키:
1. [Groq Console](https://console.groq.com) 접속
2. API Keys 섹션에서 키 생성/복사

### Vercel 값들:
1. [Vercel Dashboard](https://vercel.com) 접속
2. Settings → Tokens에서 토큰 생성
3. 프로젝트 설정에서 ORG_ID, PROJECT_ID 확인

## ✅ 설정 완료 후

모든 Secrets이 설정되면:

1. 새로운 커밋을 main 브랜치에 푸시
2. GitHub Actions가 자동으로 실행됨
3. 빌드 및 배포가 성공적으로 완료됨

## 🚨 주의사항

- **절대 실제 키를 코드에 하드코딩하지 마세요**
- `.env.production` 파일은 예시용이며, 실제 값은 GitHub Secrets에만 저장
- 모든 키는 안전하게 관리하고 정기적으로 갱신하세요