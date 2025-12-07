import axios from 'axios';

export interface AITierAnalysis {
    tier: 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
    confidence: number;
    reasoning: string;
    strengths: string[];
    improvements: string[];
    detailedAnalysis: {
        codeQuality: number;
        activityLevel: number;
        communityImpact: number;
        projectDiversity: number;
    };
    // New detailed fields
    languages: LanguageBreakdown[];
    developerType: string;
    developerTypeEmoji: string;
    projectQuality: ProjectQualityAnalysis;
    expertise: string[];
}

export interface LanguageBreakdown {
    name: string;
    percentage: number;
    repoCount: number;
    stars: number;
}

export interface ProjectQualityAnalysis {
    hasReadme: number;
    hasDescription: number;
    hasTopics: number;
    hasLicense: number;
    avgStars: number;
    qualityScore: number;
}

interface GitHubRepo {
    name: string;
    description: string;
    language: string;
    stargazers_count: number;
    forks_count: number;
    open_issues_count: number;
    created_at: string;
    updated_at: string;
    topics: string[];
    license: { name: string } | null;
    has_wiki: boolean;
    fork: boolean;
}

const GITHUB_API = 'https://api.github.com';

// Developer type detection based on languages
const DEVELOPER_TYPES: { [key: string]: { langs: string[]; emoji: string } } = {
    'Blockchain Developer': { langs: ['Move', 'Solidity', 'Rust'], emoji: '⛓️' },
    'Frontend Developer': { langs: ['JavaScript', 'TypeScript', 'Vue', 'CSS', 'HTML'], emoji: '🎨' },
    'Backend Developer': { langs: ['Python', 'Java', 'Go', 'C#', 'PHP', 'Ruby'], emoji: '⚙️' },
    'Mobile Developer': { langs: ['Swift', 'Kotlin', 'Dart', 'Objective-C'], emoji: '📱' },
    'Data Scientist': { langs: ['Python', 'R', 'Jupyter Notebook'], emoji: '📊' },
    'DevOps Engineer': { langs: ['Shell', 'Dockerfile', 'HCL'], emoji: '🔧' },
    'Systems Programmer': { langs: ['C', 'C++', 'Assembly', 'Rust'], emoji: '💻' },
    'Full-Stack Developer': { langs: [], emoji: '🚀' }, // Determined by mix
};

export class AITierService {
    async analyzeProfile(username: string): Promise<AITierAnalysis> {
        try {
            const userData = await this.fetchUserData(username);
            const repos = await this.fetchUserRepos(username);
            const events = await this.fetchUserEvents(username);

            return this.performAIAnalysis(userData, repos, events);
        } catch (error) {
            console.error('Error in AI tier analysis:', error);
            throw new Error('Failed to analyze GitHub profile');
        }
    }

    private async fetchUserData(username: string) {
        const response = await axios.get(`${GITHUB_API}/users/${username}`);
        return response.data;
    }

    private async fetchUserRepos(username: string): Promise<GitHubRepo[]> {
        const response = await axios.get(`${GITHUB_API}/users/${username}/repos`, {
            params: { per_page: 100, sort: 'updated', direction: 'desc' },
        });
        return response.data;
    }

    private async fetchUserEvents(username: string) {
        try {
            const response = await axios.get(`${GITHUB_API}/users/${username}/events/public`, {
                params: { per_page: 100 },
            });
            return response.data;
        } catch {
            return [];
        }
    }

    private performAIAnalysis(userData: any, repos: GitHubRepo[], events: any[]): AITierAnalysis {
        const ownRepos = repos.filter(r => !r.fork);
        const metrics = this.calculateMetrics(userData, ownRepos, events);
        const scores = this.calculateScores(metrics);
        const tier = this.determineTier(scores.overallScore);

        // New detailed analysis
        const languages = this.analyzeLanguages(ownRepos);
        const developerType = this.detectDeveloperType(languages);
        const projectQuality = this.analyzeProjectQuality(ownRepos);
        const expertise = this.identifyExpertise(languages, ownRepos);

        return {
            tier,
            confidence: scores.confidence,
            reasoning: this.generateReasoning(metrics, languages, developerType, tier),
            strengths: this.identifyStrengths(metrics, scores, languages, projectQuality, developerType),
            improvements: this.suggestImprovements(metrics, scores, projectQuality),
            detailedAnalysis: {
                codeQuality: scores.codeQuality,
                activityLevel: scores.activityLevel,
                communityImpact: scores.communityImpact,
                projectDiversity: scores.projectDiversity,
            },
            languages,
            developerType: developerType.type,
            developerTypeEmoji: developerType.emoji,
            projectQuality,
            expertise,
        };
    }

