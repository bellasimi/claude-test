'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Todo, CreateTodoData, UpdateTodoData, TodoFilters } from '@/types/todo'

const supabase = createClient()

// API 호출 함수들
const fetchTodos = async (filters?: TodoFilters): Promise<Todo[]> => {
  const params = new URLSearchParams()

  if (filters?.status) params.append('status', filters.status)
  if (filters?.priority) params.append('priority', filters.priority)
  if (filters?.category) params.append('category', filters.category)
  if (filters?.search) params.append('search', filters.search)
  if (filters?.sortBy) params.append('sortBy', filters.sortBy)
  if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)

  const response = await fetch(`/api/todos?${params.toString()}`)

  if (!response.ok) {
    throw new Error('Failed to fetch todos')
  }

  const result = await response.json()
  return result.data
}

const fetchTodoById = async (id: string): Promise<Todo> => {
  const response = await fetch(`/api/todos/${id}`)

  if (!response.ok) {
    throw new Error('Failed to fetch todo')
  }

  const result = await response.json()
  return result.data
}

const createTodo = async (data: CreateTodoData): Promise<Todo> => {
  const response = await fetch('/api/todos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error('Failed to create todo')
  }

  const result = await response.json()
  return result.data
}

const updateTodo = async ({ id, data }: { id: string; data: UpdateTodoData }): Promise<Todo> => {
  const response = await fetch(`/api/todos/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error('Failed to update todo')
  }

  const result = await response.json()
  return result.data
}

const deleteTodo = async (id: string): Promise<void> => {
  const response = await fetch(`/api/todos/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Failed to delete todo')
  }
}

// React Query 훅들
export const useTodos = (filters?: TodoFilters) => {
  return useQuery({
    queryKey: ['todos', filters],
    queryFn: () => fetchTodos(filters),
    staleTime: 5 * 60 * 1000, // 5분
  })
}

export const useTodo = (id: string) => {
  return useQuery({
    queryKey: ['todos', id],
    queryFn: () => fetchTodoById(id),
    enabled: !!id,
  })
}

export const useCreateTodo = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}

export const useUpdateTodo = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateTodo,
    onSuccess: (updatedTodo) => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      queryClient.setQueryData(['todos', updatedTodo.id], updatedTodo)
    },
  })
}

export const useDeleteTodo = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}

// 편의 훅들
export const useToggleTodo = () => {
  const updateMutation = useUpdateTodo()

  return (todo: Todo) => {
    updateMutation.mutate({
      id: todo.id,
      data: { completed: !todo.completed },
    })
  }
}
