
import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { translations } from '../translations';
import { verifyApiKey } from '../apiKeyVerifier';
import { KeyIcon, SpinnerIcon, CheckCircleIcon, AlertTriangleIcon, CreditCardIcon, Trash2Icon } from './icons';
import { useToast } from '../contexts/ToastContext';

const ApiKeyModal: React.FC = () => {
    const { 
        apiKeys,
        activeApiKey,
        isApiKeyModalOpen, 
        closeApiKeyModal, 
        addApiKey, 
        deleteApiKey, 
        setActiveApiKey,
        language 
    } = useAppContext();
    const t = translations[language].ui;
    const { showToast } = useToast();
    
    const [keyInput, setKeyInput] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationError, setVerificationError] = useState<string | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isApiKeyModalOpen) {
            setKeyInput('');
            setVerificationError(null);
        }
    }, [isApiKeyModalOpen]);

    // Focus Trap & Escape Key
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isApiKeyModalOpen) {
                if (activeApiKey) {
                    closeApiKeyModal();
                }
            }
        };
        window.addEventListener('keydown', handleEsc);
        
        if (!isApiKeyModalOpen || !modalRef.current) return;
        const modalNode = modalRef.current;
        const focusableElements = modalNode.querySelectorAll<HTMLElement>('button, [href], input, [tabindex]:not([tabindex="-1"])');
        if (focusableElements.length === 0) return;
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        firstElement.focus();

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                        e.preventDefault();
                    }
                }
            }
        };
        modalNode.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleEsc);
            modalNode.removeEventListener('keydown', handleKeyDown);
        };
    }, [isApiKeyModalOpen, closeApiKeyModal, activeApiKey]);

    const handleAddKey = async () => {
        if (!keyInput.trim()) {
            setVerificationError(t.apiKeyPromptMissing);
            return;
        }
        
        const trimmedKey = keyInput.trim();
        
        if (apiKeys.includes(trimmedKey)) {
            setVerificationError("This API Key is already saved.");
            return;
        }
        
        setIsVerifying(true);
        setVerificationError(null);
        
        const result = await verifyApiKey(trimmedKey);
        setIsVerifying(false);

        if (result.valid) {
            addApiKey(trimmedKey);
            showToast(t.apiKeyVerificationSuccess, 'success');
            setKeyInput('');
        } else {
            setVerificationError(result.error || t.apiKeyVerificationError);
        }
    };

    if (!isApiKeyModalOpen) {
        return null;
    }

    const renderKeyItem = (key: string) => {
        return (
            <div key={key} className="flex items-center gap-2 p-4 bg-[var(--color-bg)] rounded-lg border border-[var(--color-border)] hover:border-[var(--color-active)] transition-all duration-200 group relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--color-border)] group-hover:bg-[var(--color-active)] transition-colors"></div>
                <div className="p-2 bg-[var(--color-bg-light)] rounded-md border border-[var(--color-border)]">
                    <KeyIcon className="w-4 h-4 text-[var(--color-text-tertiary)]" />
                </div>
                <div className="flex-grow min-w-0">
                    <p className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-widest font-bold mb-0.5">Gemini API Key</p>
                    <span className="text-sm text-[var(--color-text-primary)] font-mono truncate block tracking-wider">{`•••• •••• •••• ${key.slice(-4)}`}</span>
                </div>
                
                {key === activeApiKey ? (
                    <span className="text-[10px] font-bold text-green-400 bg-green-950/50 border border-green-500/30 px-3 py-1.5 rounded-full whitespace-nowrap flex items-center gap-1 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                        <CheckCircleIcon className="w-3 h-3" /> {t.activeApiKeyLabel}
                    </span>
                ) : (
                    <button onClick={() => setActiveApiKey(key)} className="btn btn-secondary !text-xs !py-1.5 !px-4 whitespace-nowrap font-bold uppercase tracking-wide">{t.setActiveButton}</button>
                )}
                
                <button onClick={() => deleteApiKey(key)} className="p-2 text-[var(--color-text-tertiary)] hover:text-[var(--color-error)] transition-colors ml-1" aria-label="Delete Key">
                    <Trash2Icon className="w-4 h-4" />
                </button>
            </div>
        );
    };

    return (
        <div 
            role="dialog"
            aria-modal="true"
            aria-labelledby="api-key-modal-title"
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md animate-fade-in" onClick={activeApiKey ? closeApiKeyModal : undefined}></div>
            <div 
                ref={modalRef}
                className="relative w-full max-w-md bg-[var(--color-bg-light)] rounded-2xl border border-[var(--color-border)] shadow-2xl flex flex-col animate-reveal overflow-hidden border-t-4 border-t-[var(--color-accent-cyan)]"
                onClick={e => e.stopPropagation()}
            >
                {/* Glowing top edge effect */}
                <div className="absolute top-0 left-0 w-full h-24 bg-[var(--color-accent-cyan)] opacity-5 blur-2xl pointer-events-none"></div>

                <header className="flex items-center justify-between p-6 border-b border-[var(--color-border)] bg-[var(--color-panel)] relative z-10">
                    <div>
                        <h2 id="api-key-modal-title" className="text-xl font-black text-[var(--color-text-primary)] flex items-center gap-3 tracking-tight">
                            <div className="p-2 bg-[var(--color-bg)] rounded-lg border border-[var(--color-border)] shadow-sm">
                                <KeyIcon className="w-5 h-5 text-[var(--color-accent-cyan)]" />
                            </div>
                            {t.apiKeyModalTitle}
                        </h2>
                    </div>
                    {activeApiKey && (
                        <button onClick={closeApiKeyModal} className="p-2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] rounded-full hover:bg-[var(--color-border)] transition-colors" aria-label={t.closeModal}>
                            <span className="font-bold text-lg leading-none">&times;</span>
                        </button>
                    )}
                </header>

                <main className="flex-grow p-6 space-y-6 overflow-y-auto custom-scrollbar max-h-[70vh] relative z-10">
                    {!activeApiKey && (
                        <div className="p-5 bg-[var(--color-accent-cyan)]/5 rounded-xl border border-[var(--color-accent-cyan)]/20 relative overflow-hidden group">
                           {/* Holographic effect lines */}
                           <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(34,211,238,0.05)_50%,transparent_75%)] bg-[length:250%_250%] animate-[gradientMove_3s_linear_infinite] pointer-events-none"></div>
                           
                           <div className="flex gap-4 relative z-10">
                               <div className="shrink-0">
                                   <div className="w-10 h-10 rounded-full bg-[var(--color-accent-cyan)]/10 flex items-center justify-center border border-[var(--color-accent-cyan)]/30">
                                       <AlertTriangleIcon className="w-5 h-5 text-[var(--color-accent-cyan)] animate-pulse" />
                                   </div>
                               </div>
                               <div>
                                   <h3 className="font-bold text-[var(--color-accent-cyan)] text-sm uppercase tracking-wide">{t.apiKeyPromptWhy}</h3>
                                   <p className="text-xs text-[var(--color-text-secondary)] mt-1 leading-relaxed opacity-90">{t.apiKeyPromptWhyDesc}</p>
                                   <p className="text-[10px] text-[var(--color-text-tertiary)] mt-2 font-mono border-t border-[var(--color-accent-cyan)]/20 pt-2 inline-block">
                                       🔒 End-to-End Encrypted • Local Storage Only
                                   </p>
                               </div>
                           </div>
                        </div>
                    )}

                    <div>
                        <label htmlFor="api-key-input" className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2 flex justify-between items-center">
                            {t.addNewKeyTitle}
                            <span className="text-[10px] text-[var(--color-text-tertiary)] font-mono">GEMINI API</span>
                        </label>
                        <div className="space-y-4">
                            <div className="relative group">
                                <input
                                    id="api-key-input"
                                    type="password"
                                    value={keyInput}
                                    onChange={(e) => { setKeyInput(e.target.value); setVerificationError(null); }}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddKey()}
                                    placeholder="AIza..."
                                    className={`input-secure w-full ${verificationError ? 'border-red-500 focus:border-red-500 focus:shadow-red-500/20' : ''}`}
                                    disabled={isVerifying}
                                    autoFocus
                                    autoComplete="off"
                                />
                                <div className="absolute inset-0 rounded-lg pointer-events-none border border-transparent group-hover:border-[var(--color-border-highlight)] transition-colors"></div>
                            </div>
                            
                            {verificationError && (
                                <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg flex items-start gap-2 animate-fade-in">
                                    <AlertTriangleIcon className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                                    <p className="text-xs text-red-300 leading-relaxed font-medium">
                                        {verificationError}
                                    </p>
                                </div>
                            )}
                            
                             <button 
                                onClick={handleAddKey} 
                                disabled={isVerifying || !keyInput.trim()} 
                                className="btn btn-primary btn-neon-flow w-full justify-center py-3 text-sm rounded-lg shadow-lg"
                            >
                                {isVerifying ? (
                                    <div className="flex items-center gap-2">
                                        <SpinnerIcon className="w-4 h-4 animate-spin" />
                                        <span>VERIFYING ACCESS...</span>
                                    </div>
                                ) : (
                                    t.apiKeyPromptSaveButton
                                )}
                            </button>
                        </div>
                    </div>

                    {apiKeys.length > 0 && (
                        <div className="pt-6 border-t border-[var(--color-border)]">
                            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-tertiary)] mb-4">{t.savedApiKeysTitle}</label>
                            <div className="space-y-3">
                                {apiKeys.map(renderKeyItem)}
                            </div>
                        </div>
                    )}
                    
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                         <div className="p-2 bg-[var(--color-bg-light)] rounded-md border border-[var(--color-border)]">
                            <CreditCardIcon className="w-4 h-4 text-[var(--color-text-tertiary)]"/>
                         </div>
                         <div>
                            <h4 className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wide">
                                {t.apiKeyBillingWarningTitle}
                            </h4>
                            <p className="text-xs text-[var(--color-text-secondary)] mt-1 mb-2 leading-relaxed opacity-80">{t.apiKeyBillingWarningDesc}</p>
                            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-fuchsia-400 hover:text-fuchsia-300 hover:underline flex items-center gap-1">
                                {t.apiKeyBillingLearnMore} &rarr;
                            </a>
                         </div>
                    </div>
                </main>
                
                <footer className="flex-shrink-0 p-4 border-t border-[var(--color-border)] bg-[var(--color-panel)] flex justify-center">
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-primary-brand)] transition-colors uppercase tracking-wide bg-[var(--color-bg)] px-4 py-2 rounded-full border border-[var(--color-border)] hover:border-[var(--color-primary-brand)]">
                        <span>Get a free API Key from Google</span>
                        <span className="text-lg leading-none">&rarr;</span>
                    </a>
                </footer>
            </div>
        </div>
    );
};

export default ApiKeyModal;
