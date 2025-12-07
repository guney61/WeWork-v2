export interface GitHubProfile {
  username: string
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Diamond'
  ipaScore: number
  avatarUrl?: string
  publicRepos: number
  followers: number
  createdAt: string
}
