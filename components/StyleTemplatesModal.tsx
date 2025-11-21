
import React, { useRef, useEffect } from 'react';
import { translations } from '../translations';
import { useAppContext } from '../contexts/AppContext';
import { PaletteIcon, Music4Icon } from './icons';

type StyleTemplate = { name: string; genres: string[]; moods: string[]; tempos: string[] };

interface StyleTemplatesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (template: StyleTemplate) => void;
    t: (typeof translations)[keyof typeof translations]['ui'];
}

const StyleTemplatesModal: React.FC<StyleTemplatesModalProps> = ({ isOpen, onClose, onSelect, t }) => {
    const { language } = useAppContext();
    const templates = translations[language].options.STYLE_TEMPLATES as StyleTemplate[];
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
        <div role="dialog" aria-modal="true" aria-labelledby="style-modal-title" className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="fixed inset-0 backdrop-blur-[8px] animate-fade-in" style={{ backgroundColor: 'var(--color-overlay-bg)' }} onClick={onClose}></div>
            <div ref={modalRef} className="relative w-full max-w-3xl max-h-[80dvh] bg-[var(--color-bg-light)] rounded-2xl border border-[var(--color-border)] shadow-2xl flex flex-col animate-reveal overflow-hidden" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-[var(--color-border)] bg-[var(--color-panel)] flex-shrink-0 z-10">
                    <h2 id="style-modal-title" className="text-lg font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                        <PaletteIcon className="w-5 h-5 text-[var(--color-primary-brand)]" />
                        {t.styleTemplatesModalTitle}
                    </h2>
                    <button onClick={onClose} className="p-2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] rounded-full hover:bg-[var(--color-border)] transition-colors" aria-label={t.closeModal}>
                        <span className="font-bold text-lg leading-none">&times;</span>
                    </button>
                </header>
                
                <main className="flex-grow p-4 overflow-y-auto custom-scrollbar bg-[var(--color-bg)]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {templates.map((template, index) => (
                            <button 
                                key={index} 
                                onClick={() => onSelect(template)} 
                                className="group text-left w-full p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-light)] hover:border-[var(--color-primary-brand)] hover:shadow-[0_0_15px_rgba(217,70,239,0.15)] transition-all duration-200 flex flex-col h-full"
                            >
                                <h3 className="font-bold text-sm text-[var(--color-text-primary)] mb-3 group-hover:text-[var(--color-primary-brand)] transition-colors break-words border-b border-[var(--color-border)] pb-2 w-full">
                                    {template.name}
                                </h3>
                                <div className="space-y-2 text-xs flex-grow">
                                    <div className="flex flex-wrap gap-1.5 mb-2">
                                        {template.genres.map(g => <span key={g} className="px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 whitespace-normal text-center font-medium">{g}</span>)}
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 mb-2">
                                        {template.moods.map(m => <span key={m} className="px-1.5 py-0.5 rounded-md bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20 whitespace-normal text-center font-medium">{m}</span>)}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)] pt-1">
                                        <Music4Icon className="w-3 h-3 flex-shrink-0" />
                                        <span className="truncate font-mono opacity-80">{template.tempos.join(', ')}</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default StyleTemplatesModal;
