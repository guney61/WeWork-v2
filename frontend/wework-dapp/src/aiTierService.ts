import axios from 'axios'
import { GitHubProfile } from './store/gitHubIPA'

export interface AITierAnalysis {
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Diamond'
  confidence: number
  reasoning: string
  strengths: string[]
  improvements: string[]
  detailedAnalysis: {
    codeQuality: number
    activityLevel: number
    communityImpact: number
    projectDiversity: number
  }
}

interface GitHubRepo {
  name: string
  description: string
  language: string
  stargazers_count: number
  forks_count: number
  open_issues_count: number
  created_at: string
  updated_at: string
  topics: string[]
}

const GITHUB_API = 'https://api.github.com'

/**
 * AI-based GitHub tier evaluation service
 * Uses advanced algorithms to analyze GitHub profile comprehensively
 */
export class AITierService {
  /**
   * Analyze GitHub profile with AI and determine appropriate tier
   */
  async analyzeProfile(username: string): Promise<AITierAnalysis> {
    try {
      // Fetch comprehensive GitHub data
      const userData = await this.fetchUserData(username)
      const repos = await this.fetchUserRepos(username)
      const events = await this.fetchUserEvents(username)
      
      // Perform AI analysis
      const analysis = await this.performAIAnalysis(userData, repos, events)
      
      return analysis
    } catch (error) {
      console.error('Error in AI tier analysis:', error)
      throw new Error('Failed to analyze GitHub profile')
    }
  }

  private async fetchUserData(username: string) {
    const response = await axios.get(`${GITHUB_API}/users/${username}`)
    return response.data
  }

  private async fetchUserRepos(username: string): Promise<GitHubRepo[]> {
    const response = await axios.get(`${GITHUB_API}/users/${username}/repos`, {
      params: {
        per_page: 100,
        sort: 'updated',
        direction: 'desc',
      },
    })
    return response.data
  }

  private async fetchUserEvents(username: string) {
    try {
      const response = await axios.get(`${GITHUB_API}/users/${username}/events/public`, {
        params: { per_page: 100 },
      })
      return response.data
    } catch (error) {
      console.warn('Could not fetch events:', error)
      return []
    }
  }

  /**
   * AI-powered analysis using multiple factors
   */
  private async performAIAnalysis(
    userData: any,
    repos: GitHubRepo[],
    events: any[]
  ): Promise<AITierAnalysis> {
    // Calculate detailed metrics
    const metrics = this.calculateAdvancedMetrics(userData, repos, events)
    
    // Analyze with AI algorithms
    const aiScores = this.calculateAIScores(metrics)
    
    // Determine tier based on AI analysis
    const tier = this.determineTier(aiScores.overallScore)
    
    // Generate reasoning and recommendations
    const reasoning = this.generateReasoning(metrics, aiScores)
    const strengths = this.identifyStrengths(metrics, aiScores)
    const improvements = this.suggestImprovements(metrics, aiScores)
    
    return {
      tier,
      confidence: aiScores.confidence,
      reasoning,
      strengths,
      improvements,
      detailedAnalysis: {
        codeQuality: aiScores.codeQuality,
        activityLevel: aiScores.activityLevel,
        communityImpact: aiScores.communityImpact,
        projectDiversity: aiScores.projectDiversity,
      },
    }
  }

  private calculateAdvancedMetrics(userData: any, repos: GitHubRepo[], events: any[]) {
    const ownRepos = repos.filter(r => !r.name.includes('fork'))
    const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0)
    const totalForks = repos.reduce((sum, r) => sum + r.forks_count, 0)
    
    // Language diversity
    const languages = new Set(repos.map(r => r.language).filter(Boolean))
    
    // Recent activity (last 3 months)
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
    const recentEvents = events.filter(e => 
      new Date(e.created_at) > threeMonthsAgo
    )
    
    // Repo quality indicators
    const reposWithDescription = repos.filter(r => r.description).length
    const reposWithTopics = repos.filter(r => r.topics && r.topics.length > 0).length
    
    // Community engagement
    const avgStarsPerRepo = ownRepos.length > 0 ? totalStars / ownRepos.length : 0
    const avgForksPerRepo = ownRepos.length > 0 ? totalForks / ownRepos.length : 0
    
