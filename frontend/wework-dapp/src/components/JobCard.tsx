import { Badge, Box, Card, Flex, Heading, Text, Button, Tooltip } from "@radix-ui/themes";

interface JobCardProps {
    job: {
        id: string;
        employer: string;
        title: string;
        description: string;
        budget: number;
        is_active: boolean;
        company: string;
        tags: string[];
        blobId?: string;
        expiresAt?: string;
    };
    onApply: () => void;
}

export function JobCard({ job, onApply }: JobCardProps) {
    const isWalrusStored = !!job.blobId;

    return (
        <Card
            style={{
                background: "linear-gradient(180deg, rgba(99, 102, 241, 0.08) 0%, rgba(6, 182, 212, 0.04) 100%)",
                border: "1px solid var(--gray-a5)",
                cursor: "pointer",
                transition: "all 0.3s ease",
            }}
            className="job-card"
        >
            <Flex direction="column" gap="3">
                {/* Header */}
                <Flex justify="between" align="start">
                    <Flex gap="3" align="center">
                        <Box
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: 12,
                                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 700,
                                fontSize: "1.25rem",
                                color: "white",
                            }}
                        >
                            {job.company?.[0] || "W"}
                        </Box>
                        <Box>
                            <Text weight="bold" size="3">{job.company}</Text>
                            <Text size="1" color="gray">{job.employer.slice(0, 6)}...{job.employer.slice(-4)}</Text>
                        </Box>
                    </Flex>
                    <Flex gap="2" align="center">
                        {isWalrusStored && (
                            <Tooltip content={`Stored on Walrus: ${job.blobId?.slice(0, 12)}...`}>
                                <Badge color="cyan" variant="soft" radius="full">
                                    🦭 Walrus
                                </Badge>
                            </Tooltip>
                        )}
                        {job.is_active && (
                            <Badge color="green" variant="soft" radius="full">
                                Active
                            </Badge>
                        )}
                    </Flex>
                </Flex>

                {/* Title & Description */}
                <Heading size="4" weight="bold">{job.title}</Heading>
                <Text size="2" color="gray" style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden"
                }}>
                    {job.description}
                </Text>

                {/* Tags */}
                <Flex gap="2" wrap="wrap">
                    {job.tags?.map((tag, index) => (
                        <Badge key={index} variant="outline" radius="full">
                            {tag}
                        </Badge>
                    ))}
                </Flex>

                {/* Footer */}
                <Box style={{ borderTop: "1px solid var(--gray-a5)", paddingTop: 16, marginTop: 8 }}>
                    <Flex justify="between" align="center">
                        <Text size="5" weight="bold" style={{
                            background: "linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}>
                            {job.budget.toLocaleString()} <Text size="2" color="gray" style={{ WebkitTextFillColor: "var(--gray-11)" }}>SUI</Text>
                        </Text>
                        <Button onClick={onApply} style={{
                            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)",
                            cursor: "pointer"
                        }}>
                            Apply Now
                        </Button>
                    </Flex>
                </Box>
            </Flex>
        </Card>
    );
}
