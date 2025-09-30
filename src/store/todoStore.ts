import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { TodoStatus, Priority, Category } from '@/types/todo'

interface TodoStore {
  // UI 상태
  filter: TodoStatus
  searchTerm: string
  selectedCategory: Category | null
  selectedPriority: Priority | null

  // 편집 상태
  editingId: string | null
  isFormOpen: boolean

  // 테마 상태
  isDarkMode: boolean

  // Actions
  setFilter: (filter: TodoStatus) => void
  setSearchTerm: (term: string) => void
  setSelectedCategory: (category: Category | null) => void
  setSelectedPriority: (priority: Priority | null) => void
  setEditingId: (id: string | null) => void
  setIsFormOpen: (isOpen: boolean) => void
  toggleDarkMode: () => void

  // 필터 초기화
  clearFilters: () => void
}

export const useTodoStore = create<TodoStore>()(
  devtools(
    persist(
      (set, get) => ({
        // 초기 상태
        filter: 'all',
        searchTerm: '',
        selectedCategory: null,
        selectedPriority: null,
        editingId: null,
        isFormOpen: false,
        isDarkMode: true, // 2025 트렌드: 다크모드 기본

        // Actions
        setFilter: (filter) => set({ filter }, false, 'setFilter'),
        setSearchTerm: (searchTerm) => set({ searchTerm }, false, 'setSearchTerm'),
        setSelectedCategory: (selectedCategory) =>
          set({ selectedCategory }, false, 'setSelectedCategory'),
        setSelectedPriority: (selectedPriority) =>
          set({ selectedPriority }, false, 'setSelectedPriority'),
        setEditingId: (editingId) => set({ editingId }, false, 'setEditingId'),
        setIsFormOpen: (isFormOpen) => set({ isFormOpen }, false, 'setIsFormOpen'),
        toggleDarkMode: () =>
          set((state) => ({ isDarkMode: !state.isDarkMode }), false, 'toggleDarkMode'),

        clearFilters: () =>
          set(
            {
              filter: 'all',
              searchTerm: '',
              selectedCategory: null,
              selectedPriority: null,
            },
            false,
            'clearFilters'
          ),
      }),
      {
        name: 'todo-store',
        partialize: (state) => ({
          isDarkMode: state.isDarkMode,
          filter: state.filter,
        }),
      }
    ),
    {
      name: 'todo-store',
    }
  )
)
