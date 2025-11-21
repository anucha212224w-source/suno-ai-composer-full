
import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { type Language } from '../translations';
import type { FormState, Preset } from '../types';

const LANGUAGE_KEY = 'suno-composer-language';
const THEME_KEY = 'suno-composer-theme';
const WELCOME_KEY = 'suno-composer-welcome-seen';
const API_KEYS_LIST_KEY = 'suno-composer-api-keys-list';
const ACTIVE_API_KEY_KEY = 'suno-composer-active-api-key';
const PRESETS_KEY = 'suno-composer-presets';

type Theme = 'light' | 'dark';

interface AppContextType {
    language: Language;
    handleLanguageChange: (lang: Language) => void;
    theme: Theme;
    toggleTheme: () => void;
    isWelcomeModalOpen: boolean;
    handleCloseWelcomeModal: () => void;
    isSupportModalOpen: boolean;
    handleCloseSupportModal: () => void;
    rateLimitError: string | null;
    setRateLimitError: (error: string | null) => void;
    apiKeys: string[];
    activeApiKey: string | null;
    isApiKeyModalOpen: boolean;
    openApiKeyModal: () => void;
    closeApiKeyModal: () => void;
    addApiKey: (key: string) => void;
    deleteApiKey: (keyToDelete: string) => void;
    setActiveApiKey: (key: string) => void;
    isBugReportModalOpen: boolean;
    openBugReportModal: (errorContext?: string) => void;
    closeBugReportModal: () => void;
    bugReportErrorContext: string | null;
    presets: Preset[];
    addPreset: (preset: Omit<Preset, 'id'>) => void;
    deletePreset: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('th');
    const [theme, setTheme] = useState<Theme>('dark');
    const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
    const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
    const [rateLimitError, setRateLimitError] = useState<string | null>(null);
    
    const [apiKeys, setApiKeys] = useState<string[]>([]);
    const [activeApiKey, setActiveApiKeyInternal] = useState<string | null>(null);
    const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

    const [presets, setPresets] = useState<Preset[]>([]);

    // Bug Report State
    const [isBugReportModalOpen, setIsBugReportModalOpen] = useState(false);
    const [bugReportErrorContext, setBugReportErrorContext] = useState<string | null>(null);

    useEffect(() => {
        try {
            // Language
            const storedLanguage = localStorage.getItem(LANGUAGE_KEY) as Language;
            if (storedLanguage) setLanguage(storedLanguage);
            
            // Theme
            const storedTheme = localStorage.getItem(THEME_KEY) as Theme;
            if (storedTheme) setTheme(storedTheme);
            
            // Welcome Modal
            const welcomeSeen = localStorage.getItem(WELCOME_KEY);
            if (!welcomeSeen) setIsWelcomeModalOpen(true);

            // API Keys - STRICT MODE: No process.env fallback
            const storedKeysJSON = localStorage.getItem(API_KEYS_LIST_KEY);
            const storedKeys = storedKeysJSON ? JSON.parse(storedKeysJSON) : [];
            const storedActiveKey = localStorage.getItem(ACTIVE_API_KEY_KEY);
            
            // We strictly use only what's in local storage.
            // If no keys exist, we will force the modal open.
            let finalKeys = [...storedKeys];
            setApiKeys(finalKeys);
            
            let keyToActivate: string | null = null;
            if (storedActiveKey && finalKeys.includes(storedActiveKey)) {
                keyToActivate = storedActiveKey;
            } else if (finalKeys.length > 0) {
                keyToActivate = finalKeys[0];
            }
            
            if (keyToActivate) {
                setActiveApiKeyInternal(keyToActivate);
                localStorage.setItem(ACTIVE_API_KEY_KEY, keyToActivate);
            } else {
                // No active key found
                setActiveApiKeyInternal(null);
            }

            // Force open if no keys found at all
            if (finalKeys.length === 0) {
                // If welcome modal is visible, we wait for it to close (handled in separate effect)
                // If welcome modal is NOT visible, open API modal immediately
                if (welcomeSeen) {
                    setIsApiKeyModalOpen(true);
                }
            }

            // Presets
            const storedPresetsJSON = localStorage.getItem(PRESETS_KEY);
            if (storedPresetsJSON) {
                setPresets(JSON.parse(storedPresetsJSON));
            }

        } catch (error) {
            console.error("Could not access localStorage:", error);
            setIsWelcomeModalOpen(true);
            setIsApiKeyModalOpen(true);
        }
    }, []);
    
    // Effect to ensure API Key modal is open if no keys exist and welcome is closed
    useEffect(() => {
        if (!isWelcomeModalOpen && apiKeys.length === 0) {
            setIsApiKeyModalOpen(true);
        }
    }, [isWelcomeModalOpen, apiKeys]);

