import { useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Box, Button, Dialog, Flex, Text, TextArea, TextField, Heading, Card } from "@radix-ui/themes";
import { saveApplication } from "../utils/applicationStorage";

interface ApplyModalProps {
    open: boolean;
    onClose: () => void;
    job: {
        id: string;
        title: string;
        company: string;
        budget: number;
        blobId?: string;
    } | null;
    applicantBadge?: {
        tier: 'bronze' | 'silver' | 'gold' | 'diamond';
        score: number;
    };
}

export function ApplyModal({ open, onClose, job, applicantBadge }: ApplyModalProps) {
    const account = useCurrentAccount();
    const [formData, setFormData] = useState({
        message: "",
        cvBlobId: "",
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!account || !job) return;

        // Save application to localStorage
        saveApplication({
            jobId: job.id,
            jobTitle: job.title,
            jobBlobId: job.blobId,
            applicantAddress: account.address,
            coverLetter: formData.message,
            cvBlobId: formData.cvBlobId || undefined,
            badgeTier: applicantBadge?.tier,
            badgeScore: applicantBadge?.score,
        });

        console.log("Application saved:", {
            job: job.id,
            worker: account.address,
            badge: applicantBadge?.tier,
        });

        setSubmitted(true);
    };

    const handleClose = () => {
        setSubmitted(false);
        setFormData({ message: "", cvBlobId: "" });
        onClose();
    };

    if (!job) return null;

    return (
        <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
            <Dialog.Content style={{ maxWidth: 500 }}>
                {submitted ? (
                    <Flex direction="column" align="center" gap="4" py="6">
                        <Text size="9">🎉</Text>
                        <Heading size="5">Application Submitted!</Heading>
                        <Text color="gray" align="center">
                            Your application for <Text weight="bold">{job.title}</Text> has been submitted successfully.
                        </Text>
                        <Button onClick={handleClose} style={{
                            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)",
                            cursor: "pointer"
                        }}>
                            Close
                        </Button>
                    </Flex>
                ) : (
                    <>
                        <Dialog.Title>
                            <Heading size="5">📝 Apply for Job</Heading>
                        </Dialog.Title>

                        {/* Job Summary */}
                        <Card mt="4" style={{ background: "var(--gray-a2)" }}>
                            <Flex gap="3" align="center">
                                <Box
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 10,
                                        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontWeight: 700,
                                        color: "white",
                                    }}
                                >
                                    {job.company?.[0] || "W"}
                                </Box>
                                <Box>
                                    <Text weight="bold">{job.title}</Text>
                                    <Text size="1" color="gray">{job.company}</Text>
                                </Box>
                            </Flex>
                            <Flex justify="between" mt="3" pt="3" style={{ borderTop: "1px solid var(--gray-a5)" }}>
                                <Text color="gray">Budget</Text>
                                <Text weight="bold" color="iris">{job.budget.toLocaleString()} SUI</Text>
                            </Flex>
                        </Card>

                        {!account ? (
                            <Card mt="4" style={{ textAlign: "center", padding: "48px 24px" }}>
                                <Text size="7">🔗</Text>
                                <Heading size="4" mt="3">Connect Your Wallet</Heading>
                                <Text color="gray">Please connect your wallet to apply for this job.</Text>
                            </Card>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <Flex direction="column" gap="4" mt="4">
                                    <Box>
                                        <Text size="2" weight="medium" mb="1">Your Wallet</Text>
                                        <Box style={{
                                            padding: "12px 16px",
                                            background: "var(--gray-a3)",
                                            borderRadius: 8,
                                            fontFamily: "monospace",
                                            fontSize: "0.9rem",
                                            color: "var(--gray-11)"
                                        }}>
                                            {account.address.slice(0, 10)}...{account.address.slice(-8)}
                                        </Box>
                                    </Box>

                                    <Box>
                                        <Text size="2" weight="medium" mb="1">CV Blob ID (Walrus)</Text>
                                        <TextField.Root
                                            placeholder="Enter your encrypted CV blob ID"
                                            value={formData.cvBlobId}
                                            onChange={(e) => setFormData({ ...formData, cvBlobId: e.target.value })}
                                        />
                                        <Text size="1" color="gray" mt="1">
                                            💡 Upload your CV to Walrus and paste the blob ID here
                                        </Text>
                                    </Box>

                                    <Box>
                                        <Text size="2" weight="medium" mb="1">Cover Message</Text>
                                        <TextArea
                                            placeholder="Introduce yourself and explain why you're a great fit..."
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            required
                                            style={{ minHeight: 120 }}
                                        />
                                    </Box>

                                    <Flex gap="3" mt="2" justify="end">
                                        <Dialog.Close>
                                            <Button variant="soft" color="gray">Cancel</Button>
                                        </Dialog.Close>
                                        <Button type="submit" style={{
                                            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)",
                                            cursor: "pointer"
                                        }}>
                                            Submit Application
                                        </Button>
                                    </Flex>
                                </Flex>
                            </form>
                        )}
                    </>
                )}
            </Dialog.Content>
        </Dialog.Root>
    );
}
