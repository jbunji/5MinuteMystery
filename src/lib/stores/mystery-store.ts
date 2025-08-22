import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Evidence {
  id: string
  name: string
  description: string
  discovered: boolean
  type: string
}

interface Character {
  id: string
  name: string
  role: string
  description: string
  interviewed: boolean
}

interface MysteryState {
  // Current mystery data
  currentMysteryId: string | null
  title: string
  synopsis: string
  setting: any
  characters: Character[]
  evidence: Evidence[]
  timeline: any[]
  
  // Player progress
  discoveredEvidence: string[]
  interviewedCharacters: string[]
  notes: string[]
  timeSpent: number
  hintsUsed: number
  
  // Actions
  setCurrentMystery: (mystery: any) => void
  discoverEvidence: (evidenceId: string) => void
  interviewCharacter: (characterId: string) => void
  addNote: (note: string) => void
  useHint: () => void
  resetProgress: () => void
  updateTimeSpent: (seconds: number) => void
}

export const useMysteryStore = create<MysteryState>()(
  persist(
    (set) => ({
      // Initial state
      currentMysteryId: null,
      title: '',
      synopsis: '',
      setting: null,
      characters: [],
      evidence: [],
      timeline: [],
      discoveredEvidence: [],
      interviewedCharacters: [],
      notes: [],
      timeSpent: 0,
      hintsUsed: 0,
      
      // Actions
      setCurrentMystery: (mystery) => set({
        currentMysteryId: mystery.id,
        title: mystery.title,
        synopsis: mystery.synopsis,
        setting: mystery.caseData?.setting || {},
        characters: mystery.caseData?.characters?.map((char: any) => ({
          ...char,
          interviewed: false,
        })) || [],
        evidence: mystery.evidence?.map((ev: any) => ({
          ...ev,
          discovered: false,
        })) || [],
        timeline: mystery.caseData?.timeline || [],
        discoveredEvidence: [],
        interviewedCharacters: [],
        notes: [],
        timeSpent: 0,
        hintsUsed: 0,
      }),
      
      discoverEvidence: (evidenceId) => set((state) => ({
        discoveredEvidence: [...state.discoveredEvidence, evidenceId],
        evidence: state.evidence.map((ev) =>
          ev.id === evidenceId ? { ...ev, discovered: true } : ev
        ),
      })),
      
      interviewCharacter: (characterId) => set((state) => ({
        interviewedCharacters: [...state.interviewedCharacters, characterId],
        characters: state.characters.map((char) =>
          char.id === characterId ? { ...char, interviewed: true } : char
        ),
      })),
      
      addNote: (note) => set((state) => ({
        notes: [...state.notes, note],
      })),
      
      useHint: () => set((state) => ({
        hintsUsed: state.hintsUsed + 1,
      })),
      
      updateTimeSpent: (seconds) => set({ timeSpent: seconds }),
      
      resetProgress: () => set({
        currentMysteryId: null,
        title: '',
        synopsis: '',
        setting: null,
        characters: [],
        evidence: [],
        timeline: [],
        discoveredEvidence: [],
        interviewedCharacters: [],
        notes: [],
        timeSpent: 0,
        hintsUsed: 0,
      }),
    }),
    {
      name: 'mystery-progress',
      partialize: (state) => ({
        currentMysteryId: state.currentMysteryId,
        discoveredEvidence: state.discoveredEvidence,
        interviewedCharacters: state.interviewedCharacters,
        notes: state.notes,
        timeSpent: state.timeSpent,
        hintsUsed: state.hintsUsed,
      }),
    }
  )
)