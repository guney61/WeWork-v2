import { useState } from 'react';
import { Box, Button, Card, Flex, Heading, Text, TextField, Spinner } from "@radix-ui/themes";
import { useAITierStore } from '../store/aiTierStore';
import TierBadge from './TierBadge';
import TierAnalysisDetails from './TierAnalysisDetails';

export default function AIGitHubTierAnalyzer() {
    const [username, setUsername] = useState('');
    const [showDetails, setShowDetails] = useState(false);
    const { analysis, loading, error, analyzeGitHubProfile, clearAnalysis } = useAITierStore();

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim()) return;
        await analyzeGitHubProfile(username);
    };

    const handleClear = () => {
        setUsername('');
        clearAnalysis();
        setShowDetails(false);
    };

    return (
        <Card style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
        }}>
            <Flex direction="column" gap="4">
                {/* Header */}
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
                        <Heading size="4">AI GitHub Tier Analyzer</Heading>
                        <Text size="1" color="gray">Advanced AI-powered profile evaluation</Text>
                    </Box>
                </Flex>

                {/* Search Form */}
                <form onSubmit={handleAnalyze}>
                    <Flex gap="2">
                        <TextField.Root
                            style={{ flex: 1 }}
                            placeholder="Enter GitHub username..."
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={loading}
                        />
                        <Button
                            type="submit"
                            disabled={loading || !username.trim()}
                            style={{
                                background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                                cursor: loading ? 'wait' : 'pointer',
                            }}
                        >
                            {loading ? <Spinner size="1" /> : '🔍 Analyze'}
                        </Button>
                        {analysis && (
                            <Button type="button" variant="soft" color="gray" onClick={handleClear}>
                                Clear
                            </Button>
                        )}
                    </Flex>
                </form>

                {/* Error */}
                {error && (
                    <Card style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                        <Flex gap="2" align="center">
                            <Text>⚠️</Text>
                            <Text color="red">{error}</Text>
                        </Flex>
                    </Card>
                )}

                {/* Results */}
                {analysis && (
                    <Flex direction="column" gap="4">
                        {/* Tier Result */}
                        <Card style={{ background: 'var(--gray-a2)' }}>
                            <Flex justify="between" align="center">
                                <Box>
                                    <Text size="1" color="gray" mb="1">AI Assigned Tier</Text>
                                    <TierBadge tier={analysis.tier} />
                                </Box>
                                <Box style={{ textAlign: 'right' }}>
                                    <Text size="1" color="gray">Confidence</Text>
                                    <Text size="5" weight="bold" style={{ color: '#06b6d4' }}>
                                        {analysis.confidence}%
                                    </Text>
                                </Box>
                            </Flex>

                            {/* Developer Type */}
                            {'developerType' in analysis && (
                                <Flex align="center" gap="2" mt="3" style={{
                                    background: 'var(--gray-a3)',
                                    padding: '8px 12px',
                                    borderRadius: 8,
                                    display: 'inline-flex',
                                }}>
                                    <Text size="4">{(analysis as any).developerTypeEmoji}</Text>
                                    <Text weight="bold">{(analysis as any).developerType}</Text>
                                </Flex>
                            )}

                            <Text size="2" color="gray" mt="3">{analysis.reasoning}</Text>
                        </Card>

                        {/* Languages */}
                        {'languages' in analysis && (analysis as any).languages.length > 0 && (
                            <Card style={{ background: 'var(--gray-a2)' }}>
                                <Heading size="3" mb="3">💻 Programming Languages</Heading>
                                <Flex wrap="wrap" gap="2">
                                    {(analysis as any).languages.map((lang: any, i: number) => (
                                        <Box key={i} style={{
                                            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                                            padding: '6px 12px',
                                            borderRadius: 20,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 6,
                                        }}>
                                            <Text size="2" weight="bold" style={{ color: 'white' }}>
                                                {lang.name}
                                            </Text>
                                            <Text size="1" style={{ color: 'rgba(255,255,255,0.8)' }}>
                                                {lang.percentage}%
                                            </Text>
                                            {lang.stars > 0 && (
                                                <Text size="1" style={{ color: '#ffd700' }}>⭐{lang.stars}</Text>
                                            )}
                                        </Box>
                                    ))}
                                </Flex>
                            </Card>
                        )}

                        {/* Expertise */}
                        {'expertise' in analysis && (analysis as any).expertise.length > 0 && (
                            <Card style={{ background: 'var(--gray-a2)' }}>
                                <Heading size="3" mb="3">🎯 Areas of Expertise</Heading>
                                <Flex wrap="wrap" gap="2">
                                    {(analysis as any).expertise.map((exp: string, i: number) => (
                                        <Box key={i} style={{
                                            background: 'var(--gray-a4)',
                                            padding: '4px 10px',
                                            borderRadius: 6,
                                        }}>
                                            <Text size="2">{exp}</Text>
                                        </Box>
                                    ))}
                                </Flex>
                            </Card>
                        )}

                        {/* Score Bars */}
                        <Card style={{ background: 'var(--gray-a2)' }}>
                            <Heading size="3" mb="3">📊 AI Analysis Breakdown</Heading>
                            <Flex direction="column" gap="3">
                                <ScoreBar label="Code Quality" score={analysis.detailedAnalysis.codeQuality} icon="💎" color="#06b6d4" />
                                <ScoreBar label="Activity Level" score={analysis.detailedAnalysis.activityLevel} icon="⚡" color="#eab308" />
                                <ScoreBar label="Community Impact" score={analysis.detailedAnalysis.communityImpact} icon="🌟" color="#a855f7" />
                                <ScoreBar label="Project Diversity" score={analysis.detailedAnalysis.projectDiversity} icon="🎯" color="#22c55e" />
                            </Flex>
                        </Card>

                        {/* Strengths */}
                        {analysis.strengths.length > 0 && (
                            <Card style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                                <Heading size="3" mb="2" style={{ color: '#22c55e' }}>✨ Key Strengths</Heading>
                                <Flex direction="column" gap="1">
                                    {analysis.strengths.map((s, i) => (
                                        <Flex key={i} gap="2"><Text style={{ color: '#22c55e' }}>✓</Text><Text size="2">{s}</Text></Flex>
                                    ))}
                                </Flex>
                            </Card>
                        )}

                        {/* Improvements */}
                        {analysis.improvements.length > 0 && (
                            <Card style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                                <Heading size="3" mb="2" style={{ color: '#3b82f6' }}>💡 Growth Opportunities</Heading>
                                <Flex direction="column" gap="1">
                                    {analysis.improvements.map((s, i) => (
                                        <Flex key={i} gap="2"><Text style={{ color: '#3b82f6' }}>→</Text><Text size="2">{s}</Text></Flex>
                                    ))}
                                </Flex>
                            </Card>
                        )}

                        {/* View Details */}
                        <Button
                            onClick={() => setShowDetails(true)}
                            style={{
                                background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                                cursor: 'pointer',
                            }}
                        >
                            🔍 View Detailed Analysis
                        </Button>
                    </Flex>
                )}
            </Flex>

            {/* Details Modal */}
            {analysis && showDetails && (
                <TierAnalysisDetails
                    analysis={analysis}
                    username={username}
                    onClose={() => setShowDetails(false)}
                />
            )}
        </Card>
    );
}

interface ScoreBarProps {
    label: string;
    score: number;
    icon: string;
    color: string;
}

function ScoreBar({ label, score, icon, color }: ScoreBarProps) {
    return (
        <Box>
            <Flex justify="between" align="center" mb="1">
                <Flex gap="2" align="center">
                    <Text>{icon}</Text>
                    <Text size="2">{label}</Text>
                </Flex>
                <Text size="2" weight="bold" style={{ color }}>{score}/100</Text>
            </Flex>
            <Box style={{
                width: '100%',
                height: 8,
                background: 'var(--gray-a4)',
                borderRadius: 4,
                overflow: 'hidden',
            }}>
                <Box style={{
                    width: `${score}%`,
                    height: '100%',
                    background: color,
                    borderRadius: 4,
                    transition: 'width 0.5s ease',
                }} />
            </Box>
        </Box>
    );
}
