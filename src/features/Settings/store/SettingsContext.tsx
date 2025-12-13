import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { AppSettings } from '../types';
import { DEFAULT_SETTINGS } from '../types';
import { SettingsManager } from '../services';

interface SettingsContextValue {
    settings: AppSettings;
    isLoading: boolean;
    error: string | null;
    refreshSettings: () => Promise<void>;
    getCurrency: () => string;
    getCurrencySymbol: () => string;
    formatPrice: (amount: number) => string;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

interface SettingsProviderProps {
    children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadSettings = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        const result = await SettingsManager.getAll();

        if (result.success && result.data) {
            setSettings(result.data);
        } else {
            setError(result.error || 'Failed to load settings');
            // Still set defaults if provided
            if (result.data) {
                setSettings(result.data);
            }
        }

        setIsLoading(false);
    }, []);

    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    const getCurrency = useCallback(() => {
        return settings.currency || DEFAULT_SETTINGS.currency;
    }, [settings.currency]);

    const getCurrencySymbol = useCallback(() => {
        return settings.currency_symbol || DEFAULT_SETTINGS.currency_symbol;
    }, [settings.currency_symbol]);

    const formatPrice = useCallback((amount: number) => {
        const symbol = getCurrencySymbol();
        const formattedAmount = new Intl.NumberFormat('fr-FR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);

        return `${formattedAmount} ${symbol}`;
    }, [getCurrencySymbol]);

    const value: SettingsContextValue = {
        settings,
        isLoading,
        error,
        refreshSettings: loadSettings,
        getCurrency,
        getCurrencySymbol,
        formatPrice,
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings(): SettingsContextValue {
    const context = useContext(SettingsContext);

    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }

    return context;
}
