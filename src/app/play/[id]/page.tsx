'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Clock, 
  FileText, 
  Users, 
  Search, 
  Lightbulb,
  Send,
  X,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMystery } from '@/hooks/use-mystery'
import { useMysteryStore } from '@/lib/stores/mystery-store'
import { cn } from '@/lib/utils'

type GamePhase = 'investigation' | 'deduction' | 'solution'

export default function PlayPage() {
  const params = useParams()
  const router = useRouter()
  const mysteryId = params.id as string
  
  const [gamePhase, setGamePhase] = useState<GamePhase>('investigation')
  const [selectedEvidence, setSelectedEvidence] = useState<string[]>([])
  const [selectedSuspect, setSelectedSuspect] = useState<string>('')
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [showHint, setShowHint] = useState(false)
  
  const { data: mystery, isLoading } = useMystery(mysteryId)
  const {
    characters,
    evidence,
    timeline,
    discoveredEvidence,
    interviewedCharacters,
    notes,
    setCurrentMystery,
    discoverEvidence,
    interviewCharacter,
    addNote,
  } = useMysteryStore()
  
  // Set current mystery when loaded
  useEffect(() => {
    if (mystery) {
      setCurrentMystery(mystery)
    }
  }, [mystery, setCurrentMystery])
  
  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  if (isLoading || !mystery) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-evidence-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-noir-400">Loading mystery...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-noir-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-noir-900/90 backdrop-blur border-b border-noir-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-noir text-parchment-200">{mystery.title}</h1>
            <p className="text-sm text-noir-400">
              {gamePhase === 'investigation' && 'Gather Evidence'}
              {gamePhase === 'deduction' && 'Form Your Theory'}
              {gamePhase === 'solution' && 'Submit Your Solution'}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-parchment-200">
              <Clock className="w-5 h-5" />
              <span className="font-detective">{formatTime(timeElapsed)}</span>
            </div>
            
            <Button
              onClick={() => setShowHint(true)}
              variant="outline"
              className="border-evidence-primary/30 hover:bg-evidence-primary/10"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              Hint
            </Button>
            
            <Button
              onClick={() => router.push('/')}
              variant="ghost"
              size="icon"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>
      
      {/* Game Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Investigation Area */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="wait">
              {gamePhase === 'investigation' && (
                <InvestigationPhase
                  characters={characters}
                  evidence={evidence}
                  timeline={timeline}
                  onDiscoverEvidence={discoverEvidence}
                  onInterviewCharacter={interviewCharacter}
                  discoveredEvidence={discoveredEvidence}
                  interviewedCharacters={interviewedCharacters}
                />
              )}
              
              {gamePhase === 'deduction' && (
                <DeductionPhase
                  characters={characters}
                  evidence={evidence.filter((e) => discoveredEvidence.includes(e.id))}
                  onSelectEvidence={setSelectedEvidence}
                  onSelectSuspect={setSelectedSuspect}
                  selectedEvidence={selectedEvidence}
                  selectedSuspect={selectedSuspect}
                />
              )}
            </AnimatePresence>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Case Notes */}
            <div className="bg-noir-900/50 rounded-lg border border-noir-800 p-6">
              <h3 className="text-lg font-bold text-parchment-200 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Case Notes
              </h3>
              <div className="space-y-2">
                <textarea
                  className="w-full h-32 bg-noir-800/50 border border-noir-700 rounded p-3 text-sm text-noir-200 placeholder-noir-500 resize-none"
                  placeholder="Take notes during your investigation..."
                  onChange={(e) => addNote(e.target.value)}
                />
              </div>
            </div>
            
            {/* Progress */}
            <div className="bg-noir-900/50 rounded-lg border border-noir-800 p-6">
              <h3 className="text-lg font-bold text-parchment-200 mb-4">Progress</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-noir-400">Evidence Found</span>
                    <span className="text-parchment-200">
                      {discoveredEvidence.length}/{evidence.length}
                    </span>
                  </div>
                  <div className="w-full bg-noir-800 rounded-full h-2">
                    <div
                      className="bg-evidence-primary h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(discoveredEvidence.length / evidence.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-noir-400">Interviews</span>
                    <span className="text-parchment-200">
                      {interviewedCharacters.length}/{characters.length}
                    </span>
                  </div>
                  <div className="w-full bg-noir-800 rounded-full h-2">
                    <div
                      className="bg-evidence-primary h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(interviewedCharacters.length / characters.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
              
              {discoveredEvidence.length === evidence.length && 
               interviewedCharacters.length === characters.length && (
                <Button
                  onClick={() => setGamePhase('deduction')}
                  className="w-full mt-4 btn-evidence"
                >
                  Proceed to Deduction
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Hint Modal */}
      <AnimatePresence>
        {showHint && (
          <HintModal onClose={() => setShowHint(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}

function InvestigationPhase({
  characters,
  evidence,
  timeline,
  onDiscoverEvidence,
  onInterviewCharacter,
  discoveredEvidence,
  interviewedCharacters,
}: any) {
  const [activeTab, setActiveTab] = useState<'scene' | 'interviews' | 'timeline'>('scene')
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Investigation Tabs */}
      <div className="flex gap-2 p-1 bg-noir-900/50 rounded-lg">
        {['scene', 'interviews', 'timeline'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={cn(
              "flex-1 px-4 py-2 rounded-md font-medium transition-all",
              activeTab === tab
                ? "bg-noir-800 text-parchment-200"
                : "text-noir-400 hover:text-parchment-200"
            )}
          >
            {tab === 'scene' && 'Crime Scene'}
            {tab === 'interviews' && 'Interviews'}
            {tab === 'timeline' && 'Timeline'}
          </button>
        ))}
      </div>
      
      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'scene' && (
          <motion.div
            key="scene"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid md:grid-cols-2 gap-4"
          >
            {evidence.map((item: any) => (
              <EvidenceCard
                key={item.id}
                evidence={item}
                isDiscovered={discoveredEvidence.includes(item.id)}
                onDiscover={() => onDiscoverEvidence(item.id)}
              />
            ))}
          </motion.div>
        )}
        
        {activeTab === 'interviews' && (
          <motion.div
            key="interviews"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid md:grid-cols-2 gap-4"
          >
            {characters.map((character: any) => (
              <CharacterCard
                key={character.id}
                character={character}
                isInterviewed={interviewedCharacters.includes(character.id)}
                onInterview={() => onInterviewCharacter(character.id)}
              />
            ))}
          </motion.div>
        )}
        
        {activeTab === 'timeline' && (
          <motion.div
            key="timeline"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {timeline.map((event: any, index: number) => (
              <TimelineEvent key={index} event={event} index={index} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function DeductionPhase({
  characters,
  evidence,
  onSelectEvidence,
  onSelectSuspect,
  selectedEvidence,
  selectedSuspect,
}: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="case-file">
        <h2 className="text-2xl font-noir mb-6">Form Your Accusation</h2>
        
        {/* Select Suspect */}
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4">Who is the culprit?</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {characters.map((character: any) => (
              <button
                key={character.id}
                onClick={() => onSelectSuspect(character.id)}
                className={cn(
                  "p-4 rounded-lg border-2 text-left transition-all",
                  selectedSuspect === character.id
                    ? "border-blood-500 bg-blood-500/10"
                    : "border-noir-700 hover:border-noir-600"
                )}
              >
                <p className="font-bold">{character.name}</p>
                <p className="text-sm text-noir-600">{character.role}</p>
              </button>
            ))}
          </div>
        </div>
        
        {/* Select Evidence */}
        <div>
          <h3 className="text-lg font-bold mb-4">Key Evidence (select up to 3)</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {evidence.map((item: any) => (
              <button
                key={item.id}
                onClick={() => {
                  if (selectedEvidence.includes(item.id)) {
                    onSelectEvidence(selectedEvidence.filter((id: string) => id !== item.id))
                  } else if (selectedEvidence.length < 3) {
                    onSelectEvidence([...selectedEvidence, item.id])
                  }
                }}
                disabled={selectedEvidence.length >= 3 && !selectedEvidence.includes(item.id)}
                className={cn(
                  "p-4 rounded-lg border-2 text-left transition-all",
                  selectedEvidence.includes(item.id)
                    ? "border-evidence-primary bg-evidence-primary/10"
                    : "border-noir-700 hover:border-noir-600 disabled:opacity-50"
                )}
              >
                <p className="font-bold">{item.name}</p>
                <p className="text-sm text-noir-600">{item.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function EvidenceCard({ evidence, isDiscovered, onDiscover }: any) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={cn(
        "evidence-card cursor-pointer",
        isDiscovered && "border-evidence-primary"
      )}
      onClick={onDiscover}
    >
      <div className="flex items-start gap-3">
        <Search className={cn(
          "w-5 h-5 mt-1",
          isDiscovered ? "text-evidence-primary" : "text-noir-400"
        )} />
        <div className="flex-1">
          <h4 className="font-bold text-parchment-200 mb-1">{evidence.name}</h4>
          {isDiscovered ? (
            <p className="text-sm text-noir-300">{evidence.description}</p>
          ) : (
            <p className="text-sm text-noir-500 italic">Click to examine...</p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function CharacterCard({ character, isInterviewed, onInterview }: any) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={cn(
        "evidence-card cursor-pointer",
        isInterviewed && "border-evidence-primary"
      )}
      onClick={onInterview}
    >
      <div className="flex items-start gap-3">
        <Users className={cn(
          "w-5 h-5 mt-1",
          isInterviewed ? "text-evidence-primary" : "text-noir-400"
        )} />
        <div className="flex-1">
          <h4 className="font-bold text-parchment-200">{character.name}</h4>
          <p className="text-sm text-noir-400 mb-2">{character.role}</p>
          {isInterviewed ? (
            <>
              <p className="text-sm text-noir-300 mb-1">
                <span className="font-medium">Alibi:</span> {character.alibi}
              </p>
              {character.motive && (
                <p className="text-sm text-blood-400">
                  <span className="font-medium">Motive:</span> {character.motive}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-noir-500 italic">Click to interview...</p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function TimelineEvent({ event, index }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative pl-8"
    >
      <div className="absolute left-0 top-2 w-3 h-3 bg-evidence-primary rounded-full" />
      <div className="absolute left-1.5 top-5 bottom-0 w-0.5 bg-noir-700" />
      
      <div className="evidence-card">
        <p className="font-detective text-evidence-primary mb-1">{event.time}</p>
        <p className="text-noir-200">{event.event}</p>
        {event.visibility === 'partial' && (
          <p className="text-sm text-noir-500 italic mt-1">Some details unclear...</p>
        )}
      </div>
    </motion.div>
  )
}

function HintModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-noir-900 border border-evidence-primary/30 rounded-lg p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-noir text-evidence-primary mb-4">Detective's Hint</h3>
        <p className="text-noir-300 mb-6">
          Pay close attention to the timeline. Not everyone was where they claimed to be...
        </p>
        <Button onClick={onClose} className="w-full btn-noir">
          Continue Investigation
        </Button>
      </motion.div>
    </motion.div>
  )
}