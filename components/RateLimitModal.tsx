
import React, { useEffect, useRef } from 'react';
import { translations } from '../translations';
import { AlertTriangleIcon } from './icons';

interface RateLimitModalProps {
    message: string;
    onClose: () => void;
    t: (typeof translations)[keyof typeof translations]['ui'];
}

const RateLimitModal: React.FC<RateLimitModalProps> = ({ message, onClose, t }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    // Focus Trap
    useEffect(() => {
        const modalNode = modalRef.current;
        if (!modalNode) return;

        const focusableElements = modalNode.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        firstElement.focus();

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Tab') {
                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div role="alertdialog" aria-modal="true" aria-labelledby="rate-limit-title" className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fade-in">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            <div ref={modalRef} className="relative bg-[var(--color-bg-light)] border border-red-500/50 rounded-xl p-6 w-full max-w-md shadow-2xl shadow-red-900/20 animate-reveal">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-500/10 rounded-full shrink-0">
                        <AlertTriangleIcon className="w-6 h-6 text-red-500" />
                    </div>
                    <div className="flex-grow">
                        <h3 id="rate-limit-title" className="text-lg font-bold text-[var(--color-text-primary)] mb-2">{t.errorRateLimitTitle}</h3>
                        <div className="text-sm text-[var(--color-text-secondary)] leading-relaxed" dangerouslySetInnerHTML={{ __html: message }} />
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button onClick={onClose} className="btn btn-secondary">
                        {t.closeModal}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RateLimitModal;
