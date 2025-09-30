'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  parseISO,
  startOfWeek,
  endOfWeek,
} from 'date-fns'
import { ko } from 'date-fns/locale'
import type { Todo } from '@/types/todo'

interface CalendarViewProps {
  todos: Todo[]
  onSelectDate?: (date: Date) => void
  selectedDate?: Date
}

export default function CalendarView({ todos, onSelectDate, selectedDate }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  // 현재 월의 시작과 끝
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)

  // 캘린더에 표시할 날짜들 (이전/다음 월의 일부 포함)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  // 날짜별 할일 개수 계산
  const todosByDate = useMemo(() => {
    const grouped: { [key: string]: Todo[] } = {}

    todos.forEach((todo) => {
      if (todo.due_date) {
        const dateKey = format(parseISO(todo.due_date), 'yyyy-MM-dd')
        if (!grouped[dateKey]) {
          grouped[dateKey] = []
        }
        grouped[dateKey].push(todo)
      }
    })

    return grouped
  }, [todos])

  // 이전/다음 달로 이동
  const goToPreviousMonth = () => {
    setCurrentDate((prev) => subMonths(prev, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate((prev) => addMonths(prev, 1))
  }

  // 날짜 클릭 핸들러
  const handleDateClick = (date: Date) => {
    onSelectDate?.(date)
  }

  return (
    <div className='bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700/50'>
      {/* 캘린더 헤더 */}
      <div className='flex items-center justify-between mb-6'>
        <motion.button
          onClick={goToPreviousMonth}
          className='p-2 rounded-lg hover:bg-white/10 dark:hover:bg-gray-700/50 text-white'
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronLeft size={20} />
        </motion.button>

        <h2 className='text-xl font-semibold text-white'>
          {format(currentDate, 'yyyy년 MMMM', { locale: ko })}
        </h2>

        <motion.button
          onClick={goToNextMonth}
          className='p-2 rounded-lg hover:bg-white/10 dark:hover:bg-gray-700/50 text-white'
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronRight size={20} />
        </motion.button>
      </div>

      {/* 요일 헤더 */}
      <div className='grid grid-cols-7 gap-1 mb-2'>
        {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
          <div key={day} className='text-center text-sm font-medium text-gray-400 py-2'>
            {day}
          </div>
        ))}
      </div>

      {/* 캘린더 그리드 */}
      <div className='grid grid-cols-7 gap-1'>
        {calendarDays.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd')
          const dayTodos = todosByDate[dateKey] || []
          const isCurrentMonth = isSameMonth(day, currentDate)
          const isSelected = selectedDate && isSameDay(day, selectedDate)
          const isTodayDate = isToday(day)

          return (
            <motion.button
              key={day.toISOString()}
              onClick={() => handleDateClick(day)}
              className={`
                relative p-3 min-h-[3rem] rounded-lg text-sm transition-all
                ${
                  isCurrentMonth ? 'text-white hover:bg-white/10' : 'text-gray-500 hover:bg-white/5'
                }
                ${isSelected ? 'bg-blue-500/30 border border-blue-400' : ''}
                ${isTodayDate ? 'bg-blue-600/20 border border-blue-500' : ''}
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* 날짜 숫자 */}
              <div className='font-medium'>{format(day, 'd')}</div>

              {/* 할일 인디케이터 */}
              {dayTodos.length > 0 && (
                <div className='absolute bottom-1 left-1/2 transform -translate-x-1/2'>
                  <div className='flex gap-0.5'>
                    {dayTodos.slice(0, 3).map((todo) => (
                      <div
                        key={todo.id}
                        className={`
                          w-1.5 h-1.5 rounded-full
                          ${
                            todo.completed
                              ? 'bg-green-400'
                              : todo.priority === 'high'
                              ? 'bg-red-400'
                              : todo.priority === 'medium'
                              ? 'bg-orange-400'
                              : 'bg-blue-400'
                          }
                        `}
                      />
                    ))}
                    {dayTodos.length > 3 && (
                      <div className='w-1.5 h-1.5 rounded-full bg-gray-400' />
                    )}
                  </div>

                  {/* 할일 개수 표시 */}
                  {dayTodos.length > 0 && (
                    <div className='text-xs text-gray-300 mt-0.5'>{dayTodos.length}</div>
                  )}
                </div>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* 선택된 날짜의 할일 목록 */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className='mt-6 pt-6 border-t border-white/20'
        >
          <h3 className='text-lg font-semibold text-white mb-3 flex items-center gap-2'>
            <CalendarIcon size={18} />
            {format(selectedDate, 'yyyy년 MM월 dd일 (eee)', { locale: ko })}
          </h3>

          <div className='space-y-2'>
            {todosByDate[format(selectedDate, 'yyyy-MM-dd')]?.length ? (
              todosByDate[format(selectedDate, 'yyyy-MM-dd')].map((todo) => (
                <div
                  key={todo.id}
                  className={`
                    p-3 rounded-lg bg-white/5 border border-white/10
                    ${todo.completed ? 'opacity-60' : ''}
                  `}
                >
                  <div className='flex items-center gap-2'>
                    <div
                      className={`
                        w-2 h-2 rounded-full
                        ${
                          todo.completed
                            ? 'bg-green-400'
                            : todo.priority === 'high'
                            ? 'bg-red-400'
                            : todo.priority === 'medium'
                            ? 'bg-orange-400'
                            : 'bg-blue-400'
                        }
                      `}
                    />
                    <span
                      className={`text-sm ${
                        todo.completed ? 'line-through text-gray-400' : 'text-white'
                      }`}
                    >
                      {todo.title}
                    </span>
                  </div>
                  {todo.description && (
                    <p className='text-xs text-gray-400 mt-1 ml-4'>{todo.description}</p>
                  )}
                </div>
              ))
            ) : (
              <p className='text-gray-400 text-sm'>이 날짜에는 할일이 없습니다.</p>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}
