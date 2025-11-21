
import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { translations } from '../translations';
import { Trash2Icon, BookmarkIcon } from './icons';
import { useToast } from '../contexts/ToastContext';
import type { Preset, FormState } from '../types';

interface PresetsModalProps {
    isOpen: boolean;
    onClose: () => void;
    formState: FormState;
    onApplyPreset: (preset: Preset) => void;
}

const PRESET_SETTINGS_KEYS: (keyof FormState)[] = [
    'selectedGenre', 'selectedMood', 'selectedTempo', 'selectedVocal', 
    'selectedInstruments', 'inspiredBySong', 'inspiredByArtist', 'maleRole', 
    'femaleRole', 'songStructure', 'sunoAiMode', 'weirdness', 
    'styleInfluence', 'selectedModel', 'excludedWords', 'watermark'
];

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

const PresetsModal: React.FC<PresetsModalProps> = ({ isOpen, onClose, formState, onApplyPreset }) => {
    const { 
        presets,
        addPreset,
        deletePreset,
        language 
    } = useAppContext();
    const t = translations[language].ui;
    const { showToast } = useToast();
    
    const [presetName, setPresetName] = useState('');
    const [confirmDelete, setConfirmDelete] = useState<Preset | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                if (confirmDelete) {
                    setConfirmDelete(null);
                } else {
                    onClose();
                }
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose, confirmDelete]);

    const handleSavePreset = () => {
        if (!presetName.trim()) {
            showToast(t.presetNameMissing, 'error');
            return;
        }

        const settingsToSave: Partial<FormState> = {};
        for (const key of PRESET_SETTINGS_KEYS) {
            (settingsToSave as any)[key] = formState[key];
        }

        addPreset({
            name: presetName.trim(),
            settings: settingsToSave
        });

        showToast(t.presetSavedSuccess, 'success');
        setPresetName('');
    };

    const handleDeletePreset = (preset: Preset) => {
        setConfirmDelete(preset);
    };

    const handleConfirmDelete = () => {
        if (confirmDelete) {
            deletePreset(confirmDelete.id);
            showToast(t.presetDeletedSuccess, 'info');
            setConfirmDelete(null);
        }
    };

    if (!isOpen) {
        return null;
    }

    const renderPresetItem = (preset: Preset) => (
         <div key={preset.id} className="flex items-center gap-2 p-2 bg-[var(--color-bg)] rounded-lg border border-[var(--color-border)]">
            <span className="flex-grow text-sm text-[var(--color-text-primary)] font-medium truncate">{preset.name}</span>
            <button onClick={() => onApplyPreset(preset)} className="btn btn-secondary !text-xs !py-1 !px-3">{t.loadPresetButton}</button>
            <button onClick={() => handleDeletePreset(preset)} className="btn btn-danger-outline !p-2">
                <Trash2Icon className="w-4 h-4" />
            </button>
        </div>
    );

    return (
        <>
        <div 
            role="dialog"
            aria-modal="true"
            aria-labelledby="presets-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
            <div className="fixed inset-0 backdrop-blur-[8px] animate-fade-in" style={{ backgroundColor: 'var(--color-overlay-bg)' }} onClick={onClose}></div>
            <div 
                ref={modalRef}
                className="relative w-full max-w-lg max-h-[90vh] bg-[var(--color-bg-light)] rounded-2xl border border-[var(--color-border)] shadow-2xl flex flex-col animate-reveal"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-[var(--color-border)] flex-shrink-0">
                    <h2 id="presets-modal-title" className="text-xl font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                        <BookmarkIcon className="w-5 h-5" />
                        {t.presetsModalTitle}
                    </h2>
                    <button onClick={onClose} className="p-2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] rounded-full hover:bg-[var(--color-border)] transition-colors" aria-label={t.closeModal}>
                        <span className="font-bold text-lg leading-none">&times;</span>
                    </button>
                </header>

                <main className="flex-grow p-4 sm:p-6 space-y-6 overflow-y-auto custom-scrollbar">
                     <div>
                        <label htmlFor="preset-name-input" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">{t.savePresetTitle}</label>
                        <div className="flex items-center gap-2">
                            <input
                                id="preset-name-input"
                                type="text"
                                value={presetName}
                                onChange={(e) => setPresetName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSavePreset()}
                                placeholder={t.presetNamePlaceholder}
                                className="input-base flex-grow"
                            />
                            <button onClick={handleSavePreset} disabled={!presetName.trim()} className="btn btn-primary flex-shrink-0">
                                {t.savePresetButton}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">{t.savedPresetsTitle}</label>
                        {presets.length > 0 ? (
                            <div className="space-y-2">
                                {presets.map(renderPresetItem)}
                            </div>
                        ) : (
                             <p className="text-sm text-center py-4 text-[var(--color-text-tertiary)] bg-[var(--color-bg)] rounded-lg border border-[var(--color-border)]">{t.noPresetsSaved}</p>
                        )}
                    </div>
                </main>
            </div>
        </div>
        {confirmDelete && (
            <ConfirmationDialog
                title={t.confirmDeletePresetTitle}
                message={t.confirmDeletePresetMessage.replace('{presetName}', confirmDelete.name)}
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmDelete(null)}
                t={t}
            />
        )}
        </>
    );
};

export default PresetsModal;