    useEffect(() => {
        document.body.classList.remove('light-theme', 'dark-theme');
        document.body.classList.add(`${theme}-theme`);
    }, [theme]);

    const handleLanguageChange = (lang: Language) => {
        try {
            localStorage.setItem(LANGUAGE_KEY, lang);
        } catch (error) {
            console.error("Could not save language to localStorage:", error);
        }
        setLanguage(lang);
    };

    const toggleTheme = () => {
        setTheme(prevTheme => {
            const newTheme = prevTheme === 'dark' ? 'light' : 'dark';
            try {
                localStorage.setItem(THEME_KEY, newTheme);
            } catch (error) {
                console.error("Could not save theme to localStorage:", error);
            }
            return newTheme;
        });
    };

    const handleCloseWelcomeModal = () => {
        setIsWelcomeModalOpen(false);
        try {
            localStorage.setItem(WELCOME_KEY, 'true');
        } catch (error) {
            console.error("Could not save welcome status to localStorage:", error);
        }
    };
    
    const handleCloseSupportModal = () => setIsSupportModalOpen(false);
    const openApiKeyModal = useCallback(() => setIsApiKeyModalOpen(true), []);
    const closeApiKeyModal = useCallback(() => {
        // Only allow closing if we have an active key
        if (activeApiKey) {
            setIsApiKeyModalOpen(false);
        }
    }, [activeApiKey]);
    
    const setActiveApiKey = useCallback((key: string) => {
        if (apiKeys.includes(key)) {
            setActiveApiKeyInternal(key);
            try {
                localStorage.setItem(ACTIVE_API_KEY_KEY, key);
            } catch (e) { console.error(e); }
        }
    }, [apiKeys]);

    const addApiKey = useCallback((key: string) => {
        if (key.trim() && !apiKeys.includes(key)) {
            const newKeys = [...apiKeys, key];
            setApiKeys(newKeys);
            setActiveApiKeyInternal(key); // Immediately activate
            try {
                localStorage.setItem(API_KEYS_LIST_KEY, JSON.stringify(newKeys));
                localStorage.setItem(ACTIVE_API_KEY_KEY, key);
            } catch (e) { console.error(e); }
            setIsApiKeyModalOpen(false); // Force close on success
        }
    }, [apiKeys]);

    const deleteApiKey = useCallback((keyToDelete: string) => {
        const newKeys = apiKeys.filter(k => k !== keyToDelete);
        setApiKeys(newKeys);
        try {
            localStorage.setItem(API_KEYS_LIST_KEY, JSON.stringify(newKeys));
        } catch (e) { console.error(e); }

        if (activeApiKey === keyToDelete) {
            const newActiveKey = newKeys.length > 0 ? newKeys[0] : null;
            setActiveApiKeyInternal(newActiveKey);
            try {
                if (newActiveKey) {
                    localStorage.setItem(ACTIVE_API_KEY_KEY, newActiveKey);
                } else {
                    localStorage.removeItem(ACTIVE_API_KEY_KEY);
                    setIsApiKeyModalOpen(true); // Re-open immediately if no keys left
                }
            } catch(e) { console.error(e); }
        }
    }, [apiKeys, activeApiKey]);

    const openBugReportModal = useCallback((errorContext?: string) => {
        setBugReportErrorContext(errorContext || null);
        setIsBugReportModalOpen(true);
    }, []);

    const closeBugReportModal = useCallback(() => {
        setIsBugReportModalOpen(false);
        setBugReportErrorContext(null);
    }, []);

    const addPreset = useCallback((presetData: Omit<Preset, 'id'>) => {
        const newPreset: Preset = {
            ...presetData,
            id: Date.now().toString(),
        };
        setPresets(prev => {
            const updated = [...prev, newPreset];
            try {
                localStorage.setItem(PRESETS_KEY, JSON.stringify(updated));
            } catch (e) { console.error(e); }
            return updated;
        });
    }, []);

    const deletePreset = useCallback((id: string) => {
        setPresets(prev => {
            const updated = prev.filter(p => p.id !== id);
            try {
                localStorage.setItem(PRESETS_KEY, JSON.stringify(updated));
            } catch (e) { console.error(e); }
            return updated;
        });
    }, []);

    const value: AppContextType = {
        language, handleLanguageChange, theme, toggleTheme,
        isWelcomeModalOpen, handleCloseWelcomeModal,
        isSupportModalOpen, handleCloseSupportModal,
        rateLimitError, setRateLimitError,
        apiKeys, activeApiKey, isApiKeyModalOpen,
        openApiKeyModal, closeApiKeyModal, addApiKey, deleteApiKey, setActiveApiKey,
        isBugReportModalOpen, openBugReportModal, closeBugReportModal, bugReportErrorContext,
        presets, addPreset, deletePreset
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
