'use client'

import { motion } from 'framer-motion'
import type { Priority } from '@/types/todo'
import { PRIORITY_EMOJIS, PRIORITY_COLORS } from '@/types/todo'

interface PriorityBadgeProps {
  priority: Priority
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  className?: string
}

export default function PriorityBadge({
  priority,
  size = 'md',
  onClick,
  className = '',
}: PriorityBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  }

  const priorityLabels: Record<Priority, string> = {
    high: '높음',
    medium: '보통',
    low: '낮음',
  }

  const glowClasses = {
    high: 'shadow-neon-red',
    medium: 'shadow-neon-orange',
    low: 'shadow-neon-green',
  }

  return (
    <motion.span
      className={`
        inline-flex items-center gap-1 rounded-full font-medium
        ${PRIORITY_COLORS[priority]}
        ${sizeClasses[size]}
        ${glowClasses[priority]}
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
      <span>{PRIORITY_EMOJIS[priority]}</span>
      <span>{priorityLabels[priority]}</span>
    </motion.span>
  )
}
