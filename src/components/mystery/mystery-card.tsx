'use client'

import { motion } from 'framer-motion'
import { Clock, Star, Lock, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MysteryCardProps {
  title: string
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  estimatedTime: number
  synopsis: string
  imageUrl?: string
  isDaily?: boolean
  isLocked?: boolean
  onPlay: () => void
}

const difficultyConfig = {
  easy: { label: 'Easy', color: 'text-green-500', stars: 1 },
  medium: { label: 'Medium', color: 'text-yellow-500', stars: 2 },
  hard: { label: 'Hard', color: 'text-orange-500', stars: 3 },
  expert: { label: 'Expert', color: 'text-red-500', stars: 4 },
}

export function MysteryCard({
  title,
  difficulty,
  estimatedTime,
  synopsis,
  imageUrl,
  isDaily,
  isLocked,
  onPlay,
}: MysteryCardProps) {
  const config = difficultyConfig[difficulty]

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={cn(
        "relative overflow-hidden rounded-lg border transition-all duration-300",
        isDaily 
          ? "bg-gradient-to-br from-blood-600/10 to-noir-900 border-blood-500/30 shadow-danger" 
          : "bg-noir-900/80 border-noir-800 hover:border-noir-700"
      )}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            {isDaily && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blood-500/20 text-blood-400 rounded-full mb-2">
                Daily Mystery
              </span>
            )}
            <h3 className="text-2xl font-noir text-parchment-200 mb-1">
              {title}
            </h3>
            <div className="flex items-center gap-4 text-sm">
              <span className={cn("flex items-center gap-1", config.color)}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "w-4 h-4",
                      i < config.stars ? "fill-current" : "opacity-20"
                    )}
                  />
                ))}
                <span className="ml-1">{config.label}</span>
              </span>
              <span className="flex items-center gap-1 text-noir-400">
                <Clock className="w-4 h-4" />
                {estimatedTime} min
              </span>
            </div>
          </div>
        </div>

        {/* Synopsis */}
        <p className="text-noir-300 mb-6 line-clamp-3 font-detective text-sm">
          {synopsis}
        </p>

        {/* Action Button */}
        {isLocked ? (
          <Button
            disabled
            className="w-full btn-noir opacity-50 cursor-not-allowed"
          >
            <Lock className="w-4 h-4 mr-2" />
            Unlock with Premium
          </Button>
        ) : (
          <motion.div whileTap={{ scale: 0.98 }}>
            <Button
              onClick={onPlay}
              className={cn(
                "w-full group",
                isDaily ? "btn-evidence" : "btn-noir"
              )}
            >
              <Play className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              Begin Investigation
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}