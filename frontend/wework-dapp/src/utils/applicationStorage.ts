// Application Storage Utility
// Stores job applications in localStorage for demo purposes

export interface Application {
    id: string;
    jobId: string;
    jobTitle: string;
    jobBlobId?: string;
    applicantAddress: string;
    applicantName?: string;
    coverLetter: string;
    cvBlobId?: string;
    appliedAt: string;
    status: 'pending' | 'accepted' | 'rejected';
    badgeTier?: 'bronze' | 'silver' | 'gold' | 'diamond';
    badgeScore?: number;
}

interface ApplicationStore {
    applications: Application[];
}

const STORAGE_KEY = 'wework_applications';

/**
 * Get all applications from localStorage
 */
function getStore(): ApplicationStore {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Failed to parse applications:', error);
    }
    return { applications: [] };
}

/**
 * Save store to localStorage
 */
function saveStore(store: ApplicationStore): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

/**
 * Save a new application
 */
export function saveApplication(application: Omit<Application, 'id' | 'appliedAt' | 'status'>): Application {
    const store = getStore();

    const newApplication: Application = {
        ...application,
        id: `app-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        appliedAt: new Date().toISOString(),
        status: 'pending',
    };

    store.applications.push(newApplication);
    saveStore(store);

    console.log('Application saved:', newApplication.id);
    return newApplication;
}

/**
 * Get all applications for a specific job
 */
export function getApplicationsForJob(jobId: string): Application[] {
    const store = getStore();
    return store.applications.filter(app => app.jobId === jobId);
}

/**
 * Get all applications by applicant address
 */
export function getApplicationsByApplicant(address: string): Application[] {
    const store = getStore();
    return store.applications.filter(app => app.applicantAddress === address);
}

/**
 * Update application status (accept/reject)
 */
export function updateApplicationStatus(
    applicationId: string,
    status: 'accepted' | 'rejected'
): Application | null {
    const store = getStore();
    const index = store.applications.findIndex(app => app.id === applicationId);

    if (index === -1) {
        console.error('Application not found:', applicationId);
        return null;
    }

    store.applications[index].status = status;
    saveStore(store);

    console.log(`Application ${applicationId} ${status}`);
    return store.applications[index];
}

/**
 * Get application by ID
 */
export function getApplicationById(applicationId: string): Application | null {
    const store = getStore();
    return store.applications.find(app => app.id === applicationId) || null;
}

/**
 * Get count of pending applications for a job
 */
export function getPendingApplicationCount(jobId: string): number {
    const apps = getApplicationsForJob(jobId);
    return apps.filter(app => app.status === 'pending').length;
}
