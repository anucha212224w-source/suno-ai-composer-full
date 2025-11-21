import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { translations } from '../translations';
import { SpinnerIcon, WandSparklesIcon } from './icons';

interface RevisionModalProps {
    isOpen: boolean;
    onClose: () => void;
    originalSongData: string | null;
    onSubmit: (revisionRequest: string) => Promise<void>;
    isRevising: boolean;
}

const RevisionModal: React.FC<RevisionModalProps> = ({
    isOpen,
    onClose,
    originalSongData,
    onSubmit,
    isRevising,
}) => {
    const { language } = useAppContext();
    const t = translations[language].ui;
    const [revisionRequest, setRevisionRequest] = useState('');
    const modalRef = useRef<HTMLDivElement>(null);

    const originalLyrics = useMemo(() => {
        if (!originalSongData) return '';
        const lyricsHeaderRegex = new RegExp(`^${translations[language].prompts.label_lyrics.slice(0, -1)}:`, 'm');
        const lyricsMatch = originalSongData.match(lyricsHeaderRegex);
        if (lyricsMatch && lyricsMatch.index !== undefined) {
            return originalSongData.substring(lyricsMatch.index + lyricsMatch[0].length).trim();
        }
        return originalSongData;
    }, [originalSongData, language]);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !isRevising) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose, isRevising]);

    // Focus Trap
    useEffect(() => {
        if (!isOpen) return;
        const modalNode = modalRef.current;
        if (!modalNode) return;

        const focusableElements = modalNode.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusableElements.length === 0) return;
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        firstElement.focus();

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (revisionRequest.trim()) {
            await onSubmit(revisionRequest);
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="revision-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
            <div className="fixed inset-0 backdrop-blur-[8px] animate-fade-in" style={{ backgroundColor: 'var(--color-overlay-bg)' }} onClick={onClose}></div>
            <div
                ref={modalRef}
                className="relative w-full max-w-2xl max-h-[90vh] bg-[var(--color-bg-light)] rounded-2xl border border-[var(--color-border)] shadow-2xl flex flex-col animate-reveal"
            >
                <header className="flex items-center justify-between p-4 border-b border-[var(--color-border)] flex-shrink-0">
                    <h2 id="revision-modal-title" className="text-xl font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                        <WandSparklesIcon className="w-5 h-5" />
                        {t.revisionModalTitle}
                    </h2>
                    <button onClick={onClose} disabled={isRevising} className="p-2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] rounded-full hover:bg-[var(--color-border)] transition-colors" aria-label={t.closeModal}>
                        <span className="font-bold text-lg leading-none">&times;</span>
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="flex-grow contents">
                    <main className="flex-grow p-4 sm:p-6 space-y-4 overflow-y-auto custom-scrollbar">
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">{t.revisionModalOriginalSong}</label>
                            <div className="w-full h-48 p-3 bg-[var(--color-bg)] rounded-md border border-[var(--color-border)] overflow-y-auto custom-scrollbar">
                                <pre className="text-sm text-[var(--color-text-secondary)] whitespace-pre-wrap font-sans">
                                    {originalLyrics}
                                </pre>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="revision-request" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">{t.revisionModalPromptLabel}</label>
                            <textarea
                                id="revision-request"
                                value={revisionRequest}
                                onChange={(e) => setRevisionRequest(e.target.value)}
                                placeholder={t.revisionModalPromptPlaceholder}
                                className="input-base custom-scrollbar w-full"
                                rows={4}
                                required
                                disabled={isRevising}
                            />
                        </div>
                    </main>

                    <footer className="flex-shrink-0 p-4 border-t border-[var(--color-border)] bg-[var(--color-panel)] rounded-b-2xl">
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={onClose} disabled={isRevising} className="btn btn-secondary">{t.cancelButton}</button>
                            <button type="submit" className="btn btn-primary" disabled={isRevising || !revisionRequest.trim()}>
                                {isRevising && <SpinnerIcon className="w-5 h-5 mr-2 animate-spin" />}
                                {isRevising ? t.revisionModalSubmittingButton : t.revisionModalSubmitButton}
                            </button>
                        </div>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default RevisionModal;