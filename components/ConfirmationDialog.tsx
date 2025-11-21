
import React from 'react';
import { translations } from '../translations';

interface ConfirmationDialogProps {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    t: (typeof translations)[keyof typeof translations]['ui'];
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ title, message, onConfirm, onCancel, t }) => (
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

export default ConfirmationDialog;
