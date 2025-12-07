// GitHub OAuth Configuration and API utilities

// GitHub OAuth App settings - User needs to create an OAuth App at:
// https://github.com/settings/developers
// Set callback URL to: http://localhost:5173/api/auth/github/callback

export const GITHUB_CONFIG = {
    clientId: import.meta.env.VITE_GITHUB_CLIENT_ID || 'Ov23liKYLdv73mijMQ5X',
    redirectUri: 'http://localhost:5173/api/auth/github/callback',
    scope: 'read:user',
};

export const createGithubAuthUrl = () => {
    const { clientId, redirectUri, scope } = GITHUB_CONFIG;

    return `https://github.com/login/oauth/authorize` +
        `?client_id=${clientId}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&scope=${encodeURIComponent(scope)}`;
};


/**
 * Generate GitHub OAuth URL for login
 */
export function getGitHubAuthUrl(): string {
    const params = new URLSearchParams({
        client_id: GITHUB_CONFIG.clientId,
        redirect_uri: GITHUB_CONFIG.redirectUri,
        scope: GITHUB_CONFIG.scope,
        state: generateRandomState(),
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

/**
 * Generate random state for CSRF protection
 */
function generateRandomState(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Fetch GitHub user profile data
 */
export async function fetchGitHubUser(accessToken: string) {
    console.log('Fetching GitHub user with token:', accessToken ? `${accessToken.substring(0, 10)}...` : 'NO TOKEN');

    if (!accessToken) {
        throw new Error('No access token provided');
    }

    const response = await fetch('https://api.github.com/user', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github.v3+json',
        },
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error('GitHub API error:', response.status, errorBody);
        throw new Error(`Failed to fetch GitHub user: ${response.status}`);
    }

    const userData = await response.json();
    console.log('GitHub user fetched:', userData.login);
    return userData;
}

/**
 * Fetch user's contribution data (approximation using events API)
 * Note: For accurate contribution data, you'd need to use GraphQL API
 */
export async function fetchGitHubContributions(username: string, accessToken?: string) {
    const headers: HeadersInit = {
        Accept: 'application/vnd.github.v3+json',
    };

    if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
    }

    // Fetch user's public events to estimate activity
    const response = await fetch(
        `https://api.github.com/users/${username}/events/public?per_page=100`,
        { headers }
    );

    if (!response.ok) {
        return { contributionDays: 0 };
    }

    const events = await response.json();

    // Count unique days with activity in the last year
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const activeDays = new Set<string>();

    for (const event of events) {
        const eventDate = new Date(event.created_at);
        if (eventDate > oneYearAgo) {
            activeDays.add(eventDate.toISOString().split('T')[0]);
        }
    }

    // Note: This is an approximation. GitHub Events API only shows recent 90 days
    // For production, use GitHub GraphQL API for accurate contribution calendar
    return {
        contributionDays: Math.min(activeDays.size * 4, 365), // Rough estimation
    };
}

/**
 * Exchange OAuth code for access token (requires backend)
 * This should be done server-side to protect client_secret
 */
export async function exchangeCodeForToken(code: string): Promise<string> {
    // In production, this should call your backend API
    // The backend will exchange the code for a token using client_secret

    // For demo purposes, we'll simulate the flow
    // In real implementation:
    // const response = await fetch('/api/github/token', {
    //   method: 'POST',
    //   body: JSON.stringify({ code }),
    // });
    // return response.json().access_token;

    console.log('Code to exchange:', code);
    throw new Error('Backend required for token exchange. Set up /api/github/token endpoint.');
}

/**
 * Combined function to get all GitHub stats for scoring
 */
export async function getGitHubStats(accessToken: string) {
    const user = await fetchGitHubUser(accessToken);
    const contributions = await fetchGitHubContributions(user.login, accessToken);

    return {
        publicRepos: user.public_repos,
        followers: user.followers,
        createdAt: user.created_at,
        contributionDays: contributions.contributionDays,
        username: user.login,
        avatarUrl: user.avatar_url,
        name: user.name || user.login,
    };
}
