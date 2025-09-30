import { z } from 'zod'
import type { Priority, Category } from '@/types/todo'

export const todoCreateSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').max(100, '제목은 100자 이하로 입력해주세요'),
  description: z.string().max(500, '설명은 500자 이하로 입력해주세요').optional(),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  category: z.enum(['work', 'personal', 'health', 'shopping', 'learning']).default('personal'),
  due_date: z.string().optional(),
})

export const todoUpdateSchema = z.object({
  title: z
    .string()
    .min(1, '제목을 입력해주세요')
    .max(100, '제목은 100자 이하로 입력해주세요')
    .optional(),
  description: z.string().max(500, '설명은 500자 이하로 입력해주세요').optional(),
  completed: z.boolean().optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  category: z.enum(['work', 'personal', 'health', 'shopping', 'learning']).optional(),
  due_date: z.string().optional(),
  order_index: z.number().optional(),
})

export const todoFiltersSchema = z.object({
  status: z.enum(['all', 'completed', 'pending']).default('all'),
  priority: z.enum(['high', 'medium', 'low']).nullable().optional(),
  category: z.enum(['work', 'personal', 'health', 'shopping', 'learning']).nullable().optional(),
  search: z.string().nullable().optional(),
  sortBy: z.enum(['created_at', 'updated_at', 'priority', 'due_date']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export type TodoCreateInput = z.infer<typeof todoCreateSchema>
export type TodoUpdateInput = z.infer<typeof todoUpdateSchema>
export type TodoFiltersInput = z.infer<typeof todoFiltersSchema>
