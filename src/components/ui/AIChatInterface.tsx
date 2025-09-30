'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, MessageCircle, Bot, User, Loader2, X } from 'lucide-react'
import { toast } from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  message: string
  timestamp: Date
  action?: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE'
  result?: {
    message?: string
    created?: unknown[]
    updated?: unknown[]
    deleted?: unknown[]
    stats?: Record<string, number>
  }
}

interface AIChatInterfaceProps {
  isOpen: boolean
  onClose: () => void
  onTodoUpdate: () => void // TODO 리스트 갱신 콜백
}

export default function AIChatInterface({ isOpen, onClose, onTodoUpdate }: AIChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      message: `## 👋 안녕하세요! TODO AI 어시스턴트입니다 🤖

자연어로 할일을 쉽게 관리해보세요!

### 📝 사용 예시

#### 생성하기
- "오늘 밥먹고, 미팅하고, 운동할거야"
- "내일까지 보고서 작성해야 해"

#### 조회하기  
- "오늘 할일이 뭐야?"
- "내가 제일 많이 만든 카테고리는 뭐야?"
- "완료한 일들 보여줘"

#### 수정/삭제하기
- "운동 완료했어"
- "오늘 못 끝낸 일은 삭제해줘"

**지금 바로 자연어로 말해보세요! 💬**`,
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: inputMessage.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.message,
        }),
      })

      if (!response.ok) {
        throw new Error('AI 요청에 실패했습니다.')
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'AI 응답 처리에 실패했습니다.')
      }

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        message: result.data.message,
        timestamp: new Date(),
        action: result.data.action,
        result: result.data.result,
      }

      setMessages((prev) => [...prev, aiMessage])

      // TODO 리스트 갱신이 필요한 작업인 경우
      if (['CREATE', 'UPDATE', 'DELETE'].includes(result.data.action)) {
        onTodoUpdate()

        // 성공적인 작업에 대한 토스트 알림
        if (result.data.action === 'CREATE') {
          toast.success('새로운 할일이 추가되었습니다! 🎉')
        } else if (result.data.action === 'UPDATE') {
          toast.success('할일이 업데이트되었습니다! ✏️')
        } else if (result.data.action === 'DELETE') {
          toast.success('할일이 삭제되었습니다! 🗑️')
        }
      }
    } catch (error) {
      console.error('AI 채팅 에러:', error)

      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        type: 'ai',
        message: '죄송해요, 요청을 처리하는 중 오류가 발생했습니다. 다시 시도해주세요.',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
      toast.error('AI 요청에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getActionColor = (action?: string) => {
    switch (action) {
      case 'CREATE':
        return 'text-green-400'
      case 'READ':
        return 'text-blue-400'
      case 'UPDATE':
        return 'text-orange-400'
      case 'DELETE':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const getActionLabel = (action?: string) => {
    switch (action) {
      case 'CREATE':
        return '생성'
      case 'READ':
        return '조회'
      case 'UPDATE':
        return '수정'
      case 'DELETE':
        return '삭제'
      default:
        return ''
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 배경 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className='fixed inset-0 bg-black/50 backdrop-blur-sm z-40'
          />

          {/* 채팅 인터페이스 */}
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className='fixed right-0 top-0 bottom-0 w-full max-w-md bg-white/10 dark:bg-gray-800/90 backdrop-blur-md border-l border-white/20 dark:border-gray-200/50 shadow-2xl z-50'
          >
            {/* 헤더 */}
            <div className='flex items-center justify-between p-4 border-b border-white/10 dark:border-gray-200/50'>
              <div className='flex items-center gap-3'>
                <div className='p-2 rounded-xl bg-blue-500/20 text-blue-400'>
                  <MessageCircle size={20} />
                </div>
                <div>
                  <h3 className='text-lg font-semibold text-white'>AI 어시스턴트</h3>
                  <p className='text-sm text-gray-400'>자연어로 TODO 관리</p>
                </div>
              </div>
              <motion.button
                onClick={onClose}
                className='p-2 rounded-lg hover:bg-white/10 dark:hover:bg-gray-200/50 text-gray-200 dark:text-gray-400'
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={20} />
              </motion.button>
            </div>

            {/* 채팅 메시지 영역 */}
            <div className='h-[75%] p-4 overflow-y-auto custom-scrollbar'>
              <div className='space-y-4 pb-20'>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        message.type === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-white/10 dark:bg-gray-800/70 border border-white/20 dark:border-gray-600/50 backdrop-blur-sm'
                      }`}
                    >
                      {/* 메시지 헤더 */}
                      <div className='flex items-center gap-2 mb-2'>
                        <div
                          className={`p-1.5 rounded-full ${
                            message.type === 'user' ? 'bg-white/20' : 'bg-blue-500/20'
                          }`}
                        >
                          {message.type === 'user' ? (
                            <User size={14} className='text-white' />
                          ) : (
                            <Bot size={14} className='text-blue-400' />
                          )}
                        </div>
                        <span
                          className={`text-xs ${
                            message.type === 'user' ? 'text-white/80' : 'text-gray-300'
                          }`}
                        >
                          {formatTimestamp(message.timestamp)}
                        </span>
                        {message.action && (
                          <span className={`text-xs font-medium ${getActionColor(message.action)}`}>
                            [{getActionLabel(message.action)}]
                          </span>
                        )}
                      </div>

                      {/* 메시지 내용 */}
                      <div
                        className={`text-sm leading-relaxed ${
                          message.type === 'user' ? 'text-white' : 'text-gray-200 dark:text-white'
                        }`}
                      >
                        {message.type === 'ai' ? (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              // 헤딩 스타일
                              h1: ({ children }) => (
                                <h1 className='text-lg font-bold mb-2 text-blue-300'>{children}</h1>
                              ),
                              h2: ({ children }) => (
                                <h2 className='text-base font-semibold mb-2 text-blue-300'>
                                  {children}
                                </h2>
                              ),
                              h3: ({ children }) => (
                                <h3 className='text-sm font-medium mb-1 text-blue-200'>
                                  {children}
                                </h3>
                              ),
                              // 리스트 스타일
                              ul: ({ children }) => (
                                <ul className='list-none space-y-1 ml-2'>{children}</ul>
                              ),
                              ol: ({ children }) => (
                                <ol className='list-decimal list-inside space-y-1 ml-2'>
                                  {children}
                                </ol>
                              ),
                              li: ({ children }) => (
                                <li className='text-sm leading-relaxed'>{children}</li>
                              ),
                              // 강조 텍스트
                              strong: ({ children }) => (
                                <strong className='font-semibold text-white'>{children}</strong>
                              ),
                              em: ({ children }) => (
                                <em className='italic text-gray-300'>{children}</em>
                              ),
                              // 코드 블록
                              code: ({ children }) => (
                                <code className='bg-black/20 px-1 py-0.5 rounded text-xs text-blue-200'>
                                  {children}
                                </code>
                              ),
                              pre: ({ children }) => (
                                <pre className='bg-black/30 p-3 rounded-lg overflow-x-auto text-xs my-2'>
                                  {children}
                                </pre>
                              ),
                              // 단락
                              p: ({ children }) => <p className='mb-2 last:mb-0'>{children}</p>,
                              // 구분선
                              hr: () => <hr className='border-gray-500/30 my-3' />,
                            }}
                          >
                            {message.message}
                          </ReactMarkdown>
                        ) : (
                          <div className='whitespace-pre-wrap'>{message.message}</div>
                        )}
                      </div>

                      {/* 결과 요약 (AI 메시지에만) */}
                      {message.type === 'ai' && message.result && (
                        <div className='mt-3 pt-3 border-t border-white/10 dark:border-gray-600/50'>
                          <div className='text-xs text-gray-400 space-y-1'>
                            {message.result.created && (
                              <div>✅ {message.result.created.length}개 생성됨</div>
                            )}
                            {message.result.updated && (
                              <div>✏️ {message.result.updated.length}개 수정됨</div>
                            )}
                            {message.result.deleted && (
                              <div>🗑️ {message.result.deleted.length}개 삭제됨</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}

                {/* 로딩 인디케이터 */}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='flex justify-start'
                  >
                    <div className='bg-white/10 dark:bg-gray-200/50 border border-white/20 dark:border-gray-600/50 rounded-2xl px-4 py-3'>
                      <div className='flex items-center gap-2'>
                        <Loader2 size={16} className='animate-spin text-blue-400' />
                        <span className='text-sm text-gray-300'>
                          AI가 응답을 생성하고 있어요...
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* 입력 영역 */}
            <div className='h-[25%] p-4 border-t border-white/10 dark:border-gray-200/50 bg-white/5 dark:bg-gray-800/50 backdrop-blur-sm'>
              <div className='flex gap-2'>
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder='자연어로 TODO를 관리해보세요... (예: "오늘 밥먹고 미팅하고 운동할거야")'
                  disabled={isLoading}
                  className='flex-1 px-4 py-3 bg-white/10 dark:bg-gray-200/50 border border-white/20 dark:border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none'
                  rows={3}
                />
                <motion.button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className='self-end p-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition-colors'
                  whileHover={{ scale: isLoading ? 1 : 1.05 }}
                  whileTap={{ scale: isLoading ? 1 : 0.95 }}
                >
                  {isLoading ? <Loader2 size={20} className='animate-spin' /> : <Send size={20} />}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
