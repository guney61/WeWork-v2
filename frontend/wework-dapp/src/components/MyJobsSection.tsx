import { useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Box, Card, Container, Flex, Heading, Text, Button, Badge, Section, Dialog, Tooltip } from "@radix-ui/themes";
import { getApplicationsForJob, updateApplicationStatus, type Application } from "../utils/applicationStorage";
import { getBadgeInfo } from "../utils/githubScoring";

interface Job {
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
}

interface MyJobsSectionProps {
    jobs: Job[];
    onJobUpdate?: (job: Job) => void;
}

export function MyJobsSection({ jobs }: MyJobsSectionProps) {
    const account = useCurrentAccount();
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [showApplications, setShowApplications] = useState(false);

    // Filter jobs to only show those posted by current user
    const myJobs = jobs.filter(job =>
        account && job.employer.toLowerCase() === account.address.toLowerCase()
    );

    const handleViewApplications = (job: Job) => {
        setSelectedJob(job);
        const apps = getApplicationsForJob(job.id);
        setApplications(apps);
        setShowApplications(true);
    };

    const handleAcceptApplication = (appId: string) => {
        const updated = updateApplicationStatus(appId, 'accepted');
        if (updated && selectedJob) {
            setApplications(getApplicationsForJob(selectedJob.id));
        }
    };

    const handleRejectApplication = (appId: string) => {
        const updated = updateApplicationStatus(appId, 'rejected');
        if (updated && selectedJob) {
            setApplications(getApplicationsForJob(selectedJob.id));
        }
    };

    if (!account) {
        return (
            <Section size="3">
                <Container size="3">
                    <Card style={{ background: 'var(--gray-a2)', textAlign: 'center', padding: 40 }}>
                        <Heading size="5" mb="3">🔐 Connect Wallet</Heading>
                        <Text color="gray">Connect your wallet to view your posted jobs</Text>
                    </Card>
                </Container>
            </Section>
        );
    }

    if (myJobs.length === 0) {
        return (
            <Section size="3">
                <Container size="3">
                    <Flex direction="column" align="center" gap="4" py="8">
                        <Text size="8">📭</Text>
                        <Heading size="5">No Jobs Posted Yet</Heading>
                        <Text color="gray">You haven't posted any jobs. Create your first job posting!</Text>
                    </Flex>
                </Container>
            </Section>
        );
    }

    return (
        <>
            <Section size="3">
                <Container size="3">
                    <Flex direction="column" gap="6">
                        <Flex justify="between" align="center">
                            <Heading size="6">📋 My Posted Jobs</Heading>
                            <Badge color="purple" size="2">{myJobs.length} Jobs</Badge>
                        </Flex>

                        <Flex direction="column" gap="4">
                            {myJobs.map(job => {
                                const pendingApps = getApplicationsForJob(job.id).filter(a => a.status === 'pending').length;

                                return (
                                    <Card key={job.id} style={{
                                        background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.08) 0%, rgba(6, 182, 212, 0.04) 100%)',
                                        border: '1px solid var(--gray-a5)',
                                    }}>
                                        <Flex direction="column" gap="3">
                                            {/* Header */}
                                            <Flex justify="between" align="start">
                                                <Box>
                                                    <Heading size="4">{job.title}</Heading>
                                                    <Text size="2" color="gray">{job.company}</Text>
                                                </Box>
                                                <Flex gap="2">
                                                    {job.blobId && (
                                                        <Tooltip content={`Walrus ID: ${job.blobId}`}>
                                                            <Badge color="cyan" variant="soft">
                                                                🦭 Walrus
                                                            </Badge>
                                                        </Tooltip>
                                                    )}
                                                    {job.is_active ? (
                                                        <Badge color="green" variant="soft">Active</Badge>
                                                    ) : (
                                                        <Badge color="gray" variant="soft">Closed</Badge>
                                                    )}
                                                </Flex>
                                            </Flex>

                                            {/* Walrus ID */}
                                            {job.blobId && (
                                                <Box style={{
                                                    background: 'var(--gray-a3)',
                                                    padding: '8px 12px',
                                                    borderRadius: 6,
                                                    fontFamily: 'monospace',
                                                    fontSize: '0.75rem',
                                                }}>
                                                    <Text size="1" color="gray">Walrus Blob ID: </Text>
                                                    <Text size="1">{job.blobId}</Text>
                                                </Box>
                                            )}

                                            {/* Budget */}
                                            <Flex justify="between" align="center">
                                                <Text size="4" weight="bold" style={{
                                                    background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                                                    WebkitBackgroundClip: 'text',
                                                    WebkitTextFillColor: 'transparent',
                                                }}>
                                                    {job.budget.toLocaleString()} SUI
                                                </Text>

                                                <Button
                                                    onClick={() => handleViewApplications(job)}
                                                    variant={pendingApps > 0 ? "solid" : "soft"}
                                                    style={{
                                                        cursor: 'pointer',
                                                        background: pendingApps > 0
                                                            ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)'
                                                            : undefined,
                                                    }}
                                                >
                                                    📥 Applications {pendingApps > 0 && `(${pendingApps} new)`}
                                                </Button>
                                            </Flex>
                                        </Flex>
                                    </Card>
                                );
                            })}
                        </Flex>
                    </Flex>
                </Container>
            </Section>

            {/* Applications Modal */}
            <Dialog.Root open={showApplications} onOpenChange={setShowApplications}>
                <Dialog.Content style={{ maxWidth: 600, maxHeight: '80vh', overflow: 'auto' }}>
                    <Dialog.Title>
                        <Heading size="5">📥 Applications for {selectedJob?.title}</Heading>
                    </Dialog.Title>

                    {applications.length === 0 ? (
                        <Flex direction="column" align="center" gap="3" py="6">
                            <Text size="6">📭</Text>
                            <Text color="gray">No applications yet</Text>
                        </Flex>
                    ) : (
                        <Flex direction="column" gap="3" mt="4">
                            {applications.map(app => {
                                const badgeInfo = app.badgeTier ? getBadgeInfo(app.badgeTier) : null;

                                return (
                                    <Card key={app.id} style={{
                                        background: app.status === 'accepted'
                                            ? 'rgba(34, 197, 94, 0.1)'
                                            : app.status === 'rejected'
                                                ? 'rgba(239, 68, 68, 0.1)'
                                                : 'var(--gray-a2)',
                                        border: app.status === 'accepted'
                                            ? '1px solid rgba(34, 197, 94, 0.3)'
                                            : app.status === 'rejected'
                                                ? '1px solid rgba(239, 68, 68, 0.3)'
                                                : '1px solid var(--gray-a4)',
                                    }}>
                                        <Flex direction="column" gap="2">
                                            {/* Applicant Info */}
                                            <Flex justify="between" align="center">
                                                <Flex gap="2" align="center">
                                                    <Text weight="bold" size="2">
                                                        {app.applicantAddress.slice(0, 8)}...{app.applicantAddress.slice(-6)}
                                                    </Text>
                                                    {badgeInfo && (
                                                        <Badge
                                                            style={{
                                                                background: badgeInfo.gradient,
                                                                color: app.badgeTier === 'diamond' || app.badgeTier === 'gold' ? '#6366f1' : 'white',
                                                            }}
                                                        >
                                                            {badgeInfo.emoji} {badgeInfo.label}
                                                        </Badge>
                                                    )}
                                                </Flex>
                                                <Badge
                                                    color={
                                                        app.status === 'accepted' ? 'green' :
                                                            app.status === 'rejected' ? 'red' :
                                                                'yellow'
                                                    }
                                                >
                                                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                                </Badge>
                                            </Flex>

                                            {/* Cover Letter */}
                                            <Box style={{
                                                background: 'var(--gray-a3)',
                                                padding: 12,
                                                borderRadius: 6
                                            }}>
                                                <Text size="2">{app.coverLetter}</Text>
                                            </Box>

                                            {/* CV Blob ID */}
                                            {app.cvBlobId && (
                                                <Text size="1" color="gray">
                                                    📄 CV Blob: {app.cvBlobId}
                                                </Text>
                                            )}

                                            {/* Applied Date */}
                                            <Text size="1" color="gray">
                                                Applied: {new Date(app.appliedAt).toLocaleDateString()}
                                            </Text>

                                            {/* Actions */}
                                            {app.status === 'pending' && (
                                                <Flex gap="2" mt="2">
                                                    <Button
                                                        color="green"
                                                        style={{ cursor: 'pointer', flex: 1 }}
                                                        onClick={() => handleAcceptApplication(app.id)}
                                                    >
                                                        ✅ Accept
                                                    </Button>
                                                    <Button
                                                        color="red"
                                                        variant="soft"
                                                        style={{ cursor: 'pointer', flex: 1 }}
                                                        onClick={() => handleRejectApplication(app.id)}
                                                    >
                                                        ❌ Reject
                                                    </Button>
                                                </Flex>
                                            )}
                                        </Flex>
                                    </Card>
                                );
                            })}
                        </Flex>
                    )}

                    <Flex justify="end" mt="4">
                        <Dialog.Close>
                            <Button variant="soft" color="gray">Close</Button>
                        </Dialog.Close>
                    </Flex>
                </Dialog.Content>
            </Dialog.Root>
        </>
    );
}
