
import React, { useRef, useEffect } from 'react';
import { translations } from '../translations';
import { useAppContext } from '../contexts/AppContext';
import { SlidersHorizontalIcon } from './icons';

type ExcludedWordsTemplate = { name: string; words: string };

interface ExcludedWordsTemplatesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (template: ExcludedWordsTemplate) => void;
    t: (typeof translations)[keyof typeof translations]['ui'];
}

const ExcludedWordsTemplatesModal: React.FC<ExcludedWordsTemplatesModalProps> = ({ isOpen, onClose, onSelect, t }) => {
    const { language } = useAppContext();
    const templates = translations[language].options.EXCLUDED_WORDS_TEMPLATES as ExcludedWordsTemplate[];
    const modalRef = useRef<HTMLDivElement>(null);

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
        const focusableElements = modalNode.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusableElements.length === 0) return;
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const closeButton = modalNode.querySelector<HTMLButtonElement>(`button[aria-label="${t.closeModal}"]`);
        (closeButton || firstElement).focus();

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
        modalNode.addEventListener('keydown', handleKeyDown);
        return () => modalNode.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, t.closeModal]);

    if (!isOpen) return null;

    return (
        <div role="dialog" aria-modal="true" aria-labelledby="excluded-modal-title" className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="fixed inset-0 backdrop-blur-[8px] animate-fade-in" style={{ backgroundColor: 'var(--color-overlay-bg)' }} onClick={onClose}></div>
            <div ref={modalRef} className="relative w-full max-w-md max-h-[80dvh] bg-[var(--color-bg-light)] rounded-2xl border border-[var(--color-border)] shadow-2xl flex flex-col animate-reveal overflow-hidden" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-[var(--color-border)] bg-[var(--color-panel)] flex-shrink-0 z-10">
                    <h2 id="excluded-modal-title" className="text-lg font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                        <SlidersHorizontalIcon className="w-5 h-5 text-[var(--color-primary-brand)]" />
                        {t.excludedWordsTemplatesModalTitle}
                    </h2>
                    <button onClick={onClose} className="p-2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] rounded-full hover:bg-[var(--color-border)] transition-colors" aria-label={t.closeModal}>
                        <span className="font-bold text-lg leading-none">&times;</span>
                    </button>
                </header>
                <main className="flex-grow p-4 overflow-y-auto custom-scrollbar bg-[var(--color-bg)]">
                    <div className="grid grid-cols-1 gap-3">
                        {templates.map((template, index) => (
                            <button 
                                key={index} 
                                onClick={() => onSelect(template)} 
                                className="group w-full text-left p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-light)] hover:border-[var(--color-primary-brand)] hover:shadow-[0_0_10px_rgba(217,70,239,0.1)] transition-all duration-200 flex flex-col"
                            >
                                <h3 className="font-bold text-sm text-[var(--color-text-primary)] group-hover:text-[var(--color-primary-brand)] mb-2 transition-colors w-full border-b border-[var(--color-border)] pb-2">
                                    {template.name}
                                </h3>
                                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed break-words font-mono bg-[var(--color-bg)] p-2 rounded border border-[var(--color-border)] w-full opacity-80">
                                    {template.words}
                                </p>
                            </button>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ExcludedWordsTemplatesModal;
