# 🚀 Vercel CI/CD 설정 가이드

## 📋 설정 완료 항목

✅ **GitHub Actions 워크플로우**: Vercel 전용 CI/CD 파이프라인 생성  
✅ **Next.js 설정**: Vercel 배포에 최적화된 구성  
✅ **Vercel 설정**: API 타임아웃 및 CORS 설정 추가

## 🔧 1. GitHub Repository 설정

### 1.1 필요한 GitHub Secrets 추가

GitHub 리포지토리의 `Settings > Secrets and variables > Actions`에서 다음 secrets을 추가하세요:

```bash
# Vercel 관련
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id

# 앱 환경변수
GROQ_API_KEY=your_groq_api_key
GEMMA_API_BASE_URL=https://api.groq.com/openai/v1
GEMMA_MODEL_NAME=gemma2-9b-it
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
```

### 1.2 Vercel 토큰 및 ID 얻기

#### Vercel Token:

1. [Vercel Dashboard](https://vercel.com/account/tokens) 접속
2. "Create Token" 클릭
3. 토큰 이름 입력 (예: "GitHub-Actions")
4. 생성된 토큰을 `VERCEL_TOKEN`으로 저장

#### Organization ID & Project ID:

```bash
# Vercel CLI로 정보 조회
npx vercel link
npx vercel env ls

# 또는 .vercel/project.json 파일에서 확인
cat .vercel/project.json
```

## 🏗️ 2. Vercel Dashboard 설정

### 2.1 환경변수 설정

[Vercel Dashboard](https://vercel.com) > 프로젝트 > Settings > Environment Variables에서 추가:

```
GROQ_API_KEY=your_groq_api_key
GEMMA_API_BASE_URL=https://api.groq.com/openai/v1
GEMMA_MODEL_NAME=gemma2-9b-it
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
```

### 2.2 자동 배포 설정

1. Vercel Dashboard > 프로젝트 > Settings > Git
2. "Auto-deploy branches" 설정 확인
3. `main` 브랜치가 포함되어 있는지 확인

## 🔄 3. CI/CD 워크플로우 동작 방식

### Pull Request 시:

1. 🧪 **테스트 & 빌드**: 코드 품질 검증
2. 🔍 **미리보기 배포**: Vercel Preview 환경에 배포
3. 💬 **PR 댓글**: 미리보기 URL을 PR에 자동 댓글

### Main 브랜치 Push 시:

1. 🧪 **테스트 & 빌드**: 코드 품질 검증
2. 🚀 **프로덕션 배포**: Vercel Production에 자동 배포
3. 📣 **배포 알림**: 성공/실패 알림

## 🎯 4. 테스트 방법

### 4.1 PR 배포 테스트

```bash
# 새 브랜치 생성
git checkout -b feature/test-ci-cd

# 작은 변경사항 추가
echo "# Test CI/CD" >> README.md

# 커밋 및 푸시
git add .
git commit -m "Test: CI/CD pipeline"
git push origin feature/test-ci-cd

# GitHub에서 PR 생성 후 Actions 탭에서 확인
```

### 4.2 프로덕션 배포 테스트

```bash
# Main 브랜치로 변경사항 머지 후
git checkout main
git merge feature/test-ci-cd
git push origin main

# Actions 탭에서 배포 진행상황 확인
```

## 🎉 5. 완료!

이제 다음과 같은 자동화가 적용됩니다:

- ✅ **main 브랜치에 커밋하면 자동 배포**
- ✅ **PR 생성시 미리보기 배포**
- ✅ **빌드 실패시 자동 알림**
- ✅ **환경변수 자동 주입**

---

### 🔍 문제 해결

**배포 실패시 확인사항:**

1. GitHub Secrets이 모두 설정되었는지 확인
2. Vercel Dashboard의 환경변수 설정 확인
3. Actions 로그에서 구체적인 에러 메시지 확인

**도움이 필요하면:**

- GitHub Actions 로그 확인
- Vercel Dashboard의 배포 로그 확인
- 환경변수가 올바르게 설정되었는지 재확인
