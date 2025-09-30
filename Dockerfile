# 멀티 스테이지 빌드로 최적화된 Docker 이미지 생성
FROM node:20-alpine AS base

# 의존성 설치용 스테이지
FROM base AS deps
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./
RUN npm ci --legacy-peer-deps --only=production && npm cache clean --force

# 빌드용 스테이지
FROM base AS builder
WORKDIR /app

# 의존성 복사
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 환경 변수 설정 (빌드 시점)
ARG GROQ_API_KEY
ARG GEMMA_API_BASE_URL
ARG GEMMA_MODEL_NAME
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG SUPABASE_SERVICE_ROLE_KEY

ENV GROQ_API_KEY=${GROQ_API_KEY}
ENV GEMMA_API_BASE_URL=${GEMMA_API_BASE_URL}
ENV GEMMA_MODEL_NAME=${GEMMA_MODEL_NAME}
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
ENV SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}

# Next.js 애플리케이션 빌드
RUN npm run build

# 프로덕션 실행용 스테이지
FROM base AS runner
WORKDIR /app

# 보안을 위한 사용자 생성
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 필요한 파일들만 복사
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 사용자 변경
USER nextjs

# 포트 노출
EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# 애플리케이션 실행
CMD ["node", "server.js"]