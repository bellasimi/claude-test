export type Priority = 'high' | 'medium' | 'low'
export type Category = 'work' | 'personal' | 'health' | 'shopping' | 'learning'
export type TodoStatus = 'all' | 'completed' | 'pending'

export interface Todo {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: Priority
  category: Category
  due_date?: string
  order_index: number
  created_at: string
  updated_at: string
}

export interface CreateTodoData {
  title: string
  description?: string
  priority?: Priority
  category?: Category
  due_date?: string
}

export interface UpdateTodoData {
  title?: string
  description?: string
  completed?: boolean
  priority?: Priority
  category?: Category
  due_date?: string
  order_index?: number
}

export interface TodoFilters {
  status?: TodoStatus
  priority?: Priority | null
  category?: Category | null
  search?: string | null
  sortBy?: 'created_at' | 'updated_at' | 'priority' | 'due_date'
  sortOrder?: 'asc' | 'desc'
}

export interface TodoStats {
  total: number
  completed: number
  pending: number
  byCategory: Record<Category, number>
  byPriority: Record<Priority, number>
}

// 카테고리별 이모지 매핑
export const CATEGORY_EMOJIS: Record<Category, string> = {
  work: '💼',
  personal: '🏠',
  health: '🏃‍♂️',
  shopping: '🛒',
  learning: '📚',
}

// 우선순위별 이모지 매핑
export const PRIORITY_EMOJIS: Record<Priority, string> = {
  high: '🔥',
  medium: '⚡',
  low: '🌱',
}

// 카테고리별 색상 클래스
export const CATEGORY_COLORS: Record<Category, string> = {
  work: 'bg-category-work text-white',
  personal: 'bg-category-personal text-white',
  health: 'bg-category-health text-white',
  shopping: 'bg-category-shopping text-white',
  learning: 'bg-category-learning text-white',
}

// 우선순위별 색상 클래스
export const PRIORITY_COLORS: Record<Priority, string> = {
  high: 'bg-priority-high text-white',
  medium: 'bg-priority-medium text-white',
  low: 'bg-priority-low text-white',
}
