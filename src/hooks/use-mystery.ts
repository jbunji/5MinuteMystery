import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useMysteryStore } from '@/lib/stores/mystery-store'

export function useDailyMystery() {
  return useQuery({
    queryKey: ['mystery', 'daily'],
    queryFn: async () => {
      const response = await fetch('/api/mysteries/daily')
      if (!response.ok) throw new Error('Failed to fetch daily mystery')
      const data = await response.json()
      return data.mystery
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  })
}

export function useMystery(id: string) {
  return useQuery({
    queryKey: ['mystery', id],
    queryFn: async () => {
      const response = await fetch(`/api/mysteries/${id}`)
      if (!response.ok) throw new Error('Failed to fetch mystery')
      const data = await response.json()
      return data.mystery
    },
    enabled: !!id,
  })
}

export function useStartMystery() {
  const queryClient = useQueryClient()
  const setCurrentMystery = useMysteryStore((state) => state.setCurrentMystery)
  
  return useMutation({
    mutationFn: async ({ mysteryId, userId }: { mysteryId: string; userId: string }) => {
      const response = await fetch(`/api/mysteries/${mysteryId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      if (!response.ok) throw new Error('Failed to start mystery')
      return response.json()
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user', 'mysteries'] })
    },
  })
}

export function useSubmitSolution() {
  const queryClient = useQueryClient()
  const resetProgress = useMysteryStore((state) => state.resetProgress)
  
  return useMutation({
    mutationFn: async ({
      mysteryId,
      userId,
      solution,
    }: {
      mysteryId: string
      userId: string
      solution: {
        culpritId: string
        motive: string
        keyEvidence: string[]
      }
    }) => {
      const response = await fetch(`/api/mysteries/${mysteryId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, solution }),
      })
      if (!response.ok) throw new Error('Failed to submit solution')
      return response.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user', 'stats'] })
      queryClient.invalidateQueries({ queryKey: ['user', 'mysteries'] })
      if (data.isCorrect) {
        resetProgress()
      }
    },
  })
}

export function useHint() {
  const useHintInStore = useMysteryStore((state) => state.useHint)
  
  return useMutation({
    mutationFn: async ({
      mysteryId,
      userId,
      hintLevel,
    }: {
      mysteryId: string
      userId: string
      hintLevel: number
    }) => {
      const response = await fetch(`/api/mysteries/${mysteryId}/hint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, hintLevel }),
      })
      if (!response.ok) throw new Error('Failed to get hint')
      return response.json()
    },
    onSuccess: () => {
      useHintInStore()
    },
  })
}