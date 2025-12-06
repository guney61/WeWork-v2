import { Box, Container, Flex, Grid, Heading, Text, Button, Section } from "@radix-ui/themes";
import { JobCard } from "./JobCard";

interface Job {
    id: string;
    employer: string;
    title: string;
    description: string;
    budget: number;
    is_active: boolean;
    company: string;
    tags: string[];
}

interface HeroSectionProps {
    onPostJob: () => void;
}

export function HeroSection({ onPostJob }: HeroSectionProps) {
    return (
        <Section
            size="3"
            style={{
                background: "radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)",
                minHeight: "70vh",
                display: "flex",
                alignItems: "center",
            }}
        >
            <Container size="3">
                <Flex direction="column" align="center" gap="6" style={{ textAlign: "center" }}>
                    <Box
                        style={{
                            padding: "8px 20px",
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: 100,
                        }}
                    >
                        <Text size="2" color="gray">⚡ Powered by <Text color="cyan">Sui Blockchain</Text></Text>
                    </Box>

                    <Heading size="9" weight="bold" style={{ maxWidth: 700 }}>
                        Find Top{" "}
                        <Text style={{
                            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}>
                            Web3 Talent
                        </Text>
                        <br />Build the Future
                    </Heading>

                    <Text size="4" color="gray" style={{ maxWidth: 500 }}>
                        Connect with verified developers, secure payments with smart contracts,
                        and build your reputation on-chain.
                    </Text>

                    <Flex gap="4" mt="4">
                        <Button size="3" onClick={onPostJob} style={{
                            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)",
                            cursor: "pointer",
                            padding: "12px 32px",
                        }}>
                            🚀 Post a Job
                        </Button>
                        <Button size="3" variant="outline" style={{ cursor: "pointer" }}>
                            💼 Browse Jobs
                        </Button>
                    </Flex>

                    <Flex gap="8" mt="8" style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 32 }}>
                        <Box>
                            <Text size="7" weight="bold" style={{
                                background: "linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                            }}>2.5K+</Text>
                            <Text size="2" color="gray">Active Jobs</Text>
                        </Box>
                        <Box>
                            <Text size="7" weight="bold" style={{
                                background: "linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                            }}>15K+</Text>
                            <Text size="2" color="gray">Developers</Text>
                        </Box>
                        <Box>
                            <Text size="7" weight="bold" style={{
                                background: "linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                            }}>$2.5M</Text>
                            <Text size="2" color="gray">Paid Out</Text>
                        </Box>
                    </Flex>
                </Flex>
            </Container>
        </Section>
    );
}

interface JobsSectionProps {
    jobs: Job[];
    onApply: (job: Job) => void;
}

export function JobsSection({ jobs, onApply }: JobsSectionProps) {
    return (
        <Section size="3" id="jobs">
            <Container size="3">
                <Flex direction="column" align="center" gap="6" mb="8">
                    <Heading size="7">🔥 Featured Jobs</Heading>
                    <Text size="3" color="gray" style={{ textAlign: "center", maxWidth: 600 }}>
                        Discover opportunities from top Web3 companies. All payments secured by smart contracts.
                    </Text>
                </Flex>

                <Grid columns={{ initial: "1", sm: "2" }} gap="5">
                    {jobs.map((job) => (
                        <JobCard key={job.id} job={job} onApply={() => onApply(job)} />
                    ))}
                </Grid>
            </Container>
        </Section>
    );
}
