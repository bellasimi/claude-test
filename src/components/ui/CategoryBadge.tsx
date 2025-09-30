'use client'

import { motion } from 'framer-motion'
import type { Category } from '@/types/todo'
import { CATEGORY_EMOJIS, CATEGORY_COLORS } from '@/types/todo'

interface CategoryBadgeProps {
  category: Category
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  className?: string
}

export default function CategoryBadge({
  category,
  size = 'md',
  onClick,
  className = '',
}: CategoryBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  }

  const categoryLabels: Record<Category, string> = {
    work: '업무',
    personal: '개인',
    health: '건강',
    shopping: '쇼핑',
    learning: '학습',
  }

  return (
    <motion.span
      className={`
        inline-flex items-center gap-1 rounded-full font-medium
        ${CATEGORY_COLORS[category]}
        ${sizeClasses[size]}
        ${onClick ? 'cursor-pointer hover:scale-105' : ''}
        ${className}
      `}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.05 } : {}}
      whileTap={onClick ? { scale: 0.95 } : {}}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <span>{CATEGORY_EMOJIS[category]}</span>
      <span>{categoryLabels[category]}</span>
    </motion.span>
  )
}
