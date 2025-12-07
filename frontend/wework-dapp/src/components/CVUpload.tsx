import { useState, useRef } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Box, Button, Card, Flex, Text, Heading, Spinner, Progress } from "@radix-ui/themes";
import { encryptWithSeal, uploadToWalrus } from "../utils/sealWalrus";

// CV storage key
const CV_STORAGE_KEY = 'wework_encrypted_cv';

export interface StoredCV {
    blobId: string;
    fileName: string;
    fileSize: number;
    uploadedAt: string;
    encryptedForAddress: string;
}

export function getStoredCV(): StoredCV | null {
    const stored = localStorage.getItem(CV_STORAGE_KEY);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch {
            return null;
        }
    }
    return null;
}

export function CVUpload() {
    const account = useCurrentAccount();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [storedCV, setStoredCV] = useState<StoredCV | null>(() => getStoredCV());

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !account) return;

        // Validate file
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            setError("File size must be less than 5MB");
            return;
        }

        if (!file.name.toLowerCase().endsWith('.pdf')) {
            setError("Only PDF files are supported");
            return;
        }

        setError(null);
        setUploading(true);
        setUploadProgress(10);

        try {
            // Read file as base64
            const fileData = await readFileAsBase64(file);
            setUploadProgress(30);

            // Encrypt with SEAL
            const cvData = {
                fileName: file.name,
                fileSize: file.size,
                content: fileData,
                ownerAddress: account.address,
                timestamp: new Date().toISOString(),
            };

            const encrypted = await encryptWithSeal(cvData);
            setUploadProgress(60);

            // Upload to Walrus
            const blob = await uploadToWalrus(encrypted);
            setUploadProgress(90);

            // Save to localStorage
            const cvRecord: StoredCV = {
                blobId: blob.blobId,
                fileName: file.name,
                fileSize: file.size,
                uploadedAt: new Date().toISOString(),
                encryptedForAddress: account.address,
            };

            localStorage.setItem(CV_STORAGE_KEY, JSON.stringify(cvRecord));
            setStoredCV(cvRecord);
            setUploadProgress(100);

            console.log("CV uploaded successfully:", cvRecord);
        } catch (err) {
            console.error("CV upload failed:", err);
            setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
        } finally {
            setUploading(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemoveCV = () => {
        localStorage.removeItem(CV_STORAGE_KEY);
        setStoredCV(null);
    };

    const readFileAsBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    if (!account) {
        return (
            <Card style={{ background: 'var(--gray-a2)' }}>
                <Flex direction="column" align="center" gap="3" py="4">
                    <Text size="5">📄</Text>
                    <Text color="gray">Connect wallet to upload your CV</Text>
                </Flex>
            </Card>
        );
    }

    return (
        <Card style={{
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)',
            border: '1px solid rgba(34, 197, 94, 0.3)'
        }}>
            <Flex direction="column" gap="4">
                {/* Header */}
                <Flex align="center" gap="3">
                    <Box style={{
                        width: 40,
                        height: 40,
                        background: 'linear-gradient(135deg, #22c55e 0%, #06b6d4 100%)',
                        borderRadius: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Text size="5">📄</Text>
                    </Box>
                    <Box>
                        <Heading size="4">Encrypted CV</Heading>
                        <Text size="1" color="gray">SEAL encrypted & stored on Walrus</Text>
                    </Box>
                </Flex>

                {/* Existing CV or Upload */}
                {storedCV ? (
                    <Card style={{ background: 'var(--gray-a3)' }}>
                        <Flex direction="column" gap="3">
                            <Flex justify="between" align="center">
                                <Flex gap="2" align="center">
                                    <Text size="4">✅</Text>
                                    <Box>
                                        <Text weight="bold">{storedCV.fileName}</Text>
                                        <Text size="1" color="gray">
                                            {formatFileSize(storedCV.fileSize)} • Uploaded {new Date(storedCV.uploadedAt).toLocaleDateString()}
                                        </Text>
                                    </Box>
                                </Flex>
                                <Button
                                    size="1"
                                    variant="soft"
                                    color="red"
                                    onClick={handleRemoveCV}
                                >
                                    Remove
                                </Button>
                            </Flex>

                            <Flex gap="2" align="center" style={{
                                background: 'var(--gray-a2)',
                                padding: '8px 12px',
                                borderRadius: 6,
                            }}>
                                <Text size="1" color="gray">Blob ID:</Text>
                                <Text size="1" style={{ fontFamily: 'monospace' }}>
                                    {storedCV.blobId.slice(0, 20)}...
                                </Text>
                                <Text size="1">🔐</Text>
                            </Flex>

                            <Text size="1" color="gray" style={{ textAlign: 'center' }}>
                                💡 Share your CV with employers when applying for jobs
                            </Text>
                        </Flex>
                    </Card>
                ) : (
                    <Box>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                            disabled={uploading}
                        />

                        {uploading ? (
                            <Card style={{ background: 'var(--gray-a3)' }}>
                                <Flex direction="column" gap="3" align="center" py="4">
                                    <Spinner size="3" />
                                    <Text weight="bold">Encrypting & Uploading...</Text>
                                    <Box style={{ width: '100%' }}>
                                        <Progress value={uploadProgress} max={100} />
                                    </Box>
                                    <Text size="1" color="gray">
                                        {uploadProgress < 30 && "Reading file..."}
                                        {uploadProgress >= 30 && uploadProgress < 60 && "Encrypting with SEAL..."}
                                        {uploadProgress >= 60 && uploadProgress < 90 && "Uploading to Walrus..."}
                                        {uploadProgress >= 90 && "Finalizing..."}
                                    </Text>
                                </Flex>
                            </Card>
                        ) : (
                            <Button
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    width: '100%',
                                    background: 'linear-gradient(135deg, #22c55e 0%, #06b6d4 100%)',
                                    cursor: 'pointer',
                                    padding: '16px',
                                }}
                            >
                                <Flex gap="2" align="center">
                                    <Text>📤</Text>
                                    <Text>Upload CV (PDF, max 5MB)</Text>
                                </Flex>
                            </Button>
                        )}
                    </Box>
                )}

                {/* Error */}
                {error && (
                    <Card style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                        <Flex gap="2" align="center">
                            <Text>⚠️</Text>
                            <Text size="2" color="red">{error}</Text>
                        </Flex>
                    </Card>
                )}

                {/* Info */}
                <Text size="1" color="gray" style={{ textAlign: 'center' }}>
                    🔐 Your CV is encrypted with SEAL protocol and stored on Walrus decentralized storage.
                    Only you control who can access it.
                </Text>
            </Flex>
        </Card>
    );
}
