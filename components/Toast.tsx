import React from 'react';
import { ToastMessage, ToastType } from '../contexts/ToastContext';
import { useAppContext } from '../contexts/AppContext';
import { translations, Language } from '../translations';
import { useToast } from '../contexts/ToastContext';

interface ToastProps {
  toast: ToastMessage;
  onRemove: (id: number) => void;
  t: (typeof translations)[Language];
}

const Toast: React.FC<ToastProps> = ({ toast, onRemove, t }) => {
    // Fix: Access translation strings from the 'ui' property of the translation object.
    const PREFIXES: Record<ToastType, { text: string; color: string }> = {
        success: { text: t.ui.toastSuccessPrefix, color: 'text-green-400' },
        error: { text: t.ui.toastErrorPrefix, color: 'text-red-400' },
        info: { text: t.ui.toastInfoPrefix, color: 'text-blue-400' },
    };

    return (
        <div
            role="alert"
            className="w-full max-w-sm bg-[var(--color-bg-light)] border border-[var(--color-border)] rounded-lg shadow-2xl flex items-start p-4 gap-3 animate-reveal"
            style={{ animation: 'reveal 0.3s ease-out, fadeOut 0.5s ease-in 4.5s forwards' }}
        >
            <div className="flex-shrink-0">
                <p className={`font-bold text-sm ${PREFIXES[toast.type].color}`}>{PREFIXES[toast.type].text}</p>
            </div>
            <div className="flex-grow text-sm text-[var(--color-text-primary)]" dangerouslySetInnerHTML={{ __html: toast.message }} />
            <button
                onClick={() => onRemove(toast.id)}
                className="p-1 -mt-1 -mr-1 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] rounded-full transition-colors"
                aria-label="Close"
            >
                <span className="font-bold text-lg leading-none">&times;</span>
            </button>
            <style>{`
                @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; transform: scale(0.9); }
                }
            `}</style>
        </div>
    );
};

export const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useToast();
    const { language } = useAppContext();
    const t = translations[language];

    return (
        <div className="fixed top-4 right-4 z-[200] space-y-3">
            {toasts.map(toast => (
                <Toast key={toast.id} toast={toast} onRemove={removeToast} t={t} />
            ))}
        </div>
    );
};
