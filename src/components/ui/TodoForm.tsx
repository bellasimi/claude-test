'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Calendar, Tag, Flag } from 'lucide-react'
import { todoCreateSchema, type TodoCreateInput } from '@/lib/validations/todo'
import type { Todo, Category, Priority } from '@/types/todo'
import { CATEGORY_EMOJIS, PRIORITY_EMOJIS } from '@/types/todo'

interface TodoFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: TodoCreateInput) => void
  editingTodo?: Todo | null
  isLoading?: boolean
}

export default function TodoForm({
  isOpen,
  onClose,
  onSubmit,
  editingTodo,
  isLoading = false,
}: TodoFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(todoCreateSchema),
    defaultValues: editingTodo
      ? {
          title: editingTodo.title,
          description: editingTodo.description || '',
          priority: editingTodo.priority,
          category: editingTodo.category,
          due_date: editingTodo.due_date || '',
        }
      : {
          title: '',
          description: '',
          priority: 'medium' as const,
          category: 'personal' as const,
          due_date: '',
        },
  })

  const watchedPriority = watch('priority')
  const watchedCategory = watch('category')

  const handleFormSubmit = (data: Record<string, unknown>) => {
    onSubmit(data as TodoCreateInput)
    if (!editingTodo) {
      reset()
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const categories: { value: Category; label: string }[] = [
    { value: 'work', label: '업무' },
    { value: 'personal', label: '개인' },
    { value: 'health', label: '건강' },
    { value: 'shopping', label: '쇼핑' },
    { value: 'learning', label: '학습' },
  ]

  const priorities: { value: Priority; label: string }[] = [
    { value: 'high', label: '높음' },
    { value: 'medium', label: '보통' },
    { value: 'low', label: '낮음' },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 배경 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50'
          />

          {/* 폼 모달 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className='fixed inset-0 z-50 flex items-center justify-center p-4'
          >
            <div className='w-full max-w-md bg-white/10 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl border border-white/20 dark:border-gray-200/50 shadow-2xl'>
              {/* 헤더 */}
              <div className='flex items-center justify-between p-6 border-b border-white/10 dark:border-gray-200/50'>
                <h2 className='text-xl font-semibold text-gray-100 dark:text-white'>
                  {editingTodo ? 'TODO 수정' : '새 TODO 추가'}
                </h2>
                <motion.button
                  onClick={handleClose}
                  className='p-2 rounded-lg hover:bg-white/10 dark:hover:bg-gray-200/50 text-gray-200 dark:text-gray-400'
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={20} />
                </motion.button>
              </div>

              {/* 폼 */}
              <form onSubmit={handleSubmit(handleFormSubmit)} className='p-6 space-y-4'>
                {/* 제목 */}
                <div>
                  <label className='block text-sm font-medium text-gray-200 dark:text-gray-300 mb-2'>
                    제목 *
                  </label>
                  <input
                    {...register('title')}
                    type='text'
                    placeholder='할 일을 입력하세요'
                    className='w-full px-4 py-3 rounded-xl bg-white/20 dark:bg-gray-200/50 border border-white/30 dark:border-gray-600/50 text-gray-100 dark:text-white placeholder-gray-200 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                  />
                  {errors.title && (
                    <p className='mt-1 text-sm text-red-500'>{errors.title.message}</p>
                  )}
                </div>

                {/* 설명 */}
                <div>
                  <label className='block text-sm font-medium text-gray-200 dark:text-gray-300 mb-2'>
                    설명
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    placeholder='상세 설명을 입력하세요 (선택사항)'
                    className='w-full px-4 py-3 rounded-xl bg-white/20 dark:bg-gray-200/50 border border-white/30 dark:border-gray-600/50 text-gray-100 dark:text-white placeholder-gray-200 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none'
                  />
                  {errors.description && (
                    <p className='mt-1 text-sm text-red-500'>{errors.description.message}</p>
                  )}
                </div>

                {/* 카테고리와 우선순위 */}
                <div className='grid grid-cols-2 gap-4'>
                  {/* 카테고리 */}
                  <div>
                    <label className='block text-sm font-medium text-gray-200 dark:text-gray-300 mb-2'>
                      <Tag size={16} className='inline mr-1' />
                      카테고리
                    </label>
                    <select
                      {...register('category')}
                      className='w-full px-4 py-3 rounded-xl bg-white/20 dark:bg-gray-200/50 border border-white/30 dark:border-gray-600/50 text-gray-100 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value} className='bg-gray-800'>
                          {CATEGORY_EMOJIS[cat.value]} {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 우선순위 */}
                  <div>
                    <label className='block text-sm font-medium text-gray-200 dark:text-gray-300 mb-2'>
                      <Flag size={16} className='inline mr-1' />
                      우선순위
                    </label>
                    <select
                      {...register('priority')}
                      className='w-full px-4 py-3 rounded-xl bg-white/20 dark:bg-gray-200/50 border border-white/30 dark:border-gray-600/50 text-gray-100 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                    >
                      {priorities.map((priority) => (
                        <option key={priority.value} value={priority.value} className='bg-gray-800'>
                          {PRIORITY_EMOJIS[priority.value]} {priority.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 마감일 */}
                <div>
                  <label className='block text-sm font-medium text-gray-200 dark:text-gray-300 mb-2'>
                    <Calendar size={16} className='inline mr-1' />
                    마감일
                  </label>
                  <input
                    {...register('due_date')}
                    type='date'
                    className='w-full px-4 py-3 rounded-xl bg-white/20 dark:bg-gray-200/50 border border-white/30 dark:border-gray-600/50 text-gray-100 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                  />
                  {errors.due_date && (
                    <p className='mt-1 text-sm text-red-500'>{errors.due_date.message}</p>
                  )}
                </div>

                {/* 버튼들 */}
                <div className='flex gap-3 pt-4'>
                  <motion.button
                    type='button'
                    onClick={handleClose}
                    className='flex-1 px-4 py-3 rounded-xl bg-gray-200 dark:bg-gray-200 text-gray-200 dark:text-gray-300 font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors'
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    취소
                  </motion.button>
                  <motion.button
                    type='submit'
                    disabled={isLoading}
                    className='flex-1 px-4 py-3 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2'
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  >
                    {isLoading ? (
                      <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                    ) : (
                      <>
                        <Plus size={16} />
                        {editingTodo ? '수정' : '추가'}
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