    // Activity consistency
    const accountAgeInDays = Math.floor(
      (Date.now() - new Date(userData.created_at).getTime()) / (1000 * 60 * 60 * 24)
    )
    const reposPerYear = accountAgeInDays > 0 
      ? (ownRepos.length / accountAgeInDays) * 365 
      : 0
    
    return {
      followers: userData.followers,
      totalRepos: repos.length,
      ownRepos: ownRepos.length,
      totalStars,
      totalForks,
      languages: languages.size,
      recentActivityCount: recentEvents.length,
      reposWithDescription,
      reposWithTopics,
      avgStarsPerRepo,
      avgForksPerRepo,
      accountAgeInDays,
      reposPerYear,
      following: userData.following,
      publicGists: userData.public_gists || 0,
    }
  }

  private calculateAIScores(metrics: any) {
    // Code Quality Score (0-100)
    const qualityFactors = [
      Math.min((metrics.avgStarsPerRepo / 50) * 100, 100) * 0.3,
      Math.min((metrics.avgForksPerRepo / 10) * 100, 100) * 0.2,
      (metrics.reposWithDescription / Math.max(metrics.totalRepos, 1)) * 100 * 0.25,
      (metrics.reposWithTopics / Math.max(metrics.totalRepos, 1)) * 100 * 0.25,
    ]
    const codeQuality = Math.round(qualityFactors.reduce((a, b) => a + b, 0))
    
    // Activity Level Score (0-100)
    const activityFactors = [
      Math.min((metrics.recentActivityCount / 50) * 100, 100) * 0.4,
      Math.min((metrics.reposPerYear / 5) * 100, 100) * 0.3,
      Math.min((metrics.ownRepos / 20) * 100, 100) * 0.3,
    ]
    const activityLevel = Math.round(activityFactors.reduce((a, b) => a + b, 0))
    
    // Community Impact Score (0-100)
    const communityFactors = [
      Math.min((metrics.followers / 500) * 100, 100) * 0.4,
      Math.min((metrics.totalStars / 1000) * 100, 100) * 0.35,
      Math.min((metrics.totalForks / 200) * 100, 100) * 0.25,
    ]
    const communityImpact = Math.round(communityFactors.reduce((a, b) => a + b, 0))
    
    // Project Diversity Score (0-100)
    const diversityFactors = [
      Math.min((metrics.languages / 5) * 100, 100) * 0.5,
      Math.min((metrics.ownRepos / 15) * 100, 100) * 0.3,
      Math.min((metrics.publicGists / 10) * 100, 100) * 0.2,
    ]
    const projectDiversity = Math.round(diversityFactors.reduce((a, b) => a + b, 0))
    
    // Overall weighted score
    const overallScore = Math.round(
      codeQuality * 0.35 +
      activityLevel * 0.30 +
      communityImpact * 0.25 +
      projectDiversity * 0.10
    )
    
    // Confidence calculation based on data completeness
    const dataCompleteness = [
      metrics.totalRepos > 0 ? 1 : 0,
      metrics.recentActivityCount > 0 ? 1 : 0,
      metrics.followers > 0 ? 1 : 0,
      metrics.accountAgeInDays > 30 ? 1 : 0,
    ].reduce((a, b) => a + b, 0) / 4
    
    const confidence = Math.round(dataCompleteness * 100)
    
    return {
      codeQuality: Math.min(codeQuality, 100),
      activityLevel: Math.min(activityLevel, 100),
      communityImpact: Math.min(communityImpact, 100),
      projectDiversity: Math.min(projectDiversity, 100),
      overallScore: Math.min(overallScore, 100),
      confidence: Math.min(confidence, 100),
    }
  }

  private determineTier(score: number): 'Bronze' | 'Silver' | 'Gold' | 'Diamond' {
    if (score >= 80) return 'Diamond'
    if (score >= 60) return 'Gold'
    if (score >= 40) return 'Silver'
    return 'Bronze'
  }

  private generateReasoning(metrics: any, scores: any): string {
    const tier = this.determineTier(scores.overallScore)
    
    const parts: string[] = []
    
    // Account overview
    parts.push(
      `Profile has ${metrics.ownRepos} repositories with ${metrics.totalStars} total stars across ${metrics.languages} programming languages.`
    )
    
    // Tier justification
    if (tier === 'Diamond') {
      parts.push('Exceptional developer with outstanding code quality, high community impact, and consistent contributions.')
    } else if (tier === 'Gold') {
      parts.push('Strong developer with quality projects, good community engagement, and regular activity.')
    } else if (tier === 'Silver') {
      parts.push('Developing developer with promising work and growing presence in the community.')
    } else {
      parts.push('Beginner developer with room for growth in project quality and community engagement.')
    }
    
    // Highlight strong areas
    if (scores.codeQuality > 70) {
      parts.push('Shows excellent code quality and project documentation.')
    }
    if (scores.activityLevel > 70) {
      parts.push('Demonstrates consistent and active development activity.')
    }
    if (scores.communityImpact > 70) {
      parts.push('Has significant community impact with popular repositories.')
    }
    
    return parts.join(' ')
  }

  private identifyStrengths(metrics: any, scores: any): string[] {
    const strengths: string[] = []
    
    if (scores.codeQuality > 70) {
      strengths.push(`High code quality (${scores.codeQuality}/100)`)
    }
    if (scores.activityLevel > 70) {
      strengths.push(`Very active contributor (${scores.activityLevel}/100)`)
    }
    if (scores.communityImpact > 70) {
      strengths.push(`Strong community presence (${scores.communityImpact}/100)`)
    }
    if (scores.projectDiversity > 70) {
      strengths.push(`Diverse skill set (${metrics.languages} languages)`)
    }
    
    if (metrics.avgStarsPerRepo > 20) {
      strengths.push(`Popular projects (avg ${Math.round(metrics.avgStarsPerRepo)} stars/repo)`)
    }
    if (metrics.followers > 100) {
      strengths.push(`${metrics.followers} followers`)
    }
    if (metrics.recentActivityCount > 30) {
      strengths.push('Highly active in recent months')
    }
    
    return strengths.length > 0 ? strengths : ['Growing developer profile']
  }

  private suggestImprovements(metrics: any, scores: any): string[] {
    const improvements: string[] = []
    
    if (scores.codeQuality < 50) {
      improvements.push('Add more detailed README files and documentation')
      improvements.push('Use topics/tags to categorize repositories')
    }
    if (scores.activityLevel < 50) {
      improvements.push('Increase contribution frequency and consistency')
      improvements.push('Participate in more open source projects')
    }
    if (scores.communityImpact < 50) {
      improvements.push('Create projects that solve real problems')
      improvements.push('Engage more with the developer community')
    }
    if (scores.projectDiversity < 50) {
      improvements.push('Explore different programming languages and technologies')
      improvements.push('Diversify project types and domains')
    }
    
    if (metrics.avgStarsPerRepo < 5) {
      improvements.push('Focus on creating higher quality, more useful projects')
    }
    if (metrics.reposWithDescription / Math.max(metrics.totalRepos, 1) < 0.7) {
      improvements.push('Add descriptions to all repositories')
    }
    if (metrics.followers < 50) {
      improvements.push('Build your developer network and following')
    }
    
    return improvements.length > 0 
      ? improvements 
      : ['Continue building quality projects and engaging with the community']
  }

  /**
   * Combine AI analysis with existing IPA score
   */
  async getEnhancedAnalysis(
    username: string,
    existingProfile: GitHubProfile
  ): Promise<AITierAnalysis & { ipaScore: number; recommendedTier: string }> {
    const aiAnalysis = await this.analyzeProfile(username)
    
    // Compare AI tier with IPA tier
    const aiTierValue = this.getTierValue(aiAnalysis.tier)
    const ipaTierValue = this.getTierValue(existingProfile.tier)
    
    // Use the higher tier, but with reasoning
    const recommendedTier = aiTierValue > ipaTierValue 
      ? aiAnalysis.tier 
      : existingProfile.tier
    
    return {
      ...aiAnalysis,
      ipaScore: existingProfile.ipaScore,
      recommendedTier,
    }
  }

  private getTierValue(tier: string): number {
    const values = { Bronze: 1, Silver: 2, Gold: 3, Diamond: 4 }
    return values[tier as keyof typeof values] || 0
  }
}

export const aiTierService = new AITierService()
