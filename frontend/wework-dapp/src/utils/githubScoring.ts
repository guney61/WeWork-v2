// GitHub Scoring Algorithm for WeWork Badge System

export interface GitHubStats {
    publicRepos: number;
    followers: number;
    createdAt: string; // ISO date string
    contributionDays: number; // Annual active days
}

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'diamond';

export interface ScoreBreakdown {
    repoScore: number;
    followerScore: number;
    ageScore: number;
    activityScore: number;
    totalScore: number;
    tier: BadgeTier;
}

/**
 * Calculate repo score based on public repository count
 */
function calculateRepoScore(repos: number): number {
    if (repos >= 90) return 50;
    if (repos >= 60) return 30;
    if (repos >= 30) return 20;
    if (repos >= 10) return 10;
    return 0;
}

/**
 * Calculate follower score based on follower count
 */
function calculateFollowerScore(followers: number): number {
    if (followers >= 1000) return 80;
    if (followers >= 200) return 50;
    if (followers >= 100) return 20;
    // <50 followers = 0 points
    return 0;
}

/**
 * Calculate account age score based on profile creation date
 */
function calculateAgeScore(createdAt: string): number {
    const created = new Date(createdAt);
    const now = new Date();
    const years = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24 * 365);

    if (years >= 8) return 60;
    if (years >= 4) return 40;
    if (years >= 2) return 20;
    return 0;
}

/**
 * Calculate activity score based on annual active contribution days
 */
function calculateActivityScore(contributionDays: number): number {
    if (contributionDays >= 250) return 60;
    if (contributionDays >= 200) return 50;
    if (contributionDays >= 50) return 40;
    // <50 days = 30 points (base activity)
    return 30;
}

/**
 * Determine badge tier based on total score
 */
export function getBadgeTier(score: number): BadgeTier {
    if (score >= 180) return 'diamond';
    if (score >= 150) return 'gold';
    if (score >= 90) return 'silver';
    return 'bronze';
}

/**
 * Calculate complete GitHub score breakdown
 */
export function calculateGitHubScore(stats: GitHubStats): ScoreBreakdown {
    const repoScore = calculateRepoScore(stats.publicRepos);
    const followerScore = calculateFollowerScore(stats.followers);
    const ageScore = calculateAgeScore(stats.createdAt);
    const activityScore = calculateActivityScore(stats.contributionDays);

    const totalScore = repoScore + followerScore + ageScore + activityScore;
    const tier = getBadgeTier(totalScore);

    return {
        repoScore,
        followerScore,
        ageScore,
        activityScore,
        totalScore,
        tier,
    };
}

/**
 * Get badge display info
 */
export function getBadgeInfo(tier: BadgeTier) {
    const badges = {
        bronze: { emoji: '🥉', label: 'Bronze', color: '#cd7f32', gradient: 'linear-gradient(135deg, #cd7f32 0%, #8b4513 100%)' },
        silver: { emoji: '🥈', label: 'Silver', color: '#c0c0c0', gradient: 'linear-gradient(135deg, #e8e8e8 0%, #a8a8a8 100%)' },
        gold: { emoji: '🥇', label: 'Gold', color: '#000000', gradient: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)' },
        diamond: { emoji: '💎', label: 'Diamond', color: '#b9f2ff', gradient: 'linear-gradient(135deg, #e0f7ff 0%, #87ceeb 50%, #b9f2ff 100%)' },
    };

    return badges[tier];
}