    private analyzeLanguages(repos: GitHubRepo[]): LanguageBreakdown[] {
        const langMap = new Map<string, { count: number; stars: number }>();

        repos.forEach(repo => {
            if (repo.language) {
                const existing = langMap.get(repo.language) || { count: 0, stars: 0 };
                langMap.set(repo.language, {
                    count: existing.count + 1,
                    stars: existing.stars + repo.stargazers_count,
                });
            }
        });

        const total = repos.length || 1;
        const languages: LanguageBreakdown[] = [];

        langMap.forEach((value, name) => {
            languages.push({
                name,
                percentage: Math.round((value.count / total) * 100),
                repoCount: value.count,
                stars: value.stars,
            });
        });

        return languages.sort((a, b) => b.percentage - a.percentage).slice(0, 8);
    }

    private detectDeveloperType(languages: LanguageBreakdown[]): { type: string; emoji: string } {
        if (languages.length === 0) {
            return { type: 'Aspiring Developer', emoji: '🌱' };
        }

        const topLangs = languages.slice(0, 5).map(l => l.name);

        // Check for specific developer types
        for (const [type, config] of Object.entries(DEVELOPER_TYPES)) {
            if (type === 'Full-Stack Developer') continue;
            const matchCount = topLangs.filter(l => config.langs.includes(l)).length;
            if (matchCount >= 2) {
                return { type, emoji: config.emoji };
            }
        }

        // Check for full-stack
        const hasFrontend = topLangs.some(l => ['JavaScript', 'TypeScript', 'Vue', 'CSS'].includes(l));
        const hasBackend = topLangs.some(l => ['Python', 'Java', 'Go', 'Ruby', 'PHP', 'C#'].includes(l));
        if (hasFrontend && hasBackend) {
            return { type: 'Full-Stack Developer', emoji: '🚀' };
        }

        // Default based on top language
        const topLang = languages[0].name;
        if (['JavaScript', 'TypeScript', 'CSS', 'HTML', 'Vue'].includes(topLang)) {
            return { type: 'Frontend Developer', emoji: '🎨' };
        }
        if (['Python', 'Java', 'Go', 'Ruby', 'PHP'].includes(topLang)) {
            return { type: 'Backend Developer', emoji: '⚙️' };
        }

        return { type: 'Software Developer', emoji: '💻' };
    }

    private analyzeProjectQuality(repos: GitHubRepo[]): ProjectQualityAnalysis {
        const total = repos.length || 1;
        const hasReadme = repos.filter(r => r.description || r.has_wiki).length;
        const hasDescription = repos.filter(r => r.description).length;
        const hasTopics = repos.filter(r => r.topics && r.topics.length > 0).length;
        const hasLicense = repos.filter(r => r.license).length;
        const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);

        const qualityScore = Math.round(
            (hasDescription / total) * 30 +
            (hasTopics / total) * 25 +
            (hasLicense / total) * 20 +
            Math.min((totalStars / Math.max(repos.length, 1) / 10) * 25, 25)
        );

