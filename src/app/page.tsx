'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Filter, Moon, Sun, Sparkles, Calendar, List, Bot } from 'lucide-react'
import { toast } from 'react-hot-toast'
import {
  useTodos,
  useCreateTodo,
  useUpdateTodo,
  useDeleteTodo,
  useToggleTodo,
} from '@/hooks/useTodos'
import { useTodoStore } from '@/store/todoStore'
import TodoCard from '@/components/ui/TodoCard'
import TodoForm from '@/components/ui/TodoForm'
import CategoryBadge from '@/components/ui/CategoryBadge'
import PriorityBadge from '@/components/ui/PriorityBadge'
import CalendarView from '@/components/ui/CalendarView'
import AIChatInterface from '@/components/ui/AIChatInterface'
import type { Todo, CreateTodoData, Category, Priority } from '@/types/todo'

export default function HomePage() {
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [isAIChatOpen, setIsAIChatOpen] = useState(false)

  const {
    filter,
    searchTerm,
    selectedCategory,
    selectedPriority,
    isFormOpen,
    isDarkMode,
    setFilter,
    setSearchTerm,
    setSelectedCategory,
    setSelectedPriority,
    setIsFormOpen,
    toggleDarkMode,
    clearFilters,
  } = useTodoStore()

  // API 훅들
  const {
    data: todos = [],
    isLoading,
    error,
    refetch,
  } = useTodos({
    status: filter,
    category: selectedCategory,
    priority: selectedPriority,
    search: searchTerm,
    sortBy: 'due_date',
    sortOrder: 'asc',
  })

  const createMutation = useCreateTodo()
  const updateMutation = useUpdateTodo()
  const deleteMutation = useDeleteTodo()
  const toggleTodo = useToggleTodo()

  // AI 채팅 관련 핸들러
  const handleAITodoUpdate = () => {
    refetch()
  }

  // 이벤트 핸들러들
  const handleCreateTodo = async (data: CreateTodoData) => {
    try {
      await createMutation.mutateAsync(data)
      toast.success('새 TODO가 추가되었습니다! ✨')
      setIsFormOpen(false)
    } catch (error) {
      toast.error('TODO 추가에 실패했습니다.')
    }
  }

  const handleUpdateTodo = async (data: CreateTodoData) => {
    if (!editingTodo) return

    try {
      await updateMutation.mutateAsync({
        id: editingTodo.id,
        data,
      })
      toast.success('TODO가 수정되었습니다! 📝')
      setEditingTodo(null)
      setIsFormOpen(false)
    } catch (error) {
      toast.error('TODO 수정에 실패했습니다.')
    }
  }

  const handleDeleteTodo = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id)
      toast.success('TODO가 삭제되었습니다! 🗑️')
    } catch (error) {
      toast.error('TODO 삭제에 실패했습니다.')
    }
  }

  const handleToggleTodo = (todo: Todo) => {
    toggleTodo(todo)
    if (!todo.completed) {
      toast.success('완료! 🎉', { duration: 2000 })
    }
  }

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo)
    setIsFormOpen(true)
  }

  // 필터링 및 정렬된 TODO 리스트
  const filteredAndSortedTodos = useMemo(() => {
    return todos
      .filter((todo) => {
        // 상태 필터
        if (filter === 'completed' && !todo.completed) return false
        if (filter === 'pending' && todo.completed) return false

        // 카테고리 필터
        if (selectedCategory && todo.category !== selectedCategory) return false

        // 우선순위 필터
        if (selectedPriority && todo.priority !== selectedPriority) return false

        // 검색 필터
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase()
          return (
            todo.title.toLowerCase().includes(searchLower) ||
            (todo.description && todo.description.toLowerCase().includes(searchLower))
          )
        }

        return true
      })
      .sort((a, b) => {
        // 우선순위별 정렬
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        if (a.priority !== b.priority) {
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        }

        // 생성일순 정렬
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
  }, [todos, filter, selectedCategory, selectedPriority, searchTerm])

  // 통계 계산
  const stats = useMemo(
    () => ({
      total: todos.length,
      completed: todos.filter((t) => t.completed).length,
      pending: todos.filter((t) => !t.completed).length,
      highPriority: todos.filter((t) => t.priority === 'high' && !t.completed).length,
    }),
    [todos]
  )

  const categories: Category[] = ['work', 'personal', 'health', 'shopping', 'learning']
  const priorities: Priority[] = ['high', 'medium', 'low']

  return (
    <div className='min-h-screen p-4 md:p-6 lg:p-8'>
      <div className='max-w-7xl mx-auto'>
        {/* 헤더 */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='mb-8'
        >
          <div className='flex items-center justify-between mb-6'>
            <div>
              <h1 className='text-4xl md:text-5xl font-bold gradient-text mb-2'>TODO 2025</h1>
              <p className='text-gray-400 text-lg'>미래형 할 일 관리 ✨</p>
            </div>

            <div className='flex items-center gap-3'>
              {/* AI 채팅 버튼 */}
              <motion.button
                onClick={() => setIsAIChatOpen(true)}
                className='flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-medium transition-colors shadow-neon'
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Bot size={20} />
                <span className='hidden sm:inline'>AI 어시스턴트</span>
              </motion.button>

              {/* 뷰 전환 버튼 */}
              <div className='flex items-center bg-white/10 rounded-xl p-1'>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    viewMode === 'list'
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <List size={16} />
                  리스트
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    viewMode === 'calendar'
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Calendar size={16} />
                  캘린더
                </button>
              </div>
              {/* 다크모드 토글 */}
              <motion.button
                onClick={toggleDarkMode}
                className='p-3 rounded-xl glass-card hover:scale-105 transition-transform'
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </motion.button>

              {/* 새 TODO 추가 버튼 */}
              <motion.button
                onClick={() => {
                  setEditingTodo(null)
                  setIsFormOpen(true)
                }}
                className='flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors shadow-neon'
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus size={20} />
                <span className='hidden sm:inline'>새 TODO</span>
              </motion.button>
            </div>
          </div>

          {/* 통계 카드들 */}
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className='glass-card p-4 text-center'
            >
              <div className='text-2xl font-bold text-blue-400'>{stats.total}</div>
              <div className='text-sm text-gray-400'>전체</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className='glass-card p-4 text-center'
            >
              <div className='text-2xl font-bold text-green-400'>{stats.completed}</div>
              <div className='text-sm text-gray-400'>완료</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className='glass-card p-4 text-center'
            >
              <div className='text-2xl font-bold text-orange-400'>{stats.pending}</div>
              <div className='text-sm text-gray-400'>진행중</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className='glass-card p-4 text-center'
            >
              <div className='text-2xl font-bold text-red-400'>{stats.highPriority}</div>
              <div className='text-sm text-gray-400'>긴급</div>
            </motion.div>
          </div>

          {/* 검색 및 필터 */}
          <div className='glass-card p-6'>
            <div className='flex flex-col lg:flex-row gap-4'>
              {/* 검색 */}
              <div className='flex-1 relative'>
                <Search
                  className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                  size={20}
                />
                <input
                  type='text'
                  placeholder='TODO 검색...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all'
                />
              </div>

              {/* 상태 필터 */}
              <div className='flex gap-2'>
                {(['all', 'pending', 'completed'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      filter === status
                        ? 'bg-blue-500 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {status === 'all' ? '전체' : status === 'pending' ? '진행중' : '완료'}
                  </button>
                ))}
              </div>
            </div>

            {/* 카테고리 및 우선순위 필터 */}
            <div className='flex flex-wrap gap-2 mt-4'>
              <span className='text-sm text-gray-400 flex items-center gap-1'>
                <Filter size={16} />
                필터:
              </span>

              {/* 카테고리 필터 */}
              {categories.map((category) => (
                <CategoryBadge
                  key={category}
                  category={category}
                  size='sm'
                  onClick={() =>
                    setSelectedCategory(selectedCategory === category ? null : category)
                  }
                  className={
                    selectedCategory === category
                      ? 'ring-2 ring-blue-400'
                      : 'opacity-60 hover:opacity-100'
                  }
                />
              ))}

              {/* 우선순위 필터 */}
              {priorities.map((priority) => (
                <PriorityBadge
                  key={priority}
                  priority={priority}
                  size='sm'
                  onClick={() =>
                    setSelectedPriority(selectedPriority === priority ? null : priority)
                  }
                  className={
                    selectedPriority === priority
                      ? 'ring-2 ring-blue-400'
                      : 'opacity-60 hover:opacity-100'
                  }
                />
              ))}

              {/* 필터 초기화 */}
              {(selectedCategory || selectedPriority || searchTerm) && (
                <button
                  onClick={clearFilters}
                  className='px-3 py-1 text-xs bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/30 transition-colors'
                >
                  초기화
                </button>
              )}
            </div>
          </div>
        </motion.header>
        {/* 메인 콘텐트 */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {viewMode === 'list' ? (
            // TODO 리스트 뷰
            <div>
              {isLoading ? (
                <div className='flex justify-center items-center py-12'>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className='w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full'
                  />
                </div>
              ) : error ? (
                <div className='text-center py-12'>
                  <p className='text-red-400 mb-4'>데이터를 불러오는 중 오류가 발생했습니다.</p>
                  <button
                    onClick={() => window.location.reload()}
                    className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors'
                  >
                    다시 시도
                  </button>
                </div>
              ) : filteredAndSortedTodos.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className='text-center py-16 glass-card'
                >
                  <Sparkles size={48} className='mx-auto text-blue-400 mb-4' />
                  <h3 className='text-xl font-semibold mb-2'>할 일이 없습니다!</h3>
                  <p className='text-gray-400 mb-6'>첫 번째 TODO를 추가해보세요.</p>
                  <motion.button
                    onClick={() => setIsFormOpen(true)}
                    className='px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors inline-flex items-center gap-2'
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Plus size={20} />
                    TODO 추가하기
                  </motion.button>
                </motion.div>
              ) : (
                <div className='bento-grid'>
                  {filteredAndSortedTodos.map((todo, index) => (
                    <motion.div
                      key={todo.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <TodoCard
                        todo={todo}
                        onToggle={handleToggleTodo}
                        onEdit={(todo) => {
                          setEditingTodo(todo)
                          setIsFormOpen(true)
                        }}
                        onDelete={handleDeleteTodo}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // 캘린더 뷰
            <CalendarView
              todos={todos}
              onSelectDate={setSelectedDate}
              selectedDate={selectedDate}
            />
          )}
        </motion.section>
        {/* TODO 폼 모달 */}
        <TodoForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false)
            setEditingTodo(null)
          }}
          onSubmit={editingTodo ? handleUpdateTodo : handleCreateTodo}
          editingTodo={editingTodo}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
        {/* AI 채팅 인터페이스 */}
        <AIChatInterface
          isOpen={isAIChatOpen}
          onClose={() => setIsAIChatOpen(false)}
          onTodoUpdate={handleAITodoUpdate}
        />
      </div>
    </div>
  )
}
