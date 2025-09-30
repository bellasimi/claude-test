import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import QueryProvider from '@/components/providers/QueryProvider'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TODO 2025 - 미래형 할 일 관리',
  description: '2025 UI 트렌드를 적용한 현대적인 TODO 관리 앱',
  keywords: ['todo', 'task', 'productivity', '할일', '업무관리'],
  authors: [{ name: 'Claude' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='ko' className='dark'>
      <body className={`${inter.className} antialiased`}>
        <QueryProvider>
          <div className='min-h-screen relative overflow-hidden'>
            {/* 배경 그라데이션 효과 */}
            <div className='fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900 -z-10' />

            {/* 배경 패턴 */}
            <div className='fixed inset-0 opacity-20 -z-10'>
              <div className='absolute top-0 -left-4 w-72 h-72 bg-slate-500 rounded-full mix-blend-multiply filter blur-xl animate-float' />
              <div
                className='absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl animate-float'
                style={{ animationDelay: '2s' }}
              />
            </div>

            {/* 메인 콘텐츠 */}
            <main className='relative z-10'>{children}</main>
          </div>

          {/* 토스트 알림 */}
          <Toaster
            position='top-right'
            toastOptions={{
              duration: 3000,
              style: {
                background: 'rgba(0, 0, 0, 0.8)',
                color: '#fff',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  )
}