        return {
            hasReadme: Math.round((hasReadme / total) * 100),
            hasDescription: Math.round((hasDescription / total) * 100),
            hasTopics: Math.round((hasTopics / total) * 100),
            hasLicense: Math.round((hasLicense / total) * 100),
            avgStars: Math.round(totalStars / total * 10) / 10,
            qualityScore: Math.min(qualityScore, 100),
        };
    }

    private identifyExpertise(languages: LanguageBreakdown[], repos: GitHubRepo[]): string[] {
        const expertise: string[] = [];

        // Language expertise
        const strongLangs = languages.filter(l => l.repoCount >= 3 || l.stars >= 10);
        strongLangs.forEach(lang => {
            expertise.push(`${lang.name} (${lang.repoCount} projects, ${lang.stars}⭐)`);
        });

        // Topic expertise
        const topicCount = new Map<string, number>();
        repos.forEach(repo => {
            repo.topics?.forEach(topic => {
                topicCount.set(topic, (topicCount.get(topic) || 0) + 1);
            });
        });

        const strongTopics = Array.from(topicCount.entries())
            .filter(([, count]) => count >= 2)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        strongTopics.forEach(([topic]) => {
            expertise.push(`#${topic}`);
        });

        return expertise.slice(0, 10);
    }

    private calculateMetrics(userData: any, repos: GitHubRepo[], events: any[]) {
        const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
        const totalForks = repos.reduce((sum, r) => sum + r.forks_count, 0);
        const languages = new Set(repos.map(r => r.language).filter(Boolean));

        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        const recentEvents = events.filter(e => new Date(e.created_at) > threeMonthsAgo);

        const accountAgeInDays = Math.floor(
            (Date.now() - new Date(userData.created_at).getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
            followers: userData.followers,
            totalRepos: repos.length,
            ownRepos: repos.length,
            totalStars,
            totalForks,
            languages: languages.size,
            recentActivityCount: recentEvents.length,
            reposWithDescription: repos.filter(r => r.description).length,
            reposWithTopics: repos.filter(r => r.topics?.length > 0).length,
            avgStarsPerRepo: repos.length > 0 ? totalStars / repos.length : 0,
            avgForksPerRepo: repos.length > 0 ? totalForks / repos.length : 0,
            accountAgeInDays,
            reposPerYear: accountAgeInDays > 0 ? (repos.length / accountAgeInDays) * 365 : 0,
            publicGists: userData.public_gists || 0,
        };
    }

    private calculateScores(metrics: any) {
        const codeQuality = Math.round(
            Math.min((metrics.avgStarsPerRepo / 50) * 100, 100) * 0.3 +
            Math.min((metrics.avgForksPerRepo / 10) * 100, 100) * 0.2 +
            (metrics.reposWithDescription / Math.max(metrics.totalRepos, 1)) * 100 * 0.25 +
            (metrics.reposWithTopics / Math.max(metrics.totalRepos, 1)) * 100 * 0.25
        );

        const activityLevel = Math.round(
            Math.min((metrics.recentActivityCount / 50) * 100, 100) * 0.4 +
            Math.min((metrics.reposPerYear / 5) * 100, 100) * 0.3 +
            Math.min((metrics.ownRepos / 20) * 100, 100) * 0.3
        );

        const communityImpact = Math.round(
            Math.min((metrics.followers / 500) * 100, 100) * 0.4 +
            Math.min((metrics.totalStars / 1000) * 100, 100) * 0.35 +
            Math.min((metrics.totalForks / 200) * 100, 100) * 0.25
        );

        const projectDiversity = Math.round(
            Math.min((metrics.languages / 5) * 100, 100) * 0.5 +
            Math.min((metrics.ownRepos / 15) * 100, 100) * 0.3 +
            Math.min((metrics.publicGists / 10) * 100, 100) * 0.2
        );

        const overallScore = Math.round(
            codeQuality * 0.35 + activityLevel * 0.30 + communityImpact * 0.25 + projectDiversity * 0.10
        );

        const confidence = Math.round(
            [metrics.totalRepos > 0, metrics.recentActivityCount > 0, metrics.followers > 0, metrics.accountAgeInDays > 30]
                .filter(Boolean).length / 4 * 100
        );

        return {
            codeQuality: Math.min(codeQuality, 100),
            activityLevel: Math.min(activityLevel, 100),
            communityImpact: Math.min(communityImpact, 100),
            projectDiversity: Math.min(projectDiversity, 100),
            overallScore: Math.min(overallScore, 100),
            confidence: Math.min(confidence, 100),
        };
    }

    private determineTier(score: number): 'Bronze' | 'Silver' | 'Gold' | 'Diamond' {
        if (score >= 80) return 'Diamond';
        if (score >= 60) return 'Gold';
        if (score >= 40) return 'Silver';
        return 'Bronze';
    }

    private generateReasoning(
        metrics: any,
        languages: LanguageBreakdown[],
        developerType: { type: string; emoji: string },
        tier: string
    ): string {
        const topLangs = languages.slice(0, 3).map(l => l.name).join(', ') || 'various languages';
        const parts = [
            `${developerType.emoji} ${developerType.type} with ${metrics.ownRepos} repositories and ${metrics.totalStars} total stars.`,
            `Primary expertise in ${topLangs}.`,
        ];

        if (tier === 'Diamond') {
            parts.push('Exceptional developer demonstrating outstanding code quality, active contributions, and significant community impact. Highly recommended for senior roles.');
        } else if (tier === 'Gold') {
            parts.push('Strong developer with quality projects and established community presence. Suitable for mid to senior level positions.');
        } else if (tier === 'Silver') {
            parts.push('Developing developer showing promising skills and consistent growth. Great potential for junior to mid-level roles.');
        } else {
            parts.push('Beginner developer building their portfolio. Recommended for internships and entry-level positions.');
        }

        return parts.join(' ');
    }

    private identifyStrengths(
        metrics: any,
        scores: any,
        languages: LanguageBreakdown[],
        projectQuality: ProjectQualityAnalysis,
        developerType: { type: string; emoji: string }
    ): string[] {
        const strengths: string[] = [];

        // Developer type
        strengths.push(`${developerType.emoji} ${developerType.type}`);

        // Language expertise
        const topLangs = languages.slice(0, 3);
        if (topLangs.length > 0) {
            strengths.push(`💻 Proficient in ${topLangs.map(l => l.name).join(', ')}`);
        }

        // Quality metrics
        if (scores.codeQuality > 70) {
            strengths.push(`✨ High code quality (${scores.codeQuality}/100)`);
        }
        if (scores.activityLevel > 70) {
            strengths.push(`⚡ Very active contributor (${scores.activityLevel}/100)`);
        }
        if (scores.communityImpact > 70) {
            strengths.push(`🌟 Strong community presence (${scores.communityImpact}/100)`);
        }
        if (projectQuality.qualityScore > 70) {
            strengths.push(`📦 Well-documented projects (${projectQuality.qualityScore}% quality)`);
        }

        // Specific achievements
        if (metrics.totalStars > 100) {
            strengths.push(`⭐ ${metrics.totalStars} total stars earned`);
        }
        if (metrics.followers > 50) {
            strengths.push(`👥 ${metrics.followers} GitHub followers`);
        }
        if (languages.length >= 5) {
            strengths.push(`🎯 Versatile - ${languages.length} programming languages`);
        }

        return strengths.length > 1 ? strengths : ['🌱 Growing developer profile'];
    }

    private suggestImprovements(metrics: any, scores: any, projectQuality: ProjectQualityAnalysis): string[] {
        const improvements: string[] = [];

        // Documentation
        if (projectQuality.hasDescription < 70) {
            improvements.push('Add detailed README files and descriptions to all repositories');
        }
        if (projectQuality.hasTopics < 50) {
            improvements.push('Use topics/tags to categorize repositories for better discoverability');
        }
        if (projectQuality.hasLicense < 50) {
            improvements.push('Add licenses to projects to clarify usage rights');
        }

        // Activity
        if (scores.activityLevel < 50) {
            improvements.push('Increase contribution frequency and consistency');
            improvements.push('Participate in more open source projects');
        }

        // Community
        if (scores.communityImpact < 50) {
            improvements.push('Create projects that solve real-world problems');
            improvements.push('Engage more with the developer community');
        }
        if (metrics.followers < 50) {
            improvements.push('Build your developer network and following');
        }

        // Quality
        if (projectQuality.avgStars < 5) {
            improvements.push('Focus on creating higher quality, more useful projects');
        }

        // Diversity
        if (scores.projectDiversity < 50) {
            improvements.push('Explore different programming languages and technologies');
            improvements.push('Diversify project types and domains');
        }

        return improvements.length > 0 ? improvements : ['Keep building quality projects and engaging with the community'];
    }
}

export const aiTierService = new AITierService();
