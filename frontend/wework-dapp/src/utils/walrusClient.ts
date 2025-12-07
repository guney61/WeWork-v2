// Walrus Decentralized Storage Client
// Testnet endpoints for uploading and fetching job data

// Try multiple Walrus publishers (fallback chain)
const WALRUS_PUBLISHERS = [
    'https://publisher.walrus-testnet.walrus.space',
    'https://walrus-testnet-publisher.nodes.guru',
    'https://walrus-testnet-publisher.nodeinfra.com',
];
const WALRUS_AGGREGATOR = 'https://aggregator.walrus-testnet.walrus.space';

// Duration options with pricing (in SUI)
export const DURATION_OPTIONS = [
    { label: '2 Weeks', epochs: 1, price: 0.1, days: 14 },
    { label: '1 Month', epochs: 2, price: 0.18, days: 30 },
    { label: '3 Months', epochs: 6, price: 0.5, days: 90 },
    { label: '6 Months', epochs: 12, price: 0.9, days: 180 },
] as const;

export type DurationOption = typeof DURATION_OPTIONS[number];

export interface JobData {
    id: string;
    title: string;
    company: string;
    description: string;
    budget: number;
    tags: string[];
    employer: string;
    createdAt: string;
    expiresAt: string;
    epochs: number;
}

export interface WalrusUploadResult {
    blobId: string;
    url: string;
    expiresAt: string;
    epochs: number;
    isLocalFallback?: boolean;
}

/**
 * Calculate storage fee based on selected duration
 */
export function calculateStorageFee(epochs: number): number {
    const option = DURATION_OPTIONS.find(o => o.epochs === epochs);
    return option?.price || 0.1;
}

/**
 * Get expiration date based on epochs
 */
export function calculateExpirationDate(epochs: number): Date {
    const days = epochs * 14; // Each epoch is 14 days
    const expiration = new Date();
    expiration.setDate(expiration.getDate() + days);
    return expiration;
}

/**
 * Try uploading to multiple Walrus endpoints
 */
async function tryWalrusUpload(blob: Blob, epochs: number): Promise<{ blobId: string } | null> {
    for (const publisher of WALRUS_PUBLISHERS) {
        try {
            console.log(`Trying Walrus publisher: ${publisher}`);
            const response = await fetch(`${publisher}/v1/store?epochs=${epochs}`, {
                method: 'PUT',
                body: blob,
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Walrus upload response:', result);

                if (result.newlyCreated) {
                    return { blobId: result.newlyCreated.blobObject.blobId };
                } else if (result.alreadyCertified) {
                    return { blobId: result.alreadyCertified.blobId };
                }
            }
            console.warn(`Publisher ${publisher} returned:`, response.status);
        } catch (error) {
            console.warn(`Publisher ${publisher} failed:`, error);
        }
    }
    return null;
}

/**
 * Upload job data to Walrus storage with localStorage fallback
 */
export async function uploadJobToWalrus(
    jobData: Omit<JobData, 'id' | 'createdAt' | 'expiresAt'>,
    epochs: number
): Promise<WalrusUploadResult> {
    const createdAt = new Date().toISOString();
    const expiresAt = calculateExpirationDate(epochs).toISOString();
    const jobId = `job-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const fullJobData: JobData = {
        ...jobData,
        id: jobId,
        createdAt,
        expiresAt,
        epochs,
    };

    const jobJson = JSON.stringify(fullJobData, null, 2);
    const blob = new Blob([jobJson], { type: 'application/json' });

    console.log('Uploading job:', fullJobData.id);

    // Try Walrus first
    const walrusResult = await tryWalrusUpload(blob, epochs);

    if (walrusResult) {
        console.log('Walrus upload successful:', walrusResult.blobId);
        return {
            blobId: walrusResult.blobId,
            url: `${WALRUS_AGGREGATOR}/v1/${walrusResult.blobId}`,
            expiresAt,
            epochs,
        };
    }

    // Fallback: Store in localStorage for demo
    console.log('Walrus unavailable, using localStorage fallback');
    const localBlobId = `local-${jobId}`;

    // Store in localStorage
    const storedJobs = JSON.parse(localStorage.getItem('wework_jobs') || '{}');
    storedJobs[localBlobId] = fullJobData;
    localStorage.setItem('wework_jobs', JSON.stringify(storedJobs));

    return {
        blobId: localBlobId,
        url: `local://${localBlobId}`,
        expiresAt,
        epochs,
        isLocalFallback: true,
    };
}

/**
 * Fetch job data from Walrus storage or localStorage
 */
export async function fetchJobFromWalrus(blobId: string): Promise<JobData> {
    console.log('Fetching job:', blobId);

    // Check if it's a local blob
    if (blobId.startsWith('local-')) {
        const storedJobs = JSON.parse(localStorage.getItem('wework_jobs') || '{}');
        if (storedJobs[blobId]) {
            console.log('Fetched from localStorage:', blobId);
            return storedJobs[blobId];
        }
        throw new Error(`Local job not found: ${blobId}`);
    }

    // Try Walrus aggregator
    try {
        const response = await fetch(`${WALRUS_AGGREGATOR}/v1/${blobId}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch job: ${response.status}`);
        }

        const jobData: JobData = await response.json();
        console.log('Fetched from Walrus:', jobData.id);
        return jobData;
    } catch (error) {
        console.error('Failed to fetch from Walrus:', error);
        throw error;
    }
}

/**
 * Format price for display
 */
export function formatSuiPrice(price: number): string {
    return `${price} SUI`;
}

/**
 * Get duration label from epochs
 */
export function getDurationLabel(epochs: number): string {
    const option = DURATION_OPTIONS.find(o => o.epochs === epochs);
    return option?.label || `${epochs * 14} days`;
}
