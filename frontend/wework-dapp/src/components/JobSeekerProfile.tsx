import { useState, useEffect } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Box, Card, Container, Flex, Grid, Heading, Section, Text } from "@radix-ui/themes";
import { GitHubConnect } from "./GitHubConnect";
import { ProfileBadge } from "./ProfileBadge";
import AIGitHubTierAnalyzer from "./AIGitHubTierAnalyzer";
import TierBadge from "./TierBadge";
import { CVUpload } from "./CVUpload";
import type { ScoreBreakdown } from "../utils/githubScoring";
import type { AITierAnalysis } from "../utils/aiTierService";

interface JobSeekerProfileProps {
    onBadgeEarned?: (tier: string, score: number) => void;
    savedGithubData?: {
        username: string;
        score: ScoreBreakdown;
        avatarUrl?: string;
        aiAnalysis?: AITierAnalysis;
    } | null;
}

export function JobSeekerProfile({ onBadgeEarned, savedGithubData }: JobSeekerProfileProps) {
    const account = useCurrentAccount();
    const [githubData, setGithubData] = useState<{
        username: string;
        score: ScoreBreakdown;
        aiAnalysis?: AITierAnalysis;
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

                    {/* AI Analysis Results - Show if we have AI analysis from GitHub connect */}
                    {githubData?.aiAnalysis && (
                        <Card style={{
                            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)',
                            border: '1px solid rgba(6, 182, 212, 0.3)',
                        }}>
                            <Flex direction="column" gap="4">
                                <Flex align="center" gap="3">
                                    <Box style={{
                                        width: 40,
                                        height: 40,
                                        background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                                        borderRadius: 10,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <Text size="5">🤖</Text>
                                    </Box>
                                    <Box>
                                        <Heading size="4">Your AI Profile Analysis</Heading>
                                        <Text size="1" color="gray">Automatically generated from your GitHub</Text>
                                    </Box>
                                    <Box style={{ marginLeft: 'auto' }}>
                                        <TierBadge tier={githubData.aiAnalysis.tier} size="md" />
                                    </Box>
                                </Flex>

                                {/* Developer Type */}
                                {'developerType' in githubData.aiAnalysis && (
                                    <Flex align="center" gap="2" style={{
                                        background: 'var(--gray-a3)',
                                        padding: '8px 12px',
                                        borderRadius: 8,
                                        display: 'inline-flex',
                                        width: 'fit-content',
                                    }}>
                                        <Text size="4">{githubData.aiAnalysis.developerTypeEmoji}</Text>
                                        <Text weight="bold">{githubData.aiAnalysis.developerType}</Text>
                                    </Flex>
                                )}

                                <Text size="2" color="gray">{githubData.aiAnalysis.reasoning}</Text>

                                {/* Languages */}
                                {'languages' in githubData.aiAnalysis && githubData.aiAnalysis.languages.length > 0 && (
                                    <Box>
                                        <Text size="2" weight="bold" mb="2">💻 Programming Languages</Text>
                                        <Flex wrap="wrap" gap="2">
                                            {githubData.aiAnalysis.languages.slice(0, 6).map((lang: any, i: number) => (
                                                <Box key={i} style={{
                                                    background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                                                    padding: '4px 10px',
                                                    borderRadius: 16,
                                                }}>
                                                    <Text size="1" weight="bold" style={{ color: 'white' }}>
                                                        {lang.name} {lang.percentage}%
                                                    </Text>
                                                </Box>
                                            ))}
                                        </Flex>
                                    </Box>
                                )}

                                {/* Strengths */}
                                {githubData.aiAnalysis.strengths.length > 0 && (
                                    <Box>
                                        <Text size="2" weight="bold" style={{ color: '#22c55e' }}>✨ Key Strengths</Text>
                                        <Flex direction="column" gap="1" mt="2">
                                            {githubData.aiAnalysis.strengths.slice(0, 4).map((s: string, i: number) => (
                                                <Flex key={i} gap="2">
                                                    <Text style={{ color: '#22c55e' }}>✓</Text>
                                                    <Text size="2">{s}</Text>
                                                </Flex>
                                            ))}
                                        </Flex>
                                    </Box>
                                )}
                            </Flex>
                        </Card>
                    )}

                    {/* AI GitHub Tier Analyzer - Manual analysis */}
                    <Box mt="4">
                        <AIGitHubTierAnalyzer />
                    </Box>

                    {/* CV Upload Section */}
                    <Box mt="4">
                        <CVUpload />
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
