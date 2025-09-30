import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Vercel 배포에 최적화된 설정
  // output: 'standalone' 제거 (Vercel에서는 불필요)

  // 이미지 최적화 설정
  images: {
    domains: [], // 필요시 외부 이미지 도메인 추가
    unoptimized: false, // Vercel에서는 이미지 최적화 사용
  },

  // 환경 변수 검증 (빌드 시 필요한 변수들)
  env: {
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    GEMMA_API_BASE_URL: process.env.GEMMA_API_BASE_URL,
    GEMMA_MODEL_NAME: process.env.GEMMA_MODEL_NAME,
  },

  // 실험적 기능 설정
  experimental: {
    // 필요시 활성화
  },
}

export default nextConfig
