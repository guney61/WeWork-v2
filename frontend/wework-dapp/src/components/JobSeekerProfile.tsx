import { useState, useEffect } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Box, Card, Container, Flex, Grid, Heading, Section, Text } from "@radix-ui/themes";
import { GitHubConnect } from "./GitHubConnect";
import { ProfileBadge } from "./ProfileBadge";
import AIGitHubTierAnalyzer from "../AIGitHubTierAnalyzer";
import type { ScoreBreakdown } from "../utils/githubScoring";

interface JobSeekerProfileProps {
    onBadgeEarned?: (tier: string, score: number) => void;
    savedGithubData?: {
        username: string;
        score: ScoreBreakdown;
        avatarUrl?: string;
    } | null;
}

export function JobSeekerProfile({ onBadgeEarned, savedGithubData }: JobSeekerProfileProps) {
    const account = useCurrentAccount();
    const [githubData, setGithubData] = useState<{
        username: string;
        score: ScoreBreakdown;
    } | null>(null);

    // Initialize from saved data
    useEffect(() => {
        if (savedGithubData) {
            setGithubData(savedGithubData);
        }
    }, [savedGithubData]);

    const handleGitHubConnect = (data: { username: string; score: ScoreBreakdown }) => {
        setGithubData(data);
        // Save to localStorage
        localStorage.setItem('wework_github_data', JSON.stringify(data));
        onBadgeEarned?.(data.score.tier, data.score.totalScore);
    };

    return (
        <Section size="3" id="profile">
            <Container size="3">
                <Flex direction="column" gap="6">
                    <Flex direction="column" align="center" gap="2">
                        <Heading size="7">👤 Job Seeker Profile</Heading>
                        <Text color="gray">Connect your GitHub to earn a developer badge</Text>
                    </Flex>

                    <Grid columns={{ initial: "1", md: "2" }} gap="6">
                        {/* Left: GitHub Connection */}
                        <GitHubConnect onConnect={handleGitHubConnect} savedData={githubData} />

                        {/* Right: Profile Card */}
                        <Card style={{ background: 'var(--gray-a2)' }}>
                            <Flex direction="column" gap="4">
                                <Heading size="4">Your Profile</Heading>

                                {account ? (
                                    <Flex direction="column" gap="3">
                                        <Flex justify="between" align="center">
                                            <Text color="gray">Wallet</Text>
                                            <Text size="2" style={{ fontFamily: 'monospace' }}>
                                                {account.address.slice(0, 8)}...{account.address.slice(-6)}
                                            </Text>
                                        </Flex>

                                        <Flex justify="between" align="center">
                                            <Text color="gray">GitHub</Text>
                                            {githubData ? (
                                                <Text weight="bold" color="green">
                                                    ✓ @{githubData.username}
                                                </Text>
                                            ) : (
                                                <Text color="gray">Not connected</Text>
                                            )}
                                        </Flex>

                                        <Flex justify="between" align="center">
                                            <Text color="gray">Badge</Text>
                                            {githubData ? (
                                                <ProfileBadge
                                                    tier={githubData.score.tier}
                                                    score={githubData.score.totalScore}
                                                    size="sm"
                                                    breakdown={githubData.score}
                                                />
                                            ) : (
                                                <Text color="gray">—</Text>
                                            )}
                                        </Flex>

                                        {githubData && (
                                            <Box
                                                mt="3"
                                                pt="3"
                                                style={{ borderTop: '1px solid var(--gray-a5)' }}
                                            >
                                                <Heading size="3" mb="3">Score Breakdown</Heading>
                                                <Grid columns="2" gap="3">
                                                    <Flex direction="column" align="center" p="3" style={{
                                                        background: 'var(--gray-a3)',
                                                        borderRadius: 8
                                                    }}>
                                                        <Text size="1" color="gray">📁 Repos</Text>
                                                        <Text size="5" weight="bold">{githubData.score.repoScore}</Text>
                                                    </Flex>
                                                    <Flex direction="column" align="center" p="3" style={{
                                                        background: 'var(--gray-a3)',
                                                        borderRadius: 8
                                                    }}>
                                                        <Text size="1" color="gray">👥 Followers</Text>
                                                        <Text size="5" weight="bold">{githubData.score.followerScore}</Text>
                                                    </Flex>
                                                    <Flex direction="column" align="center" p="3" style={{
                                                        background: 'var(--gray-a3)',
                                                        borderRadius: 8
                                                    }}>
                                                        <Text size="1" color="gray">📅 Age</Text>
                                                        <Text size="5" weight="bold">{githubData.score.ageScore}</Text>
                                                    </Flex>
                                                    <Flex direction="column" align="center" p="3" style={{
                                                        background: 'var(--gray-a3)',
                                                        borderRadius: 8
                                                    }}>
                                                        <Text size="1" color="gray">🔥 Activity</Text>
                                                        <Text size="5" weight="bold">{githubData.score.activityScore}</Text>
                                                    </Flex>
                                                </Grid>
                                            </Box>
                                        )}
                                    </Flex>
                                ) : (
                                    <Flex direction="column" align="center" gap="3" py="6">
                                        <Text size="6">🔗</Text>
                                        <Text color="gray" align="center">
                                            Connect your wallet to view your profile
                                        </Text>
                                    </Flex>
                                )}
                            </Flex>
                        </Card>
                    </Grid>

                    {/* AI GitHub Tier Analyzer */}
                    <Box mt="6">
                        <AIGitHubTierAnalyzer />
                    </Box>

                    {/* Badge Tiers Info */}
                    <Card mt="4" style={{ background: 'var(--gray-a2)' }}>
                        <Heading size="4" mb="4">Badge Tiers</Heading>
                        <Grid columns={{ initial: "2", sm: "4" }} gap="4">
                            {[
                                { tier: 'bronze' as const, range: '< 90 pts', desc: 'Getting Started' },
                                { tier: 'silver' as const, range: '90+ pts', desc: 'Experienced' },
                                { tier: 'gold' as const, range: '150+ pts', desc: 'Expert' },
                                { tier: 'diamond' as const, range: '180+ pts', desc: 'Legend' },
                            ].map((item) => (
                                <Flex
                                    key={item.tier}
                                    direction="column"
                                    align="center"
                                    gap="2"
                                    p="4"
                                    style={{
                                        background: 'var(--gray-a3)',
                                        borderRadius: 12,
                                    }}
                                >
                                    <ProfileBadge tier={item.tier} size="sm" showTooltip={false} />
                                    <Text size="2" weight="bold">{item.range}</Text>
                                    <Text size="1" color="gray">{item.desc}</Text>
                                </Flex>
                            ))}
                        </Grid>
                    </Card>
                </Flex>
            </Container>
        </Section>
    );
}
