'use client'

import { motion } from 'framer-motion'
import { Edit2, Trash2, Calendar, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import type { Todo } from '@/types/todo'
import AnimatedCheckbox from './AnimatedCheckbox'
import CategoryBadge from './CategoryBadge'
import PriorityBadge from './PriorityBadge'

interface TodoCardProps {
  todo: Todo
  onToggle: (todo: Todo) => void
  onEdit: (todo: Todo) => void
  onDelete: (id: string) => void
  isDragging?: boolean
}

export default function TodoCard({
  todo,
  onToggle,
  onEdit,
  onDelete,
  isDragging = false,
}: TodoCardProps) {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MM월 dd일', { locale: ko })
    } catch {
      return dateString
    }
  }

  const isOverdue = todo.due_date && new Date(todo.due_date) < new Date() && !todo.completed

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: isDragging ? 1.02 : 1,
        rotate: isDragging ? 2 : 0,
      }}
      exit={{ opacity: 0, x: -100, scale: 0.8 }}
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
      className={`
        group relative overflow-hidden rounded-2xl p-4
        bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm
        border border-white/20 dark:border-gray-200/50
        shadow-glass hover:shadow-glass-dark
       
        ${isDragging ? 'shadow-2xl z-50' : ''}
        ${todo.completed ? 'opacity-75' : ''}
      `}
    >
      {/* 배경 그라데이션 효과 */}
      <div className='absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none' />

      {/* 우선순위에 따른 좌측 컬러 바 */}
      <div
        className={`
          absolute left-0 top-0 bottom-0 w-1 rounded-r-full
          ${todo.priority === 'high' ? 'bg-red-500' : ''}
          ${todo.priority === 'medium' ? 'bg-orange-500' : ''}
          ${todo.priority === 'low' ? 'bg-green-500' : ''}
        `}
      />

      <div className='flex items-start gap-3'>
        {/* 체크박스 */}
        <div className='flex-shrink-0 mt-1'>
          <AnimatedCheckbox checked={todo.completed} onChange={() => onToggle(todo)} />
        </div>

        {/* 메인 콘텐츠 */}
        <div className='flex-1 min-w-0'>
          {/* 제목과 액션 버튼 */}
          <div className='flex items-start justify-between gap-2 mb-2'>
            <h3
              className={`
                font-semibold text-lg leading-tight
                ${
                  todo.completed
                    ? 'line-through text-gray-200 dark:text-gray-400'
                    : 'text-gray-100 dark:text-white'
                }
              `}
            >
              {todo.title}
            </h3>

            {/* 액션 버튼들 */}
            <div className='flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
              <motion.button
                onClick={() => onEdit(todo)}
                className='p-2 rounded-lg hover:bg-white/10 dark:hover:bg-gray-200/50 text-gray-200 dark:text-gray-300 hover:text-blue-500'
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Edit2 size={16} />
              </motion.button>
              <motion.button
                onClick={() => onDelete(todo.id)}
                className='p-2 rounded-lg hover:bg-white/10 dark:hover:bg-gray-200/50 text-gray-200 dark:text-gray-300 hover:text-red-500'
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Trash2 size={16} />
              </motion.button>
            </div>
          </div>

          {/* 설명 */}
          {todo.description && (
            <p className='text-sm text-gray-200 dark:text-gray-300 mb-3 leading-relaxed'>
              {todo.description}
            </p>
          )}

          {/* 메타 정보 */}
          <div className='flex items-center gap-2 flex-wrap'>
            <CategoryBadge category={todo.category} size='sm' />
            <PriorityBadge priority={todo.priority} size='sm' />

            {/* 마감일 */}
            {todo.due_date && (
              <div
                className={`
                  flex items-center gap-1 px-2 py-1 rounded-full text-xs
                  ${
                    isOverdue
                      ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                      : 'bg-gray-100 dark:bg-gray-200/50 text-gray-700 dark:text-gray-300'
                  }
                `}
              >
                <Calendar size={12} />
                <span>{formatDate(todo.due_date)}</span>
              </div>
            )}

            {/* 생성일 */}
            {/* <div className='flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-200/50 text-gray-600 dark:text-gray-700'>
              <Clock size={12} />
              <span>{formatDate(todo.created_at)}</span>
            </div> */}
          </div>
        </div>
      </div>

      {/* 완료 상태 오버레이 */}
      {todo.completed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='absolute inset-0 bg-green-500/10 rounded-2xl pointer-events-none'
        />
      )}
    </motion.div>
  )
}
