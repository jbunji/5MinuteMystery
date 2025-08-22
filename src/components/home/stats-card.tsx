'use client'

import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  trend?: string
  highlight?: boolean
}

export function StatsCard({ label, value, icon, trend, highlight }: StatsCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={cn(
        "p-4 rounded-lg border transition-all duration-300",
        highlight
          ? "bg-gradient-to-br from-evidence-primary/20 to-evidence-primary/5 border-evidence-primary/30"
          : "bg-noir-900/50 border-noir-800 hover:border-noir-700"
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className={cn(
          "p-2 rounded-lg",
          highlight ? "bg-evidence-primary/20" : "bg-noir-800"
        )}>
          {icon}
        </div>
        {trend && (
          <span className="flex items-center gap-1 text-xs text-green-500">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </span>
        )}
      </div>
      <p className="text-sm text-noir-400 mb-1">{label}</p>
      <p className={cn(
        "text-2xl font-bold",
        highlight ? "text-evidence-primary" : "text-parchment-200"
      )}>
        {value}
      </p>
    </motion.div>
  )
}