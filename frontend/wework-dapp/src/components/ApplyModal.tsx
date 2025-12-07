import { useState, useEffect } from "react";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { Box, Button, Dialog, Flex, Text, TextArea, Heading, Card, Spinner, Checkbox } from "@radix-ui/themes";
import { saveApplication } from "../utils/applicationStorage";
import { getStoredCV, type StoredCV } from "./CVUpload";

// Platform commission configuration
const PLATFORM_WALLET = "0x3671b5e095d53120b798ad1b7ed9c22be6af2c148ba674ec53b972c29378cd35";
const APPLICATION_FEE_MIST = 1_000_000; // 0.001 SUI = 1,000,000 MIST

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
    const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
    const [formData, setFormData] = useState({ message: "" });
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [storedCV, setStoredCV] = useState<StoredCV | null>(null);
    const [shareCV, setShareCV] = useState(false);

    // Load stored CV on open
    useEffect(() => {
        if (open) {
            const cv = getStoredCV();
            setStoredCV(cv);
            if (cv) {
                setShareCV(true); // Default to sharing if CV exists
            }
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!account || !job) return;

        setIsSubmitting(true);

        try {
            // Create transaction to send commission fee
            const tx = new Transaction();
            const [coin] = tx.splitCoins(tx.gas, [APPLICATION_FEE_MIST]);
            tx.transferObjects([coin], PLATFORM_WALLET);

            // Execute the transaction
            await signAndExecute({
                transaction: tx,
            });

            // Get AI analysis from localStorage for employer visibility
            let aiAnalysis = undefined;
            try {
                const savedData = localStorage.getItem('wework_github_data');
                if (savedData) {
                    const parsed = JSON.parse(savedData);
                    if (parsed.aiAnalysis) {
                        aiAnalysis = parsed.aiAnalysis;
                    }
                }
            } catch (e) {
                console.warn('Failed to load AI analysis:', e);
            }

            // Save application to localStorage after successful payment
            saveApplication({
                jobId: job.id,
                jobTitle: job.title,
                jobBlobId: job.blobId,
                applicantAddress: account.address,
                coverLetter: formData.message,
                cvBlobId: shareCV && storedCV ? storedCV.blobId : undefined,
                badgeTier: applicantBadge?.tier,
                badgeScore: applicantBadge?.score,
                aiAnalysis: aiAnalysis,
            });

            console.log("Application submitted with 0.001 SUI fee:", {
                job: job.id,
                worker: account.address,
                badge: applicantBadge?.tier,
                feePaid: "0.001 SUI",
                cvShared: shareCV && storedCV ? storedCV.blobId : "none",
            });

            setSubmitted(true);
        } catch (err) {
            console.error("Application submission failed:", err);
            setError(err instanceof Error ? err.message : "Transaction failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setSubmitted(false);
        setError(null);
        setFormData({ message: "" });
        setShareCV(false);
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

                                    {/* CV Share Option */}
                                    {storedCV && (
                                        <Card style={{
                                            background: "linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)",
                                            border: "1px solid rgba(34, 197, 94, 0.3)"
                                        }}>
                                            <Flex gap="3" align="center">
                                                <Checkbox
                                                    checked={shareCV}
                                                    onCheckedChange={(checked) => setShareCV(checked === true)}
                                                />
                                                <Box style={{ flex: 1 }}>
                                                    <Flex justify="between" align="center">
                                                        <Box>
                                                            <Text size="2" weight="bold">📄 Share my encrypted CV</Text>
                                                            <Text size="1" color="gray">{storedCV.fileName}</Text>
                                                        </Box>
                                                        <Text size="1">🔐</Text>
                                                    </Flex>
                                                </Box>
                                            </Flex>
                                        </Card>
                                    )}

                                    <Box>
                                        <Text size="2" weight="medium" mb="1">Cover Message</Text>
                                        <TextArea
                                            placeholder="Introduce yourself and explain why you're a great fit..."
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            required
                                            style={{ minHeight: 120 }}
                                            disabled={isSubmitting}
                                        />
                                    </Box>

                                    {/* Application Fee Notice */}
                                    <Card style={{
                                        background: "linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)",
                                        border: "1px solid rgba(6, 182, 212, 0.3)"
                                    }}>
                                        <Flex justify="between" align="center">
                                            <Flex gap="2" align="center">
                                                <Text size="4">💎</Text>
                                                <Box>
                                                    <Text size="2" weight="bold">Application Fee</Text>
                                                    <Text size="1" color="gray">Platform commission</Text>
                                                </Box>
                                            </Flex>
                                            <Text size="4" weight="bold" style={{ color: "#06b6d4" }}>0.001 SUI</Text>
                                        </Flex>
                                    </Card>

                                    {/* Error Display */}
                                    {error && (
                                        <Card style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)" }}>
                                            <Flex gap="2" align="center">
                                                <Text>⚠️</Text>
                                                <Text size="2" color="red">{error}</Text>
                                            </Flex>
                                        </Card>
                                    )}

                                    <Flex gap="3" mt="2" justify="end">
                                        <Dialog.Close>
                                            <Button variant="soft" color="gray" disabled={isSubmitting}>Cancel</Button>
                                        </Dialog.Close>
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                            style={{
                                                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)",
                                                cursor: isSubmitting ? "wait" : "pointer",
                                                opacity: isSubmitting ? 0.7 : 1
                                            }}
                                        >
                                            {isSubmitting ? (
                                                <Flex gap="2" align="center">
                                                    <Spinner size="1" />
                                                    <Text>Processing...</Text>
                                                </Flex>
                                            ) : (
                                                "Submit Application (0.001 SUI)"
                                            )}
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
