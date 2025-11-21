
import React, { useState, useEffect, useRef } from 'react';
import { translations, type Language } from '../translations';
import { Scroll3DIcon } from './icons';
import type { HistoryItem, FormState } from '../types';

interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    history: HistoryItem[];
    onRestore: (item: HistoryItem) => void;
    onDelete: (id: number) => void;
    onClearAll: () => void;
    t: (typeof translations)[keyof typeof translations]['ui'];
}

const ConfirmationDialog: React.FC<{
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    t: (typeof translations)[keyof typeof translations]['ui'];
}> = ({ title, message, onConfirm, onCancel, t }) => (
    <div role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-desc" className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in">
        <div className="fixed inset-0 backdrop-blur-[8px]" style={{ backgroundColor: 'var(--color-overlay-bg)' }} onClick={onCancel}></div>
        <div className="relative bg-[var(--color-bg-light)] border border-[var(--color-border)] rounded-xl p-6 w-full max-w-md shadow-2xl animate-reveal">
            <h3 id="confirm-title" className="text-lg font-bold text-[var(--color-text-primary)]">{title}</h3>
            <p id="confirm-desc" className="text-sm text-[var(--color-text-secondary)] mt-2 mb-6">{message}</p>
            <div className="flex justify-end gap-3">
                <button onClick={onCancel} className="btn btn-secondary">{t.cancelButton}</button>
                <button onClick={onConfirm} className="btn btn-danger">{t.confirmButton}</button>
            </div>
        </div>
    </div>
);

const HistoryDetail: React.FC<{ inputs: FormState, t: (typeof translations)[keyof typeof translations]['ui'] }> = ({ inputs, t }) => (
    <div className="mt-3 pt-3 border-t border-[var(--color-border)]/50 text-xs text-[var(--color-text-tertiary)] space-y-2">
        <h4 className="font-semibold text-sm text-[var(--color-text-secondary)] mb-2">{t.historyInputsTitle}</h4>
        {inputs.prompt && <div><strong className="text-[var(--color-text-secondary)]">{t.labelPrompt}:</strong> <span className="break-words">{inputs.prompt}</span></div>}
        {inputs.coreTheme && <div><strong className="text-[var(--color-text-secondary)]">{t.labelCoreTheme}:</strong> <span className="break-words">{inputs.coreTheme}</span></div>}
        {inputs.story && <div><strong className="text-[var(--color-text-secondary)]">{t.labelStory}:</strong> <span className="break-words">{inputs.story}</span></div>}
        {inputs.keyEmotions && <div><strong className="text-[var(--color-text-secondary)]">{t.labelKeyEmotions}:</strong> <span className="break-words">{inputs.keyEmotions}</span></div>}
        {inputs.imagery && <div><strong className="text-[var(--color-text-secondary)]">{t.labelImagery}:</strong> <span className="break-words">{inputs.imagery}</span></div>}
        {inputs.selectedGenre?.length > 0 && <div><strong className="text-[var(--color-text-secondary)]">{t.labelGenre}:</strong> <span>{inputs.selectedGenre.join(', ')}</span></div>}
        {inputs.selectedMood?.length > 0 && <div><strong className="text-[var(--color-text-secondary)]">{t.labelMood}:</strong> <span>{inputs.selectedMood.join(', ')}</span></div>}
        {inputs.selectedTempo?.length > 0 && <div><strong className="text-[var(--color-text-secondary)]">{t.labelTempo}:</strong> <span>{inputs.selectedTempo.join(', ')}</span></div>}
        {inputs.selectedVocal && <div><strong className="text-[var(--color-text-secondary)]">{t.labelVocal}:</strong> <span>{inputs.selectedVocal}</span></div>}
        {inputs.maleRole && <div><strong className="text-[var(--color-text-secondary)]">{t.labelMaleRole}:</strong> <span className="break-words">{inputs.maleRole}</span></div>}
        {inputs.femaleRole && <div><strong className="text-[var(--color-text-secondary)]">{t.labelFemaleRole}:</strong> <span className="break-words">{inputs.femaleRole}</span></div>}
        {inputs.selectedInstruments?.length > 0 && <div><strong className="text-[var(--color-text-secondary)]">{t.labelInstruments}:</strong> <span>{inputs.selectedInstruments.join(', ')}</span></div>}
        {inputs.songStructure?.length > 0 && <div><strong className="text-[var(--color-text-secondary)]">{t.labelStructure}:</strong> <span>{inputs.songStructure.join(' -> ')}</span></div>}
        {inputs.inspiredBySong && <div><strong className="text-[var(--color-text-secondary)]">Inspired by Song:</strong> <span className="break-words">{inputs.inspiredBySong}</span></div>}
        {inputs.inspiredByArtist && <div><strong className="text-[var(--color-text-secondary)]">Inspired by Artist:</strong> <span className="break-words">{inputs.inspiredByArtist}</span></div>}
        {inputs.excludedWords && <div><strong className="text-[var(--color-text-secondary)]">{t.labelExcludedWords}:</strong> <span className="break-words">{inputs.excludedWords}</span></div>}
        <div><strong className="text-[var(--color-text-secondary)]">Suno Mode:</strong> <span className="capitalize">{inputs.sunoAiMode}</span></div>
        {inputs.sunoAiMode === 'manual' && <div><strong className="text-[var(--color-text-secondary)]">{t.labelWeirdness}:</strong> <span>{inputs.weirdness}</span></div>}
        {inputs.sunoAiMode === 'manual' && <div><strong className="text-[var(--color-text-secondary)]">{t.labelStyleInfluence}:</strong> <span>{inputs.styleInfluence}</span></div>}
        <div><strong className="text-[var(--color-text-secondary)]">{t.labelModel}:</strong> <span>{inputs.selectedModel}</span></div>
        {inputs.watermark && <div><strong className="text-[var(--color-text-secondary)]">{t.labelWatermark}:</strong> <span className="break-words">{inputs.watermark}</span></div>}
    </div>
);


