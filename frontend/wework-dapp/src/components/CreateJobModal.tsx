import { useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Box, Button, Dialog, Flex, Text, TextArea, TextField, Heading } from "@radix-ui/themes";

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
    }) => void;
}

export function CreateJobModal({ open, onClose, onSubmit }: CreateJobModalProps) {
    const account = useCurrentAccount();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        budget: "",
        company: "",
        tags: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newJob = {
            id: Date.now().toString(),
            employer: account?.address || "0x000...000",
            title: formData.title,
            description: formData.description,
            budget: parseInt(formData.budget) || 0,
            is_active: true,
            company: formData.company,
            tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
        };

        onSubmit(newJob);
        setFormData({ title: "", description: "", budget: "", company: "", tags: "" });
    };

    return (
        <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <Dialog.Content style={{ maxWidth: 500 }}>
                <Dialog.Title>
                    <Heading size="5">🚀 Post a New Job</Heading>
                </Dialog.Title>

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

                        <Flex gap="3" mt="4" justify="end">
                            <Dialog.Close>
                                <Button variant="soft" color="gray">Cancel</Button>
                            </Dialog.Close>
                            <Button type="submit" style={{
                                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)",
                                cursor: "pointer"
                            }}>
                                Post Job
                            </Button>
                        </Flex>
                    </Flex>
                </form>
            </Dialog.Content>
        </Dialog.Root>
    );
}
