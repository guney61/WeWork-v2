import { Box, Flex, Text, Tooltip } from "@radix-ui/themes";
import { getBadgeInfo, type BadgeTier, type ScoreBreakdown } from "../utils/githubScoring";

interface ProfileBadgeProps {
    tier: BadgeTier;
    score?: number;
    size?: 'sm' | 'md' | 'lg';
    showTooltip?: boolean;
    breakdown?: ScoreBreakdown;
}

export function ProfileBadge({
    tier,
    score,
    size = 'md',
    showTooltip = true,
    breakdown
}: ProfileBadgeProps) {
    const badgeInfo = getBadgeInfo(tier);

    const sizes = {
        sm: { emoji: '1.5rem', padding: '4px 12px', fontSize: '0.75rem' },
        md: { emoji: '2rem', padding: '8px 16px', fontSize: '0.875rem' },
        lg: { emoji: '3rem', padding: '12px 24px', fontSize: '1rem' },
    };

    const currentSize = sizes[size];
    const isDiamond = tier === 'diamond';

    const badgeContent = (
        <Box
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: currentSize.padding,
                background: badgeInfo.gradient,
                borderRadius: 100,
                cursor: showTooltip ? 'help' : 'default',
                boxShadow: `0 4px 20px ${badgeInfo.color}40`,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            className="profile-badge"
        >
            <Text style={{ fontSize: currentSize.emoji }}>{badgeInfo.emoji}</Text>
            <Flex direction="column" gap="0">
                <Text
                    weight="bold"
                    style={{
                        fontSize: currentSize.fontSize,
                        color: isDiamond ? '#6366f1' : 'white',
                        lineHeight: 1.2,
                    }}
                >
                    {badgeInfo.label}
                </Text>
                {score !== undefined && (
                    <Text
                        size="1"
                        style={{
                            color: isDiamond ? 'rgba(26,26,46,0.7)' : 'rgba(255,255,255,0.8)',
                            lineHeight: 1,
                        }}
                    >
                        {score} pts
                    </Text>
                )}
            </Flex>
        </Box>
    );

    if (showTooltip && breakdown) {
        return (
            <Tooltip content={
                <Flex direction="column" gap="1" p="2">
                    <Text weight="bold" size="2">Score Breakdown</Text>
                    <Text size="1">📁 Repos: {breakdown.repoScore} pts</Text>
                    <Text size="1">👥 Followers: {breakdown.followerScore} pts</Text>
                    <Text size="1">📅 Account Age: {breakdown.ageScore} pts</Text>
                    <Text size="1">🔥 Activity: {breakdown.activityScore} pts</Text>
                    <Box style={{ borderTop: '1px solid var(--gray-a5)', marginTop: 4, paddingTop: 4 }}>
                        <Text size="2" weight="bold">Total: {breakdown.totalScore} pts</Text>
                    </Box>
                </Flex>
            }>
                {badgeContent}
            </Tooltip>
        );
    }

    return badgeContent;
}

// Mini badge for compact display
interface MiniBadgeProps {
    tier: BadgeTier;
}

export function MiniBadge({ tier }: MiniBadgeProps) {
    const badgeInfo = getBadgeInfo(tier);

    return (
        <Box
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 28,
                height: 28,
                background: badgeInfo.gradient,
                borderRadius: '50%',
                boxShadow: `0 2px 8px ${badgeInfo.color}40`,
            }}
        >
            <Text style={{ fontSize: '0.9rem' }}>{badgeInfo.emoji}</Text>
        </Box>
    );
}

// Badge with animation for earning moment
interface AnimatedBadgeProps {
    tier: BadgeTier;
    score: number;
    onAnimationEnd?: () => void;
}

export function AnimatedBadge({ tier, score, onAnimationEnd }: AnimatedBadgeProps) {
    const badgeInfo = getBadgeInfo(tier);

    return (
        <Flex
            direction="column"
            align="center"
            gap="4"
            style={{
                animation: 'badgeReveal 1s ease-out forwards',
            }}
        >
            <Box
                style={{
                    fontSize: '6rem',
                    animation: 'badgeBounce 0.6s ease-out 0.5s forwards',
                    transform: 'scale(0)',
                }}
                onAnimationEnd={onAnimationEnd}
            >
                {badgeInfo.emoji}
            </Box>

            <Text
                size="7"
                weight="bold"
                style={{
                    background: badgeInfo.gradient,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}
            >
                {badgeInfo.label} Developer!
            </Text>

            <Text size="5" color="gray">
                You earned {score} points
            </Text>

            <style>{`
        @keyframes badgeReveal {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes badgeBounce {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        
        .profile-badge:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 24px var(--badge-shadow);
        }
      `}</style>
        </Flex>
    );
}
