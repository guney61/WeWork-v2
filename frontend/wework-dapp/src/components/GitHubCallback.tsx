import { useEffect, useState, useRef } from "react";
import { Box, Card, Container, Flex, Heading, Text, Spinner } from "@radix-ui/themes";
import { fetchGitHubUser, fetchGitHubContributions } from "../utils/githubAuth";
import { calculateGitHubScore, type ScoreBreakdown } from "../utils/githubScoring";
import { aiTierService, type AITierAnalysis } from "../utils/aiTierService";
import { AnimatedBadge } from "./ProfileBadge";

interface GitHubCallbackProps {
    onSuccess: (data: {
        username: string;
        score: ScoreBreakdown;
        avatarUrl: string;
        accessToken: string;
        aiAnalysis?: AITierAnalysis;
    }) => void;
    onError: (error: string) => void;
}

export function GitHubCallback({ onSuccess, onError }: GitHubCallbackProps) {
    const [status, setStatus] = useState<'loading' | 'exchanging' | 'fetching' | 'scoring' | 'analyzing' | 'success' | 'error'>('loading');
    const [error, setError] = useState<string>('');
    const [scoreData, setScoreData] = useState<ScoreBreakdown | null>(null);
    const hasRun = useRef(false); // Prevent double execution in StrictMode

    useEffect(() => {
        // Guard against double execution
        if (hasRun.current) return;
        hasRun.current = true;

        handleCallback();
    }, []);

    const handleCallback = async () => {
        try {
            // Get the authorization code from URL
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            const errorParam = urlParams.get('error');

            if (errorParam) {
                throw new Error(`GitHub OAuth error: ${errorParam}`);
            }

            if (!code) {
                throw new Error('No authorization code received from GitHub');
            }

            setStatus('exchanging');

            // Exchange code for access token via backend
            const tokenResponse = await fetch('/api/github/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code }),
            });

            if (!tokenResponse.ok) {
                const errorData = await tokenResponse.json().catch(() => ({}));
                handleBackendError(errorData.error || 'Token exchange failed');
                return;
            }

            const { access_token } = await tokenResponse.json();

            setStatus('fetching');

            // Fetch user data
            const user = await fetchGitHubUser(access_token);
            const contributions = await fetchGitHubContributions(user.login, access_token);

            setStatus('scoring');

            // Calculate score
            const stats = {
                publicRepos: user.public_repos,
                followers: user.followers,
                createdAt: user.created_at,
                contributionDays: contributions.contributionDays,
            };

            const score = calculateGitHubScore(stats);
            setScoreData(score);

            // Run AI analysis
            setStatus('analyzing');
            let analysis: AITierAnalysis | undefined;
            try {
                analysis = await aiTierService.analyzeProfile(user.login);
            } catch (aiError) {
                console.warn('AI analysis failed, continuing without it:', aiError);
            }

            setStatus('success');

            // Notify parent after animation
            setTimeout(() => {
                onSuccess({
                    username: user.login,
                    score,
                    avatarUrl: user.avatar_url,
                    accessToken: access_token,
                    aiAnalysis: analysis,
                });
            }, 2000);

        } catch (err) {
            console.error('GitHub callback error:', err);
            setError(err instanceof Error ? err.message : 'Unknown error');
            setStatus('error');
            onError(err instanceof Error ? err.message : 'Unknown error');
        }
    };

    // If backend fails, show error (no fallback anymore)
    const handleBackendError = (errorMessage: string) => {
        setError(`GitHub authentication failed: ${errorMessage}. Please check server configuration.`);
        setStatus('error');
        onError(errorMessage);
    };

    return (
        <Container size="1" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
            <Card style={{ width: '100%', padding: 48 }}>
                <Flex direction="column" align="center" gap="6">
                    {status === 'loading' && (
                        <>
                            <Spinner size="3" />
                            <Heading size="4">Connecting to GitHub...</Heading>
                        </>
                    )}

                    {status === 'exchanging' && (
                        <>
                            <Spinner size="3" />
                            <Heading size="4">Exchanging authorization code...</Heading>
                            <Text color="gray">Authenticating with GitHub</Text>
                        </>
                    )}

                    {status === 'fetching' && (
                        <>
                            <Spinner size="3" />
                            <Heading size="4">Fetching your profile...</Heading>
                            <Text color="gray">Getting repositories, followers, and activity</Text>
                        </>
                    )}

                    {status === 'scoring' && (
                        <>
                            <Spinner size="3" />
                            <Heading size="4">Calculating your score...</Heading>
                            <Text color="gray">Analyzing your GitHub stats</Text>
                        </>
                    )}

                    {status === 'analyzing' && (
                        <>
                            <Spinner size="3" />
                            <Heading size="4">🤖 Running AI Analysis...</Heading>
                            <Text color="gray">Analyzing your projects and expertise</Text>
                        </>
                    )}

                    {status === 'success' && scoreData && (
                        <AnimatedBadge
                            tier={scoreData.tier}
                            score={scoreData.totalScore}
                        />
                    )}

                    {status === 'error' && (
                        <>
                            <Text size="8">❌</Text>
                            <Heading size="4" color="red">Connection Failed</Heading>
                            <Text color="gray" align="center">{error}</Text>
                            <Box mt="4">
                                <Text size="2" color="gray">
                                    Make sure you have set up the backend API at /api/github/token
                                </Text>
                            </Box>
                        </>
                    )}
                </Flex>
            </Card>
        </Container>
    );
}
