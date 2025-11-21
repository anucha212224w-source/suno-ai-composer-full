import React, { useRef, useEffect } from 'react';
import { translations } from '../translations';
import { useAppContext } from '../contexts/AppContext';

interface SupportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
    const { language } = useAppContext();
    // Fix: Access ui property for translation
    const t = translations[language].ui;
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
    
    if (!isOpen) return null;

    return (
        <div 
            role="dialog"
            aria-modal="true"
            aria-labelledby="support-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
            <div className="fixed inset-0 backdrop-blur-[8px] animate-fade-in" style={{ backgroundColor: 'var(--color-overlay-bg)' }} onClick={onClose}></div>

            <div 
                ref={modalRef}
                className="relative w-full max-w-lg bg-[var(--color-bg-light)] rounded-2xl border border-[var(--color-border)] shadow-2xl flex flex-col animate-reveal"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-[var(--color-border)] flex-shrink-0">
                    <h2 id="support-modal-title" className="text-xl font-semibold text-[var(--color-text-primary)]">{t.supportModalTitle}</h2>
                    <button onClick={onClose} className="p-2 text-[var(--color-text-tertiary)] rounded-full hover:bg-[var(--color-border)] hover:text-[var(--color-text-primary)] transition-colors" aria-label={t.closeModal}>
                        <span className="font-bold text-lg leading-none">&times;</span>
                    </button>
                </header>
                
                <main className="flex-grow p-6 space-y-4 text-center">
                   <p className="text-[var(--color-text-secondary)]" dangerouslySetInnerHTML={{ __html: t.supportModalContent }}></p>
                </main>

                <footer className="flex-shrink-0 p-4 border-t border-[var(--color-border)] bg-[var(--color-panel)] rounded-b-2xl flex flex-col sm:flex-row gap-3">
                    <button onClick={onClose} className="btn btn-secondary w-full sm:w-auto flex-1">
                        {t.supportModalCloseButton}
                    </button>
                    <a 
                        href="https://support-suno-composer.my.canva.site/" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="btn btn-primary w-full sm:w-auto flex-1"
                    >
                        {t.supportModalButtonText}
                    </a>
                </footer>
            </div>
        </div>
    );
};

export default SupportModal;