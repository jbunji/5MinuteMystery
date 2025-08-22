'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Fingerprint, Clock, Trophy, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MysteryCard } from '@/components/mystery/mystery-card'
import { StatsCard } from '@/components/home/stats-card'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  const [timeUntilNewMystery, setTimeUntilNewMystery] = useState('')
  
  useEffect(() => {
    const calculateTimeUntilMidnight = () => {
      const now = new Date()
      const midnight = new Date()
      midnight.setHours(24, 0, 0, 0)
      const diff = midnight.getTime() - now.getTime()
      
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      
      setTimeUntilNewMystery(`${hours}h ${minutes}m ${seconds}s`)
    }
    
    calculateTimeUntilMidnight()
    const interval = setInterval(calculateTimeUntilMidnight, 1000)
    return () => clearInterval(interval)
  }, [])

  const stats = {
    casesTotal: 147,
    accuracyRate: 89,
    currentStreak: 12,
    rank: 'Senior Detective'
  }

  return (
    <div className="min-h-screen relative">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h1 className="mystery-title mb-6">
            5 Minute Mystery
          </h1>
          <p className="text-xl text-noir-300 mb-8 font-detective">
            Solve a new case every coffee break
          </p>
          
          {/* Daily Mystery Timer */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blood-600/20 rounded-lg border border-blood-500/30 mb-12"
          >
            <Clock className="w-5 h-5 text-blood-500" />
            <span className="text-parchment-200 font-medium">
              New daily mystery in: {timeUntilNewMystery}
            </span>
          </motion.div>
        </motion.div>
      </section>

      {/* Main Content */}
      <section className="px-4 pb-20">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
          {/* Today's Mystery */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="lg:col-span-2"
          >
            <h2 className="text-2xl font-noir mb-6 text-parchment-200 flex items-center gap-3">
              <Fingerprint className="w-6 h-6 text-evidence-primary" />
              Today's Mystery
            </h2>
            
            <MysteryCard
              title="The Vanishing Violinist"
              difficulty="medium"
              estimatedTime={7}
              synopsis="A renowned violinist disappears moments before their Carnegie Hall debut. The green room holds secrets, the instrument remains, but the musician has vanished without a trace..."
              imageUrl="/images/mystery-violin.jpg"
              isDaily={true}
              onPlay={() => router.push('/play/daily')}
            />

            {/* Quick Play Options */}
            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  onClick={() => router.push('/play/quick')}
                  className="w-full btn-noir group"
                >
                  <Sparkles className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                  Quick Mystery (3-5 min)
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  onClick={() => router.push('/mysteries')}
                  variant="outline"
                  className="w-full border-noir-700 hover:bg-noir-800"
                >
                  Browse All Mysteries
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Player Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <h2 className="text-2xl font-noir mb-6 text-parchment-200 flex items-center gap-3">
              <Trophy className="w-6 h-6 text-evidence-primary" />
              Your Progress
            </h2>
            
            <div className="space-y-4">
              <StatsCard
                label="Cases Solved"
                value={stats.casesTotal}
                icon={<Fingerprint className="w-5 h-5" />}
                trend="+12 this week"
              />
              <StatsCard
                label="Accuracy Rate"
                value={`${stats.accuracyRate}%`}
                icon={<Trophy className="w-5 h-5" />}
                trend="Top 10%"
              />
              <StatsCard
                label="Current Streak"
                value={`${stats.currentStreak} days`}
                icon={<Sparkles className="w-5 h-5" />}
                trend="Personal best!"
                highlight
              />
              
              <div className="mt-6 p-4 bg-gradient-to-br from-evidence-primary/10 to-transparent rounded-lg border border-evidence-primary/20">
                <p className="text-sm text-parchment-300 mb-1">Current Rank</p>
                <p className="text-xl font-noir text-evidence-primary">{stats.rank}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="px-4 pb-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6"
        >
          <FeatureCard
            title="Infinite Mysteries"
            description="AI-generated cases mean you'll never run out of mysteries to solve"
            icon={<Sparkles className="w-8 h-8 text-evidence-primary" />}
          />
          <FeatureCard
            title="Quick Sessions"
            description="Perfect for coffee breaks - solve cases in just 5-10 minutes"
            icon={<Clock className="w-8 h-8 text-evidence-primary" />}
          />
          <FeatureCard
            title="Competitive Play"
            description="Climb the ranks and compete with detectives worldwide"
            icon={<Trophy className="w-8 h-8 text-evidence-primary" />}
          />
        </motion.div>
      </section>
    </div>
  )
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="p-6 bg-noir-900/50 backdrop-blur border border-noir-800 rounded-lg hover:border-noir-700 transition-all duration-300"
    >
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-parchment-200 mb-2">{title}</h3>
      <p className="text-sm text-noir-400">{description}</p>
    </motion.div>
  )
}