import { useState, useEffect } from "react";
import { Box, Button, Card, Flex, Text, Heading, Dialog, Tooltip } from "@radix-ui/themes";
import { getGitHubAuthUrl } from "../utils/githubAuth";
import { calculateGitHubScore, getBadgeInfo, type ScoreBreakdown } from "../utils/githubScoring";

interface GitHubConnectProps {
    onConnect?: (data: { username: string; score: ScoreBreakdown }) => void;
    savedData?: {
        username: string;
        score: ScoreBreakdown;
        avatarUrl?: string;
    } | null;
}

export function GitHubConnect({ onConnect, savedData }: GitHubConnectProps) {
    const [isConnecting, setIsConnecting] = useState(false);
    const [connected, setConnected] = useState(false);
    const [showDemo, setShowDemo] = useState(false);
    const [scoreData, setScoreData] = useState<ScoreBreakdown | null>(null);
    const [username, setUsername] = useState<string>('');

    // Check if already connected via props or localStorage
    useEffect(() => {
        if (savedData) {
            setConnected(true);
            setScoreData(savedData.score);
            setUsername(savedData.username);
        } else {
            // Check localStorage
            const saved = localStorage.getItem('wework_github_data');
            if (saved) {
                try {
                    const data = JSON.parse(saved);
                    setConnected(true);
                    setScoreData(data.score);
                    setUsername(data.username);
                } catch (e) {
                    console.error('Failed to parse saved GitHub data');
                }
            }
        }
    }, [savedData]);

    const handleConnect = () => {
        setIsConnecting(true);
        // Redirect to GitHub OAuth
        window.location.href = getGitHubAuthUrl();
    };

    const handleDisconnect = () => {
        setConnected(false);
        setScoreData(null);
        setUsername('');
        localStorage.removeItem('wework_github_data');
    };

    // Demo profiles for each tier
    const demoProfiles = {
        bronze: {
            publicRepos: 8,
            followers: 25,
            createdAt: '2023-06-15T00:00:00Z', // ~1.5 years old
            contributionDays: 30,
            username: 'bronze-dev',
        },
        silver: {
            publicRepos: 35,
            followers: 120,
            createdAt: '2021-03-15T00:00:00Z', // ~3.5 years old
            contributionDays: 100,
            username: 'silver-dev',
        },
        gold: {
            publicRepos: 75,
            followers: 450,
            createdAt: '2018-06-15T00:00:00Z', // ~6.5 years old
            contributionDays: 220,
            username: 'gold-dev',
        },
        diamond: {
            publicRepos: 120,
            followers: 2500,
            createdAt: '2014-01-15T00:00:00Z', // ~11 years old
            contributionDays: 300,
            username: 'diamond-dev',
        },
    };

    // Demo mode for testing without actual OAuth
    const handleDemoConnect = (tier: 'bronze' | 'silver' | 'gold' | 'diamond') => {
        const profile = demoProfiles[tier];
        const mockStats = {
            publicRepos: profile.publicRepos,
            followers: profile.followers,
            createdAt: profile.createdAt,
            contributionDays: profile.contributionDays,
        };

        const score = calculateGitHubScore(mockStats);
        setScoreData(score);
        setConnected(true);
        setShowDemo(false);
        setUsername(profile.username);

        // Save to localStorage
        const saveData = { username: profile.username, score, avatarUrl: '' };
        localStorage.setItem('wework_github_data', JSON.stringify(saveData));

        onConnect?.({ username: profile.username, score });
    };

    // Connected state - show badge and scores
    if (connected && scoreData) {
        const badgeInfo = getBadgeInfo(scoreData.tier);

        return (
            <Card style={{ background: badgeInfo.gradient, border: 'none' }}>
                <Flex direction="column" gap="3" align="center" py="4">
                    {/* Connected badge */}
                    <Flex align="center" gap="2" style={{
                        background: 'rgba(0,0,0,0.2)',
                        padding: '4px 12px',
                        borderRadius: 20,
                    }}>
                        <Box style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: '#00ff00',
                            boxShadow: '0 0 8px #00ff00',
                        }} />
                        <Text size="1" style={{ color: 'white' }}>
                            GitHub Connected - @{username}
                        </Text>
                    </Flex>

                    <Text size="8">{badgeInfo.emoji}</Text>
                    <Heading size="4" style={{ color: scoreData.tier === 'diamond' || scoreData.tier === 'gold' ? '#6366f1' : 'white' }}>
                        {badgeInfo.label} Developer
                    </Heading>
                    <Text size="5" weight="bold" style={{ color: scoreData.tier === 'diamond' || scoreData.tier === 'gold' ? '#6366f1' : 'white' }}>
                        {scoreData.totalScore} Points
                    </Text>

                    <Flex gap="4" mt="2" wrap="wrap" justify="center">
                        <Tooltip content="Repository Score">
                            <Box style={{ textAlign: 'center' }}>
                                <Text size="2" style={{ opacity: 0.8 }}>📁 Repos</Text>
                                <Text weight="bold"> {scoreData.repoScore}</Text>
                            </Box>
                        </Tooltip>
                        <Tooltip content="Follower Score">
                            <Box style={{ textAlign: 'center' }}>
                                <Text size="2" style={{ opacity: 0.8 }}>👥 Followers</Text>
                                <Text weight="bold"> {scoreData.followerScore}</Text>
                            </Box>
                        </Tooltip>
                        <Tooltip content="Account Age Score">
                            <Box style={{ textAlign: 'center' }}>
                                <Text size="2" style={{ opacity: 0.8 }}>📅 Age</Text>
                                <Text weight="bold"> {scoreData.ageScore}</Text>
                            </Box>
                        </Tooltip>
                        <Tooltip content="Activity Score">
                            <Box style={{ textAlign: 'center' }}>
                                <Text size="2" style={{ opacity: 0.8 }}>🔥 Activity</Text>
                                <Text weight="bold"> {scoreData.activityScore}</Text>
                            </Box>
                        </Tooltip>
                    </Flex>

                    <Button
                        variant="soft"
                        mt="3"
                        onClick={handleDisconnect}
                        style={{ cursor: 'pointer' }}
                    >
                        Disconnect GitHub
                    </Button>
                </Flex>
            </Card>
        );
    }

    return (
        <>
            <Card style={{
                background: 'linear-gradient(135deg, rgba(36, 41, 46, 0.9) 0%, rgba(22, 27, 34, 0.9) 100%)',
                border: '1px solid var(--gray-a5)'
            }}>
                <Flex direction="column" gap="4" align="center" py="6">
                    <Box style={{ fontSize: '3rem' }}>
                        <svg height="48" viewBox="0 0 16 16" width="48" fill="white">
                            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                        </svg>
                    </Box>

                    <Heading size="4">Connect Your GitHub</Heading>
                    <Text color="gray" align="center" style={{ maxWidth: 280 }}>
                        Link your GitHub account to earn a developer badge based on your profile stats.
                    </Text>

                    <Flex gap="3" mt="2">
                        <Button
                            size="3"
                            onClick={handleConnect}
                            disabled={isConnecting}
                            style={{
                                background: '#238636',
                                cursor: 'pointer',
                            }}
                        >
                            {isConnecting ? 'Connecting...' : '🔗 Connect GitHub'}
                        </Button>

                        <Button
                            size="3"
                            variant="soft"
                            onClick={() => setShowDemo(true)}
                            style={{ cursor: 'pointer' }}
                        >
                            Demo
                        </Button>
                    </Flex>

                    <Text size="1" color="gray" mt="2">
                        We only access public profile data
                    </Text>
                </Flex>
            </Card>

            {/* Demo Dialog */}
            <Dialog.Root open={showDemo} onOpenChange={setShowDemo}>
                <Dialog.Content style={{ maxWidth: 450 }}>
                    <Dialog.Title>
                        <Heading size="4">🎮 Demo Mode</Heading>
                    </Dialog.Title>
                    <Text color="gray" mt="2">
                        Choose a badge tier to simulate:
                    </Text>

                    <Flex direction="column" gap="3" mt="4">
                        {/* Bronze Demo */}
                        <Card style={{ background: 'linear-gradient(135deg, #cd7f32 0%, #8b4513 100%)', cursor: 'pointer' }}
                            onClick={() => handleDemoConnect('bronze')}>
                            <Flex justify="between" align="center">
                                <Flex gap="3" align="center">
                                    <Text size="5">🥉</Text>
                                    <Box>
                                        <Text weight="bold" style={{ color: 'white' }}>Bronze</Text>
                                        <Text size="1" style={{ color: 'rgba(255,255,255,0.7)' }}>8 repos, 25 followers, 1.5y</Text>
                                    </Box>
                                </Flex>
                                <Text style={{ color: 'white' }}>&lt;90 pts</Text>
                            </Flex>
                        </Card>

                        {/* Silver Demo */}
                        <Card style={{ background: 'linear-gradient(135deg, #e8e8e8 0%, #a8a8a8 100%)', cursor: 'pointer' }}
                            onClick={() => handleDemoConnect('silver')}>
                            <Flex justify="between" align="center">
                                <Flex gap="3" align="center">
                                    <Text size="5">🥈</Text>
                                    <Box>
                                        <Text weight="bold" style={{ color: '#333' }}>Silver</Text>
                                        <Text size="1" style={{ color: 'rgba(0,0,0,0.6)' }}>35 repos, 120 followers, 3.5y</Text>
                                    </Box>
                                </Flex>
                                <Text style={{ color: '#333' }}>90+ pts</Text>
                            </Flex>
                        </Card>

                        {/* Gold Demo */}
                        <Card style={{ background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)', cursor: 'pointer' }}
                            onClick={() => handleDemoConnect('gold')}>
                            <Flex justify="between" align="center">
                                <Flex gap="3" align="center">
                                    <Text size="5">🥇</Text>
                                    <Box>
                                        <Text weight="bold" style={{ color: '#ffd700' }}>Gold</Text>
                                        <Text size="1" style={{ color: 'rgba(255,255,255,0.7)' }}>75 repos, 450 followers, 6.5y</Text>
                                    </Box>
                                </Flex>
                                <Text style={{ color: '#ffd700' }}>150+ pts</Text>
                            </Flex>
                        </Card>

                        {/* Diamond Demo */}
                        <Card style={{ background: 'linear-gradient(135deg, #e0f7ff 0%, #87ceeb 50%, #b9f2ff 100%)', cursor: 'pointer' }}
                            onClick={() => handleDemoConnect('diamond')}>
                            <Flex justify="between" align="center">
                                <Flex gap="3" align="center">
                                    <Text size="5">💎</Text>
                                    <Box>
                                        <Text weight="bold" style={{ color: '#6366f1' }}>Diamond</Text>
                                        <Text size="1" style={{ color: 'rgba(99,102,241,0.8)' }}>120 repos, 2.5k followers, 11y</Text>
                                    </Box>
                                </Flex>
                                <Text style={{ color: '#6366f1' }}>180+ pts</Text>
                            </Flex>
                        </Card>
                    </Flex>

                    <Flex gap="3" mt="4" justify="end">
                        <Dialog.Close>
                            <Button variant="soft" color="gray">Cancel</Button>
                        </Dialog.Close>
                    </Flex>
                </Dialog.Content>
            </Dialog.Root>
        </>
    );
}
