import { useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Box, Button, Dialog, Flex, Text, TextArea, TextField, Heading, Select, Card, Spinner } from "@radix-ui/themes";
import { DURATION_OPTIONS, calculateStorageFee, uploadJobToWalrus, type DurationOption } from "../utils/walrusClient";
import { useWalrusPayment } from "../hooks/useWalrusPayment";

interface CreateJobModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (job: {
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
    }) => void;
}

type SubmitStep = 'form' | 'confirm' | 'paying' | 'uploading' | 'success' | 'error';

export function CreateJobModal({ open, onClose, onSubmit }: CreateJobModalProps) {
    const account = useCurrentAccount();
    const { payStorageFee } = useWalrusPayment();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        budget: "",
        company: "",
        tags: "",
    });
    const [selectedDuration, setSelectedDuration] = useState<DurationOption>(DURATION_OPTIONS[0]);
    const [step, setStep] = useState<SubmitStep>('form');
    const [error, setError] = useState<string>('');
    const [uploadResult, setUploadResult] = useState<{ blobId: string; expiresAt: string } | null>(null);

    const storageFee = calculateStorageFee(selectedDuration.epochs);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!account) {
            setError('Please connect your wallet first');
            return;
        }
        setStep('confirm');
    };

    const handleConfirmPayment = async () => {
        if (!account) return;


        setStep('paying');
        setError('');

        try {
            // Step 1: Try to pay storage fee (optional for testnet demo)
            let paymentSuccessful = false;
            try {
                const paymentResult = await payStorageFee(storageFee);
                paymentSuccessful = paymentResult.success;
                if (paymentSuccessful) {
                    console.log('Payment successful:', paymentResult.digest);
                } else {
                    console.warn('Payment declined or failed, continuing as demo...');
                }
            } catch (payError) {
                console.warn('Payment error (continuing as demo):', payError);
            }

            // Step 2: Upload to Walrus (continues even if payment failed for demo)
            setStep('uploading');

            const walrusResult = await uploadJobToWalrus({
                title: formData.title,
                company: formData.company,
                description: formData.description,
                budget: parseInt(formData.budget) || 0,
                tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
                employer: account.address,
                epochs: selectedDuration.epochs,
            }, selectedDuration.epochs);

            console.log('Walrus upload successful:', walrusResult.blobId);

            setUploadResult({
                blobId: walrusResult.blobId,
                expiresAt: walrusResult.expiresAt,
            });

            setStep('success');

            // Create job object for parent component
            const newJob = {
                id: walrusResult.blobId,
                employer: account.address,
                title: formData.title,
                description: formData.description,
                budget: parseInt(formData.budget) || 0,
                is_active: true,
                company: formData.company,
                tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
                blobId: walrusResult.blobId,
                expiresAt: walrusResult.expiresAt,
            };

            // Delay for user to see success, then submit
            setTimeout(() => {
                onSubmit(newJob);
                resetForm();
            }, 2000);

        } catch (err) {
            console.error('Job creation failed:', err);
            setError(err instanceof Error ? err.message : 'Failed to create job');
            setStep('error');
        }
    };

    const resetForm = () => {
        setFormData({ title: "", description: "", budget: "", company: "", tags: "" });
        setSelectedDuration(DURATION_OPTIONS[0]);
        setStep('form');
        setError('');
        setUploadResult(null);
    };

    const handleClose = () => {
        if (step !== 'paying' && step !== 'uploading') {
            resetForm();
            onClose();
        }
    };

    // Render based on current step
    const renderContent = () => {
        switch (step) {
            case 'confirm':
                return (
                    <Flex direction="column" gap="4">
                        <Heading size="5">💳 Confirm Payment</Heading>
                        <Text color="gray">Review your job posting details and confirm payment.</Text>

                        <Card style={{ background: 'var(--gray-a2)' }}>
                            <Flex direction="column" gap="2">
                                <Flex justify="between">
                                    <Text>Job Title</Text>
                                    <Text weight="bold">{formData.title}</Text>
                                </Flex>
                                <Flex justify="between">
                                    <Text>Company</Text>
                                    <Text weight="bold">{formData.company}</Text>
                                </Flex>
                                <Flex justify="between">
                                    <Text>Duration</Text>
                                    <Text weight="bold">{selectedDuration.label}</Text>
                                </Flex>
                                <Box style={{ borderTop: '1px solid var(--gray-a5)', paddingTop: 8, marginTop: 8 }}>
                                    <Flex justify="between">
                                        <Text weight="bold">Storage Fee</Text>
                                        <Text weight="bold" style={{ color: '#06b6d4' }}>{storageFee} SUI</Text>
                                    </Flex>
                                </Box>
                            </Flex>
                        </Card>

                        <Text size="1" color="gray">
                            This fee covers decentralized storage on Walrus for {selectedDuration.label.toLowerCase()}.
                        </Text>

                        <Flex gap="3" justify="end">
                            <Button variant="soft" color="gray" onClick={() => setStep('form')}>
                                Back
                            </Button>
                            <Button onClick={handleConfirmPayment} style={{
                                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)",
                                cursor: "pointer"
                            }}>
                                Pay {storageFee} SUI & Post
                            </Button>
                        </Flex>
                    </Flex>
                );

            case 'paying':
                return (
                    <Flex direction="column" align="center" gap="4" py="6">
                        <Spinner size="3" />
                        <Heading size="4">Processing Payment...</Heading>
                        <Text color="gray">Please confirm the transaction in your wallet</Text>
                    </Flex>
                );

            case 'uploading':
                return (
                    <Flex direction="column" align="center" gap="4" py="6">
                        <Spinner size="3" />
                        <Heading size="4">Uploading to Walrus...</Heading>
                        <Text color="gray">Storing your job on decentralized storage</Text>
                    </Flex>
                );

            case 'success':
                return (
                    <Flex direction="column" align="center" gap="4" py="6">
                        <Text size="8">✅</Text>
                        <Heading size="4">Job Posted Successfully!</Heading>
                        <Text color="gray" align="center">
                            Your job is now stored on Walrus decentralized storage.
                        </Text>
                        {uploadResult && (
                            <Card style={{ background: 'var(--gray-a2)', width: '100%' }}>
                                <Flex direction="column" gap="2">
                                    <Text size="1" color="gray">Blob ID:</Text>
                                    <Text size="1" style={{ wordBreak: 'break-all', fontFamily: 'monospace' }}>
                                        {uploadResult.blobId}
                                    </Text>
                                </Flex>
                            </Card>
                        )}
                    </Flex>
                );

            case 'error':
                return (
                    <Flex direction="column" align="center" gap="4" py="6">
                        <Text size="8">❌</Text>
                        <Heading size="4" color="red">Failed</Heading>
                        <Text color="gray" align="center">{error}</Text>
                        <Flex gap="3">
                            <Button variant="soft" onClick={() => setStep('form')}>
                                Try Again
                            </Button>
                        </Flex>
                    </Flex>
                );

            default:
                return (
                    <form onSubmit={handleSubmit}>
                        <Flex direction="column" gap="4" mt="4">
                            <Box>
                                <Text size="2" weight="medium" mb="1">Company Name</Text>
                                <TextField.Root
                                    placeholder="e.g., SuiSwap Labs"
                                    value={formData.company}
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                    required
                                />
                            </Box>

                            <Box>
                                <Text size="2" weight="medium" mb="1">Job Title</Text>
                                <TextField.Root
                                    placeholder="e.g., Senior Smart Contract Developer"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </Box>

                            <Box>
                                <Text size="2" weight="medium" mb="1">Description</Text>
                                <TextArea
                                    placeholder="Describe the role, requirements, and what you're looking for..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                    style={{ minHeight: 120 }}
                                />
                            </Box>

                            <Box>
                                <Text size="2" weight="medium" mb="1">Budget (SUI)</Text>
                                <TextField.Root
                                    type="number"
                                    placeholder="e.g., 5000"
                                    value={formData.budget}
                                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                    required
                                />
                            </Box>

                            <Box>
                                <Text size="2" weight="medium" mb="1">Tags (comma-separated)</Text>
                                <TextField.Root
                                    placeholder="e.g., Move, DeFi, Smart Contracts"
                                    value={formData.tags}
                                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                />
                            </Box>

                            {/* Duration Selector */}
                            <Box>
                                <Text size="2" weight="medium" mb="1">Posting Duration</Text>
                                <Select.Root
                                    value={String(selectedDuration.epochs)}
                                    onValueChange={(value) => {
                                        const duration = DURATION_OPTIONS.find(d => d.epochs === Number(value));
                                        if (duration) setSelectedDuration(duration);
                                    }}
                                >
                                    <Select.Trigger style={{ width: '100%' }} />
                                    <Select.Content>
                                        {DURATION_OPTIONS.map((option) => (
                                            <Select.Item key={option.epochs} value={String(option.epochs)}>
                                                {option.label} - {option.price} SUI
                                            </Select.Item>
                                        ))}
                                    </Select.Content>
                                </Select.Root>
                            </Box>

                            {/* Fee Display */}
                            <Card style={{
                                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)',
                                border: '1px solid rgba(99, 102, 241, 0.3)'
                            }}>
                                <Flex justify="between" align="center">
                                    <Box>
                                        <Text size="2" color="gray">Walrus Storage Fee</Text>
                                        <Text size="1" color="gray">({selectedDuration.label})</Text>
                                    </Box>
                                    <Heading size="4" style={{ color: '#06b6d4' }}>
                                        {storageFee} SUI
                                    </Heading>
                                </Flex>
                            </Card>

                            {!account && (
                                <Text size="2" color="red">
                                    ⚠️ Please connect your wallet to post a job
                                </Text>
                            )}

                            <Flex gap="3" mt="4" justify="end">
                                <Dialog.Close>
                                    <Button variant="soft" color="gray">Cancel</Button>
                                </Dialog.Close>
                                <Button
                                    type="submit"
                                    disabled={!account}
                                    style={{
                                        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)",
                                        cursor: account ? "pointer" : "not-allowed",
                                        opacity: account ? 1 : 0.5,
                                    }}
                                >
                                    Continue to Payment
                                </Button>
                            </Flex>
                        </Flex>
                    </form>
                );
        }
    };

    return (
        <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
            <Dialog.Content style={{ maxWidth: 500 }}>
                {step === 'form' && (
                    <Dialog.Title>
                        <Heading size="5">🚀 Post a New Job</Heading>
                    </Dialog.Title>
                )}
                {renderContent()}
            </Dialog.Content>
        </Dialog.Root>
    );
}
