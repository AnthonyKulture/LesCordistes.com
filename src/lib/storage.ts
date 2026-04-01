import type { JobFormData } from '../types';

const STORAGE_KEY = 'lescordistes_draft_job';

export const saveJobDraft = (data: Partial<JobFormData>) => {
    try {
        // We only save basic data, not File objects (photos)
        const { photos, ...rest } = data;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
    } catch (error) {
        console.error('Error saving job draft:', error);
    }
};

export const loadJobDraft = (): Partial<JobFormData> | null => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : null;
    } catch (error) {
        console.error('Error loading job draft:', error);
        return null;
    }
};

export const clearJobDraft = () => {
    localStorage.removeItem(STORAGE_KEY);
};
