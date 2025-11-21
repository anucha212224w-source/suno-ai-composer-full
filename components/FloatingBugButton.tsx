
import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { BugIcon } from './icons';
import { translations } from '../translations';

const FloatingBugButton: React.FC = () => {
    const { openBugReportModal, language } = useAppContext();
    const t = translations[language].ui;

    return (
        <button
            onClick={() => openBugReportModal()}
            className="fixed bottom-4 left-4 z-40 p-3 bg-[var(--color-panel)] border border-[var(--color-border)] rounded-full shadow-lg text-[var(--color-text-tertiary)] hover:text-[var(--color-error)] hover:border-[var(--color-error)] hover:scale-110 transition-all duration-200 group"
            aria-label={t.bugReportTooltip}
            title={t.bugReportTooltip}
        >
            <BugIcon className="w-6 h-6" />
            <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-[var(--color-bg-light)] text-[var(--color-text-primary)] text-xs rounded border border-[var(--color-border)] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {t.bugReportTooltip}
            </span>
        </button>
    );
};

export default FloatingBugButton;