const HistoryItemCard: React.FC<{
    item: HistoryItem;
    onRestore: (item: HistoryItem) => void;
    onDeleteRequest: (id: number) => void;
    t: (typeof translations)[keyof typeof translations]['ui'];
}> = ({ item, onRestore, onDeleteRequest, t }) => {
    const [isCopied, setIsCopied] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(item.songData);
        setIsCopied(true);
    };

    useEffect(() => {
        if (isCopied) {
            const timer = setTimeout(() => setIsCopied(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [isCopied]);

    return (
        <div className="bg-[var(--color-bg)] rounded-lg p-4 border border-[var(--color-border)] flex flex-col items-start gap-3 animate-fade-in">
            <div className="w-full">
                <p className="font-bold text-[var(--color-text-primary)] truncate">{item.title}</p>
                <p className="text-sm text-[var(--color-text-secondary)] truncate">{item.style}</p>
                <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                    {t.historyGeneratedOn} {new Date(item.createdAt).toLocaleString()}
                </p>
            </div>
             <div className="w-full flex flex-wrap items-center gap-2">
                <button
                    onClick={() => onRestore(item)}
                    className="btn btn-secondary !text-xs flex-1"
                >
                    {t.historyRestore}
                </button>
                <button
                    onClick={handleCopy}
                    className={`btn !text-xs flex-1 ${isCopied ? '!bg-green-600 !text-white' : 'btn-secondary'}`}
                >
                    {isCopied ? t.copySuccess : t.historyCopy}
                </button>
                 <button
                    onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                    className="btn btn-secondary !text-xs flex-1"
                >
                    {t.historyDetailsButton}
                </button>
                <button
                    onClick={() => onDeleteRequest(item.id)}
                    className="btn btn-danger-outline !text-xs flex-1"
                >
                    {t.historyDelete}
                </button>
            </div>
            {isDetailsOpen && <HistoryDetail inputs={item.inputs} t={t} />}
        </div>
    );
};

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, history, onRestore, onDelete, onClearAll, t }) => {
    const [confirmation, setConfirmation] = useState<{ type: 'single' | 'all', id?: number } | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                if (confirmation) {
                    setConfirmation(null);
                } else {
                    onClose();
                }
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose, confirmation]);

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

    const handleDeleteRequest = (id: number) => {
        setConfirmation({ type: 'single', id });
    };

    const handleClearAllRequest = () => {
        setConfirmation({ type: 'all' });
    };

    const handleConfirm = () => {
        if (confirmation) {
            if (confirmation.type === 'single' && confirmation.id) {
                onDelete(confirmation.id);
            } else if (confirmation.type === 'all') {
                onClearAll();
            }
        }
        setConfirmation(null);
    };

    if (!isOpen) return null;

    return (
        <>
            <div role="dialog" aria-modal="true" aria-labelledby="history-modal-title" className="fixed inset-0 z-[55] flex items-center justify-center p-4">
                <div className="fixed inset-0 backdrop-blur-[8px] animate-fade-in" style={{ backgroundColor: 'var(--color-overlay-bg)' }} onClick={onClose}></div>
                <div ref={modalRef} className="relative w-full max-w-lg max-h-[90vh] bg-[var(--color-bg-light)] rounded-2xl border border-[var(--color-border)] shadow-2xl flex flex-col animate-reveal" onClick={e => e.stopPropagation()}>
                    <header className="flex items-center justify-between p-4 border-b border-[var(--color-border)] flex-shrink-0">
                        <h2 id="history-modal-title" className="text-xl font-semibold text-[var(--color-text-primary)]">{t.historyModalTitle}</h2>
                        <button onClick={onClose} className="p-2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] rounded-full hover:bg-[var(--color-border)] transition-colors" aria-label={t.closeModal}>
                            <span className="font-bold text-lg leading-none">&times;</span>
                        </button>
                    </header>
                    <main className="flex-grow p-4 space-y-4 overflow-y-auto custom-scrollbar">
                        {history.length > 0 ? (
                            history.map(item => (
                                <HistoryItemCard key={item.id} item={item} onRestore={onRestore} onDeleteRequest={handleDeleteRequest} t={t} />
                            ))
                        ) : (
                            <div className="text-center text-[var(--color-text-tertiary)] p-8">
                                <Scroll3DIcon className="w-20 h-20 mx-auto opacity-50" />
                                <p className="mt-4">{t.historyEmpty}</p>
                            </div>
                        )}
                    </main>
                    {history.length > 0 && (
                        <footer className="flex-shrink-0 p-4 border-t border-[var(--color-border)] bg-[var(--color-panel)] rounded-b-2xl">
                            <button onClick={handleClearAllRequest} className="w-full btn btn-danger-outline">
                                {t.historyClearAll}
                            </button>
                        </footer>
                    )}
                </div>
            </div>
            {confirmation && (
                <ConfirmationDialog
                    title={confirmation.type === 'single' ? t.confirmDeleteTitle : t.confirmClearAllTitle}
                    message={confirmation.type === 'single' ? t.confirmDeleteMessage : t.confirmClearAllMessage}
                    onConfirm={handleConfirm}
                    onCancel={() => setConfirmation(null)}
                    t={t}
                />
            )}
        </>
    );
};

export default HistoryModal;
