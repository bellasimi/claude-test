'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

interface AnimatedCheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function AnimatedCheckbox({
  checked,
  onChange,
  disabled = false,
  size = 'md',
}: AnimatedCheckboxProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20,
  }

  return (
    <motion.button
      type='button'
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`
        ${sizeClasses[size]}
        relative flex items-center justify-center
        rounded-lg border-2 transition-all duration-200
        ${
          checked
            ? 'bg-blue-500 border-blue-500 text-white shadow-neon'
            : 'bg-transparent border-gray-300 dark:border-gray-600 hover:border-blue-400'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        dark:focus:ring-offset-gray-100
      `}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
    >
      <motion.div
        initial={false}
        animate={{
          scale: checked ? 1 : 0,
          opacity: checked ? 1 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30,
        }}
      >
        <Check size={iconSizes[size]} strokeWidth={3} />
      </motion.div>

      {/* 체크 애니메이션 효과 */}
      {checked && (
        <motion.div
          className='absolute inset-0 rounded-lg bg-blue-400'
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 1.2, opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.button>
  )
}
