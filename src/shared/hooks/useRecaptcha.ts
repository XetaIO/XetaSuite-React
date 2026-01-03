import { useCallback, useEffect, useRef } from 'react';

declare global {
    interface Window {
        grecaptcha: {
            ready: (callback: () => void) => void;
            execute: (siteKey: string, options: { action: string }) => Promise<string>;
        };
    }
}

const RECAPTCHA_SCRIPT_ID = 'recaptcha-script';

/**
 * Hook for using Google reCAPTCHA v3
 * Loads the script on mount and provides an execute function
 */
export function useRecaptcha() {
    const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
    const isEnabled = import.meta.env.VITE_RECAPTCHA_ENABLED !== 'false';
    const scriptLoaded = useRef(false);

    useEffect(() => {
        if (!isEnabled || !siteKey || scriptLoaded.current) {
            return;
        }

        // Check if script already exists
        if (document.getElementById(RECAPTCHA_SCRIPT_ID)) {
            scriptLoaded.current = true;
            return;
        }

        const script = document.createElement('script');
        script.id = RECAPTCHA_SCRIPT_ID;
        script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
        script.async = true;
        script.defer = true;

        document.head.appendChild(script);
        scriptLoaded.current = true;

        return () => {
            // Don't remove script on unmount as it might be used by other components
        };
    }, [siteKey, isEnabled]);

    /**
     * Execute reCAPTCHA and get a token
     * @param action The action name for this verification
     * @returns The reCAPTCHA token or null if disabled/failed
     */
    const executeRecaptcha = useCallback(async (action: string): Promise<string | null> => {
        if (!isEnabled) {
            return null;
        }

        if (!siteKey) {
            console.warn('reCAPTCHA site key is not configured');
            return null;
        }

        return new Promise((resolve) => {
            if (typeof window.grecaptcha === 'undefined') {
                console.warn('reCAPTCHA not loaded');
                resolve(null);
                return;
            }

            window.grecaptcha.ready(async () => {
                try {
                    const token = await window.grecaptcha.execute(siteKey, { action });
                    resolve(token);
                } catch (error) {
                    console.error('reCAPTCHA execution failed:', error);
                    resolve(null);
                }
            });
        });
    }, [siteKey, isEnabled]);

    return {
        executeRecaptcha,
        isEnabled,
    };
}
