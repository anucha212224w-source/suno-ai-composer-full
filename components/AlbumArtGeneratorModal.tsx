
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { translations, type Language } from '../translations';
import { SpinnerIcon } from './icons';
import { GenerateAlbumArtParams } from '../geminiService';
import type { FormState } from '../types';

export type AlbumArtSettings = GenerateAlbumArtParams;

interface AlbumArtGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (settings: AlbumArtSettings) => void;
    songData: string | null;
    inputs: FormState | null;
    // FIX: Corrected the type of 't' to match the props being passed (the 'ui' object).
    t: (typeof translations)[keyof typeof translations]['ui'];
    language: Language;
}

// Create dynamic regexes from translations to make parsing robust.
// Robust regex to handle optional Markdown asterisks around labels (e.g., **Style:** or **Style**: )
const createDynamicRegex = (getLabel: (t: (typeof translations)[keyof typeof translations]) => string): RegExp => {
    const labels = Object.values(translations).map(t => getLabel(t).slice(0, -1).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    return new RegExp(`^\\s*[\\*]*(${labels})[\\*]*\\s*:\\s*(.*)`, 'm');
};
const TITLE_REGEX = createDynamicRegex(t => t.prompts.label_song_title);
const STYLE_REGEX = createDynamicRegex(t => t.prompts.label_style);

// Helper to clean markdown bold/italics from extracted text
const cleanMarkdown = (text: string) => text.replace(/\*/g, '').trim();

export const AlbumArtGeneratorModal: React.FC<AlbumArtGeneratorModalProps> = ({ isOpen, onClose, onSubmit, songData, inputs, t, language }) => {
    const [prompt, setPrompt] = useState('');
    const [noText, setNoText] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    const generateInitialPrompt = useCallback(() => {
        if (!inputs || !songData) return '';
        
        const titleMatch = songData.match(TITLE_REGEX);
        const styleMatch = songData.match(STYLE_REGEX);
        const title = titleMatch ? cleanMarkdown(titleMatch[2]) : 'Untitled';
        const style = styleMatch ? cleanMarkdown(styleMatch[2]) : 'Unknown Style';

        const moodText = inputs.selectedMood.length > 0 ? `The mood is ${inputs.selectedMood.join(', ')}.` : '';
        const imageryText = inputs.imagery.trim() ? `Incorporate themes of ${inputs.imagery}.` : '';
        const instrumentsText = inputs.selectedInstruments.length > 0 ? `Featuring instruments like ${inputs.selectedInstruments.join(', ')}.` : '';

        let basePrompt = `Epic, atmospheric, cinematic, high detail, photographic album cover art for a song titled "${title}". The style of music is ${style}. ${moodText} ${instrumentsText} The core concept is about: ${inputs.coreTheme || inputs.prompt}. ${imageryText}`.trim().replace(/\s+/g, ' ');

        if (language === 'th') {
            basePrompt += ` The human characters in the image should have a distinct Thai appearance and nationality.`;
        }

        return basePrompt;
    }, [inputs, songData, language]);

    useEffect(() => {
        if (isOpen) {
            setPrompt(generateInitialPrompt());
            setNoText(true);
        }
    }, [isOpen, generateInitialPrompt]);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    // Focus Trap
    useEffect(() => {
        if (!isOpen) return;
        
        const modalNode = modalRef.current;
        if (!modalNode) return;

        const focusableElements = modalNode.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const closeButton = modalNode.querySelector<HTMLButtonElement>(`button[aria-label="${t.closeModal}"]`);
        (closeButton || firstElement).focus();
        
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!modalRef.current) return;
            if (e.key === 'Tab') {
                if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, t.closeModal]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsGenerating(true);
        await onSubmit({ prompt, noText });
        setIsGenerating(false);
    };

    if (!isOpen) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="art-generator-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
            <div className="fixed inset-0 backdrop-blur-[8px] animate-fade-in" style={{ backgroundColor: 'var(--color-overlay-bg)' }} onClick={onClose}></div>
            <div ref={modalRef} className="relative w-full max-w-2xl max-h-[90vh] bg-[var(--color-bg-light)] rounded-2xl border border-[var(--color-border)] shadow-2xl flex flex-col animate-reveal">
                <header className="flex items-center justify-between p-4 border-b border-[var(--color-border)] flex-shrink-0">
                    <h2 id="art-generator-title" className="text-xl font-semibold text-[var(--color-text-primary)]">
                        {t.albumArtGeneratorTitle}
                    </h2>
                    <button onClick={onClose} className="p-2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] rounded-full hover:bg-[color:var(--color-border)] transition-colors" aria-label={t.closeModal}>
                        <span className="font-bold text-lg leading-none">&times;</span>
                    </button>
                </header>
                <form onSubmit={handleSubmit} className="flex-grow contents">
                    <main className="flex-grow p-4 sm:p-6 space-y-5 overflow-y-auto custom-scrollbar">
                        <div>
                            <label htmlFor="art-prompt" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">{t.promptLabel}</label>
                            <textarea id="art-prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)}
                                className="input-base custom-scrollbar w-full text-sm" rows={5} required />
                             <p className="text-xs text-[var(--color-text-tertiary)] mt-2">{t.promptDescription}</p>
                             <p className="text-xs text-[var(--color-accent-cyan)] mt-2">{t.promptTranslationNotice}</p>
                        </div>
                        
                        <div className="space-y-4">
                             <div>
                                <label className="flex items-center space-x-3 cursor-pointer p-1">
                                    <input
                                        type="checkbox"
                                        checked={noText}
                                        onChange={(e) => setNoText(e.target.checked)}
                                        className="w-4 h-4 accent-[var(--color-primary-brand)] bg-[var(--color-bg)] border-[var(--color-border)] rounded focus:ring-[var(--color-primary-brand)] focus:ring-2"
                                    />
                                    <span className="text-sm font-medium text-[var(--color-text-secondary)]">{t.noTextLabel}</span>
                                </label>
                                <p className="text-xs mt-1 ml-8 text-[var(--color-text-tertiary)]">{t.noTextDescription}</p>
                            </div>
                        </div>
                    </main>
                    <footer className="flex-shrink-0 p-4 border-t border-[var(--color-border)] bg-[var(--color-bg-light)]/50 rounded-b-2xl">
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={onClose} className="btn btn-secondary">{t.cancelButton}</button>
                            <button type="submit" className="btn btn-primary" disabled={isGenerating || !prompt.trim()}>
                                {isGenerating && <SpinnerIcon className="w-5 h-5 mr-2 animate-spin" />}
                                {isGenerating ? t.generatingArtButton : t.generateButton}
                            </button>
                        </div>
                    </footer>
                </form>
            </div>
        </div>
    );
};
