import { Box, Flex, Text, Badge } from "@radix-ui/themes";

interface DeveloperBadgeProps {
    tier: string;
    score: number;
    githubId?: string;
}

export function DeveloperBadge({ tier, score }: DeveloperBadgeProps) {
    const getTierEmoji = (tier: string) => {
        switch (tier?.toLowerCase()) {
            case "platinum": return "💎";
            case "gold": return "🥇";
            case "silver": return "🥈";
            case "bronze": return "🥉";
            default: return "⭐";
        }
    };

    const getTierColor = (tier: string): "iris" | "amber" | "gray" | "orange" => {
        switch (tier?.toLowerCase()) {
            case "platinum": return "iris";
            case "gold": return "amber";
            case "silver": return "gray";
            case "bronze": return "orange";
            default: return "iris";
        }
    };

    return (
        <Badge size="2" color={getTierColor(tier)} variant="soft" radius="full">
            <Flex gap="2" align="center">
                <Text>{getTierEmoji(tier)}</Text>
                <Box>
                    <Text weight="bold">{tier || "Starter"}</Text>
                    <Text size="1" color="gray"> • {score} pts</Text>
                </Box>
            </Flex>
        </Badge>
    );
}
