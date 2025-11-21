
import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { translations } from '../translations';
import { BugIcon, MailIcon } from './icons';

const BugReportModal: React.FC = () => {
    const { isBugReportModalOpen, closeBugReportModal, bugReportErrorContext, language } = useAppContext();
    const t = translations[language].ui;
    const [description, setDescription] = useState('');
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closeBugReportModal();
            }
        };
        if (isBugReportModalOpen) {
            window.addEventListener('keydown', handleEsc);
        }
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isBugReportModalOpen, closeBugReportModal]);

     // Focus Trap
    useEffect(() => {
        if (!isBugReportModalOpen) return;
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
    }, [isBugReportModalOpen, t.closeModal]);

    const handleSendEmail = () => {
        const subject = encodeURIComponent(`Suno AI Composer Bug Report`);
        
        const technicalDetails = `
        
----------------------------------------
TECHNICAL DETAILS (Auto-attached)
----------------------------------------
User Agent: ${navigator.userAgent}
Screen Size: ${window.innerWidth}x${window.innerHeight}
Language: ${language}
Timestamp: ${new Date().toISOString()}
Error Context: ${bugReportErrorContext || 'None'}
----------------------------------------`;

        const body = encodeURIComponent(`${description}\n${technicalDetails}`);
        window.location.href = `mailto:anucha212224w@gmail.com?subject=${subject}&body=${body}`;
        
        closeBugReportModal();
    };

    if (!isBugReportModalOpen) return null;

    return (
        <div 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="bug-report-title" 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
            <div className="fixed inset-0 backdrop-blur-[8px] animate-fade-in" style={{ backgroundColor: 'var(--color-overlay-bg)' }} onClick={closeBugReportModal}></div>
            <div ref={modalRef} className="relative w-full max-w-lg bg-[var(--color-bg-light)] rounded-2xl border border-[var(--color-border)] shadow-2xl flex flex-col animate-reveal">
                <header className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
                    <h2 id="bug-report-title" className="text-xl font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                        <BugIcon className="w-5 h-5 text-[var(--color-error)]" />
                        {t.bugReportTitle}
                    </h2>
                    <button onClick={closeBugReportModal} className="p-2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] rounded-full hover:bg-[var(--color-border)] transition-colors" aria-label={t.closeModal}>
                        <span className="font-bold text-lg leading-none">&times;</span>
                    </button>
                </header>
                
                <main className="p-6 space-y-4">
                    <p className="text-sm text-[var(--color-text-secondary)]">
                        {t.bugReportDescription}
                    </p>
                    
                    {bugReportErrorContext && (
                        <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-xs font-mono text-red-300 break-all">
                            <strong>Error:</strong> {bugReportErrorContext}
                        </div>
                    )}

                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={t.bugReportPlaceholder}
                        className="input-base w-full h-32 resize-none"
                        autoFocus
                    />
                </main>

                <footer className="p-4 border-t border-[var(--color-border)] flex justify-end gap-2 bg-[var(--color-panel)] rounded-b-2xl">
                    <button onClick={closeBugReportModal} className="btn btn-secondary">
                        {t.cancelButton}
                    </button>
                    <button onClick={handleSendEmail} className="btn btn-primary flex items-center gap-2">
                        <MailIcon className="w-4 h-4" />
                        {t.bugReportSendButton}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default BugReportModal;
