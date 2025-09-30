# 🚀 CI/CD 설정 가이드

이 가이드는 GitHub Actions를 통한 자동 배포 설정 방법을 안내합니다.

## 📋 필수 GitHub Secrets 설정

GitHub Repository → Settings → Secrets and variables → Actions에서 다음 secrets을 설정하세요:

### 🔑 기본 환경 변수

```
GROQ_API_KEY=your_groq_api_key_here
GEMMA_API_BASE_URL=https://api.groq.com/openai/v1
GEMMA_MODEL_NAME=gemma2-9b-it
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## 🌐 배포 플랫폼별 설정

### 1. Vercel 배포 (추천) ⚡

Vercel Secrets:

```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
```

#### Vercel 토큰 발급 방법:

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. Settings → Tokens → Create Token
3. 생성된 토큰을 `VERCEL_TOKEN`에 설정

#### ORG ID 및 Project ID 확인:

1. Vercel CLI 설치: `npm i -g vercel`
2. 프로젝트 폴더에서 `vercel link` 실행
3. `.vercel/project.json` 파일에서 확인

### 2. Netlify 배포 🌐

Repository Variables에서 `USE_NETLIFY=true` 설정 후:

```
NETLIFY_AUTH_TOKEN=your_netlify_token
NETLIFY_SITE_ID=your_netlify_site_id
```

### 3. Docker 배포 🐳

Repository Variables에서 `USE_DOCKER=true` 설정 후:

```
DOCKER_USERNAME=your_docker_hub_username
DOCKER_PASSWORD=your_docker_hub_password
HOST=your_server_ip
USERNAME=your_server_username
SSH_KEY=your_private_ssh_key
```

## 🔧 배포 플랫폼 선택

기본적으로 **Vercel 배포**만 활성화되어 있습니다.

다른 플랫폼을 사용하려면:

1. Repository → Settings → Secrets and variables → Actions
2. Variables 탭에서 추가:
   - Netlify: `USE_NETLIFY=true`
   - Docker: `USE_DOCKER=true`

## 🚀 배포 트리거

### 자동 배포

- `main` 브랜치에 push할 때마다 자동 배포
- Pull Request 생성 시 빌드 테스트

### 수동 배포

GitHub Actions 탭에서 "Deploy to Production" 워크플로우를 수동 실행 가능

## 📊 배포 모니터링

### 성공 시

- ✅ 모든 단계 통과
- 🔗 배포 URL 자동 생성
- 📢 성공 알림

### 실패 시

- ❌ 실패 단계 확인
- 📝 에러 로그 검토
- 🔄 문제 해결 후 재시도

## 🛠️ 로컬 테스트

배포 전 로컬에서 테스트:

```bash
# 빌드 테스트
npm run build

# Docker 테스트 (선택사항)
docker build -t todo-app .
docker run -p 3000:3000 todo-app
```

## 🔐 보안 권장사항

1. **Secrets 관리**: 절대 코드에 하드코딩하지 마세요
2. **권한 최소화**: 필요한 권한만 부여
3. **정기 갱신**: 토큰과 키를 정기적으로 갱신
4. **접근 제한**: Repository 접근 권한 관리

## 🆘 문제 해결

### 자주 발생하는 문제

1. **환경 변수 누락**

   - Secrets 설정 확인
   - 변수명 오타 검사

2. **빌드 실패**

   - 의존성 충돌 확인
   - `npm ci --legacy-peer-deps` 사용

3. **배포 권한 오류**
   - 토큰 만료 확인
   - 권한 설정 재확인

### 도움말

- 🐛 이슈 발생 시: GitHub Issues 생성
- 📖 더 자세한 정보: [GitHub Actions 문서](https://docs.github.com/en/actions)

---

**설정 완료 후 main 브랜치에 커밋하면 자동으로 배포가 시작됩니다! 🚀**
