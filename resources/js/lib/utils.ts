import { type ClassValue, clsx } from 'clsx';
import { toast } from 'sonner';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getQueueMessage(applicantsAhead: number) {
    if (applicantsAhead < 50) {
        return 'You are currently in the queue. Your turn is coming up soon. Please stay on this page, you will be redirected automatically.';
    }

    if (applicantsAhead < 300) {
        return 'You are currently in the queue. There are several applicants ahead of you, so there may be a short wait. Please remain on this page and avoid refreshing.';
    }

    if (applicantsAhead < 1000) {
        return 'You are currently in the queue. Due to the number of applicants, waiting time may take longer. Please stay on this page, your position will be maintained and you’ll be redirected automatically.';
    }

    return 'You are currently in the queue. There is a very high number of applicants ahead of you, so waiting time may take several hours or even days. Please stay on this page and avoid refreshing, your position in line will be maintained.';
}

export const capitalizeString = (text: string) => {
    if (!text) return '';
    return text
        .toLowerCase()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

export const handleErrors = (errors: Record<string, string | string[]>) => {
    const errorKeys = Object.keys(errors);

    // 1. Existing Toast Logic
    errorKeys.reverse().forEach((key) => {
        const messages = errors[key];
        if (Array.isArray(messages)) {
            messages.forEach((message) => toast.error(message));
        } else {
            toast.error(messages);
        }
    });

    // 2. Focus Logic: Find the first field with an error
    if (errorKeys.length > 0) {
        // Since we reversed earlier, the first error in the original object is now at the end
        const firstErrorKey = Object.keys(errors)[0];

        // Find element by name or id (common in Inertia forms)
        const element = document.getElementsByName(firstErrorKey)[0] || document.getElementById(firstErrorKey);

        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.focus();
            // Optional: smooth scroll if it's a long form
        }
    }
};

export function sliceText(txt: string, maxLength: number) {
    if (!txt) return '';
    if (txt.length <= maxLength) return txt;
    return txt.slice(0, maxLength) + '...';
}
