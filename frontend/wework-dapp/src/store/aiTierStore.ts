import { create } from 'zustand'
import { aiTierService, AITierAnalysis } from '../aiTierService'

interface AITierState {
  analysis: AITierAnalysis | null
  loading: boolean
  error: string | null
  analyzeGitHubProfile: (username: string) => Promise<void>
  clearAnalysis: () => void
}

export const useAITierStore = create<AITierState>((set) => ({
  analysis: null,
  loading: false,
  error: null,
  
  analyzeGitHubProfile: async (username: string) => {
    set({ loading: true, error: null })
    try {
      const analysis = await aiTierService.analyzeProfile(username)
      set({ analysis, loading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to analyze profile',
        loading: false 
      })
    }
  },
  
  clearAnalysis: () => {
    set({ analysis: null, error: null })
  },
}))
