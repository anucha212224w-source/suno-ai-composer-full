
import React from 'react';

// Pro Studio Icon System - High Fidelity Duotone Style
// Features: Stroke 1.5-2px, Fill Opacity 0.1-0.2, Rounded joins

const IconBase: React.FC<React.SVGProps<SVGSVGElement>> = ({ children, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        {children}
    </svg>
);

export const HeadphonesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <path d="M3 14v-3a9 9 0 0 1 18 0v3" />
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z" fill="currentColor" fillOpacity="0.2" />
        <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" fill="currentColor" fillOpacity="0.2" />
    </IconBase>
);

export const PlayIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props} fill="currentColor" stroke="none">
        <path d="M5 3l14 9-14 9V3z" />
    </IconBase>
);

export const MusicIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" fill="currentColor" fillOpacity="0.2" />
        <circle cx="18" cy="16" r="3" fill="currentColor" fillOpacity="0.2" />
    </IconBase>
);

export const WandSparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <path d="m19 14-3 3" />
        <path d="m22 17-3 3" />
        <path d="m16 20 3 3" />
        <path d="m16 2 6 6" />
        <path d="m2 16 6 6" />
        <path d="m2 2 20 20" />
        <path d="m9 7 6 6" fill="currentColor" fillOpacity="0.2" />
        <path d="m12 4 3 3" />
    </IconBase>
);

export const SpinnerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </IconBase>
);

export const CopyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" fill="currentColor" fillOpacity="0.2" />
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </IconBase>
);

export const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <polyline points="20 6 9 17 4 12" />
    </IconBase>
);

export const ShareIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
        <polyline points="16 6 12 2 8 6" />
        <line x1="12" y1="2" x2="12" y2="15" />
    </IconBase>
);

export const HeartIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" fill="currentColor" fillOpacity="0.2" />
    </IconBase>
);

export const DiceIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" fill="currentColor" fillOpacity="0.1" />
        <path d="M16 8h.01" strokeWidth="3" />
        <path d="M12 12h.01" strokeWidth="3" />
        <path d="M8 16h.01" strokeWidth="3" />
    </IconBase>
);

export const SlidersHorizontalIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <line x1="21" y1="4" x2="14" y2="4" />
        <line x1="10" y1="4" x2="3" y2="4" />
        <line x1="21" y1="12" x2="12" y2="12" />
        <line x1="8" y1="12" x2="3" y2="12" />
        <line x1="21" y1="20" x2="16" y2="20" />
        <line x1="12" y1="20" x2="3" y2="20" />
        <line x1="14" y1="2" x2="14" y2="6" strokeWidth="3" strokeLinecap="square" />
        <line x1="8" y1="10" x2="8" y2="14" strokeWidth="3" strokeLinecap="square" />
        <line x1="16" y1="18" x2="16" y2="22" strokeWidth="3" strokeLinecap="square" />
    </IconBase>
);

export const FeatherIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" fill="currentColor" fillOpacity="0.1" />
        <line x1="16" y1="8" x2="2" y2="22" />
        <line x1="17.5" y1="15" x2="9" y2="15" />
    </IconBase>
);

export const GlobeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.05" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z" />
    </IconBase>
);

export const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <path d="m6 9 6 6 6-6" />
    </IconBase>
);

export const CogIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.2" />
    </IconBase>
);

export const TargetIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.05" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
    </IconBase>
);

export const BookOpenIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" fill="currentColor" fillOpacity="0.1" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" fill="currentColor" fillOpacity="0.1" />
    </IconBase>
);

export const HeartPulseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />
    </IconBase>
);

export const ImageIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" fill="currentColor" fillOpacity="0.1" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </IconBase>
);

export const AlertTriangleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" fill="currentColor" fillOpacity="0.1" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
    </IconBase>
);

export const AlertCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
    </IconBase>
);

export const CpuChipIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <rect x="4" y="4" width="16" height="16" rx="2" fill="currentColor" fillOpacity="0.1" />
        <rect x="9" y="9" width="6" height="6" fill="currentColor" fillOpacity="0.2" />
        <path d="M9 1v3" />
        <path d="M15 1v3" />
        <path d="M9 20v3" />
        <path d="M15 20v3" />
        <path d="M20 9h3" />
        <path d="M20 14h3" />
        <path d="M1 9h3" />
        <path d="M1 14h3" />
    </IconBase>
);

export const ZapIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2A.5.5 0 0 1 14 2.5V8h5a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.88-.4V14H4z" fill="currentColor" fillOpacity="0.2" />
    </IconBase>
);

export const MusicNotesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <path d="M9 18V5l12-2v13" />
        <path d="m9 9 12-2" />
        <circle cx="6" cy="18" r="3" fill="currentColor" fillOpacity="0.2" />
        <circle cx="18" cy="16" r="3" fill="currentColor" fillOpacity="0.2" />
    </IconBase>
);

export const FolderKanbanIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" fill="currentColor" fillOpacity="0.1" />
    </IconBase>
);

export const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" fill="currentColor" fillOpacity="0.2" />
    </IconBase>
);

export const RefreshCwIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
        <path d="M3 21v-5h5" />
    </IconBase>
);

export const SendHorizonalIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <path d="m3 3 3 9-3 9 19-9Z" fill="currentColor" fillOpacity="0.1" />
        <path d="M6 12h16" />
    </IconBase>
);

export const TypeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <polyline points="4 7 4 4 20 4 20 7" />
        <line x1="9" y1="20" x2="15" y2="20" />
        <line x1="12" y1="4" x2="12" y2="20" />
    </IconBase>
);

export const PaletteIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.667 0-.424-.103-.822-.283-1.177-.19-.369-.423-.711-.713-1.012-.29-.302-.63-.54-.998-.728-.37-.188-.78-.29-1.21-.29-.926 0-1.667-.746-1.667-1.667s.74-1.667 1.666-1.667c.37 0 .712.103 1.012.283.369.19.711.423 1.012.713.302.29.54.63.728.998.188.37.29.78.29 1.21 0 .926.746 1.667 1.667 1.667s1.667-.74 1.667-1.667c0-.926-.746-1.667-1.667-1.667a1.667 1.667 0 0 0-1.667 1.667v.167c0 .424.103.822.283 1.177.19.369.423.711.713 1.012.29.302.63.54.998.728.37.188.78.29 1.21.29.926 0 1.667.746 1.667 1.667 0 .926-.746-1.667-1.667 1.667-3.5 0-7-1-9-3-2-2-3-5-3-9Z" fill="currentColor" fillOpacity="0.1" />
        <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
        <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
        <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
        <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
    </IconBase>
);

export const Trash2Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V6" fill="currentColor" fillOpacity="0.05" />
        <path d="M8 6V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
    </IconBase>
);

export const MessageSquareIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="currentColor" fillOpacity="0.1" />
    </IconBase>
);

export const HistoryIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M12 7v5l4 2" />
    </IconBase>
);

export const ArrowRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
    </IconBase>
);

export const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
    </IconBase>
);

export const InfoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
    </IconBase>
);

export const Music4Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <path d="M9 18V5l12-2v13" />
        <path d="m9 9 12-2" />
        <circle cx="6" cy="18" r="3" fill="currentColor" fillOpacity="0.2" />
        <circle cx="18" cy="16" r="3" fill="currentColor" fillOpacity="0.2" />
    </IconBase>
);

export const GuitarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <path d="M16.38 3.32a1 1 0 0 0-1.42 1.42l-2.02 2.02a2.83 2.83 0 0 0-4 4L3.32 16.38a1 1 0 0 0 1.42 1.42l5.6-5.6a2.83 2.83 0 0 0 4-4l2.02-2.02a1 1 0 0 0-1.42-1.42z" fill="currentColor" fillOpacity="0.1" />
        <path d="M12 5.5 18.5 12" />
        <path d="m2 2 20 20" />
    </IconBase>
);

export const Settings2Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <path d="M20 7h-9" />
        <path d="M14 17H4" />
        <circle cx="17" cy="17" r="3" fill="currentColor" fillOpacity="0.2" />
        <circle cx="7" cy="7" r="3" fill="currentColor" fillOpacity="0.2" />
    </IconBase>
);

export const StopCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1" />
        <rect x="9" y="9" width="6" height="6" fill="currentColor" />
    </IconBase>
);

export const PaintbrushIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <path d="M18.37 2.63 14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3Z" fill="currentColor" fillOpacity="0.1" />
        <path d="M9 8c-2 3-4 3.5-7 4l8 10c.5-3 1-5 4-7" />
        <path d="M14.5 17.5 4.5 11" />
    </IconBase>
);

export const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </IconBase>
);

export const KeyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <circle cx="7.5" cy="15.5" r="5.5" fill="currentColor" fillOpacity="0.1" />
        <path d="m21 2-9.6 9.6" />
        <path d="m15.5 7.5 3 3" />
    </IconBase>
);

export const CreditCardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <rect width="20" height="14" x="2" y="5" rx="2" fill="currentColor" fillOpacity="0.1" />
        <line x1="2" y1="10" x2="22" y2="10" />
    </IconBase>
);

export const CheckCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </IconBase>
);

export const SoundWave3DIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
        <defs>
            <linearGradient id="waveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#d946ef" />
            </linearGradient>
        </defs>
        <rect x="3" y="10" width="3" height="10" rx="1.5" fill="url(#waveGrad)" />
        <rect x="8" y="4" width="3" height="16" rx="1.5" fill="url(#waveGrad)" />
        <rect x="13" y="7" width="3" height="13" rx="1.5" fill="url(#waveGrad)" />
        <rect x="18" y="11" width="3" height="9" rx="1.5" fill="url(#waveGrad)" />
    </svg>
);

export const Scroll3DIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" {...props}>
        <defs>
            <linearGradient id="scrollGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#d946ef" />
                <stop offset="100%" stopColor="#c026d3" />
            </linearGradient>
            <linearGradient id="scrollShadeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#86198f" />
                <stop offset="100%" stopColor="#701a75" />
            </linearGradient>
        </defs>
        <path d="M52 6H24c-3.31 0-6 2.69-6 6v40c0 3.31 2.69 6 6 6h28c3.31 0 6-2.69 6-6V12c0-3.31-2.69-6-6-6z" fill="url(#scrollGrad)" />
        <path d="M24 6h-2c-3.31 0-6 2.69-6 6v40c0 3.31 2.69 6 6 6h2c-3.31 0-6-2.69-6-6V12c0-3.31 2.69-6 6-6z" fill="url(#scrollShadeGrad)" />
        <rect x="28" y="16" width="20" height="4" rx="2" fill="#f0e7ff" fillOpacity="0.5" />
        <rect x="28" y="26" width="20" height="4" rx="2" fill="#f0e7ff" fillOpacity="0.5" />
        <rect x="28" y="36" width="14" height="4" rx="2" fill="#f0e7ff" fillOpacity="0.5" />
    </svg>
);

export const SunIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.2" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m4.93 19.07 1.41-1.41" />
        <path d="m17.66 6.34 1.41-1.41" />
    </IconBase>
);

export const MoonIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="currentColor" fillOpacity="0.1" />
    </IconBase>
);

export const BookmarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" fill="currentColor" fillOpacity="0.1" />
    </IconBase>
);

export const BugIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <path d="m8 2 1.88 1.88" />
        <path d="M14.12 3.88 16 2" />
        <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
        <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" fill="currentColor" fillOpacity="0.1" />
        <path d="M12 20v-9" />
        <path d="M6.53 9C4.6 8.8 3 7.1 3 5" />
        <path d="M6 13H2" />
        <path d="M3 21c0-2.1 1.7-3.9 3.8-4" />
        <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4" />
        <path d="M22 13h-4" />
        <path d="M17.2 17c2.1.1 3.8 1.9 3.8 4" />
    </IconBase>
);

export const MailIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <rect width="20" height="16" x="2" y="4" rx="2" fill="currentColor" fillOpacity="0.1" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </IconBase>
);

// Keep flags as is, they are specific
export const FlagThIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 27 18" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <g clipPath="url(#clipTh)">
            <rect width="27" height="18" fill="#fff"/>
            <rect width="27" height="3" fill="#A51931"/>
            <rect y="15" width="27" height="3" fill="#A51931"/>
            <rect y="3" width="27" height="3" fill="#fff"/>
            <rect y="12" width="27" height="3" fill="#fff"/>
            <rect y="6" width="27" height="6" fill="#2D2A4A"/>
        </g>
        <defs>
            <clipPath id="clipTh">
                <rect width="27" height="18" rx="2" fill="white"/>
            </clipPath>
        </defs>
    </svg>
);

export const FlagEnIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 27 18" xmlns="http://www.w3.org/2000/svg" {...props}>
        <defs>
            <clipPath id="clipEn">
                <rect width="27" height="18" rx="2"/>
            </clipPath>
            <clipPath id="clipPatrick">
                <path d="M0,9 V0 h13.5 L0,9z M27,9 V18 H13.5 L27,9z"/>
            </clipPath>
        </defs>
        <g clipPath="url(#clipEn)">
            <rect width="27" height="18" fill="#012169"/>
            <path d="M0,0 L27,18 M27,0 L0,18" stroke="#FFF" strokeWidth="3.6"/>
            <path d="M0,0 L27,18 M27,0 L0,18" stroke="#C8102E" strokeWidth="2.4" clipPath="url(#clipPatrick)"/>
            <path d="M13.5,0 V18 M0,9 H27" stroke="#FFF" strokeWidth="5.4"/>
            <path d="M13.5,0 V18 M0,9 H27" stroke="#C8102E" strokeWidth="3.6"/>
        </g>
    </svg>
);

export const FlagCnIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 27 18" fill="#FFC72C" xmlns="http://www.w3.org/2000/svg" {...props}>
        <g clipPath="url(#clipCn)">
            <rect width="27" height="18" fill="#EE1C25"/>
            <path id="cn_star" d="M0-1l.309.951L-.5-.095h1.009L-.309.951z"/>
            <use href="#cn_star" transform="translate(4.5,4.5) scale(2.7)"/>
            <use href="#cn_star" transform="translate(9,2.25) rotate(23.036)"/>
            <use href="#cn_star" transform="translate(10.8,4.5) rotate(45.87)"/>
            <use href="#cn_star" transform="translate(10.8,6.75) rotate(69.945)"/>
            <use href="#cn_star" transform="translate(9,8.25) rotate(90)"/>
        </g>
        <defs>
            <clipPath id="clipCn">
                <rect width="27" height="18" rx="2" fill="white"/>
            </clipPath>
        </defs>
    </svg>
);

export const FlagJpIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 27 18" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <g clipPath="url(#clipJp)">
            <rect width="27" height="18" fill="#fff"/>
            <circle cx="13.5" cy="9" r="5.4" fill="#BC002D"/>
        </g>
        <defs>
            <clipPath id="clipJp">
                <rect width="27" height="18" rx="2" fill="white"/>
            </clipPath>
        </defs>
    </svg>
);

export const FlagKrIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 27 18" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <g clipPath="url(#clipKr)">
            <rect width="27" height="18" fill="white"/>
            <circle cx="13.5" cy="9" r="4.5" fill="#CD2E3A"/>
            <path d="M13.5,13.5 A4.5,4.5 0 0,1 13.5,4.5 V9 A2.25,2.25 0 0,0 13.5,13.5 Z" fill="#0047A0"/>
            
            <g id="kr_bar" fill="#000">
                <rect x="-2.25" y="-0.5" width="4.5" height="1"/>
            </g>
            <g id="kr_bar_broken" fill="#000">
                <rect x="-2.25" y="-0.5" width="2" height="1"/>
                <rect x="0.25" y="-0.5" width="2" height="1"/>
            </g>

            <g transform="translate(5.25, 4.5) rotate(-33.7)">
                <use href="#kr_bar" y="-1.7"/>
                <use href="#kr_bar" y="0"/>
                <use href="#kr_bar" y="1.7"/>
            </g>
            <g transform="translate(5.25, 13.5) rotate(33.7)">
                <use href="#kr_bar" y="-1.7"/>
                <use href="#kr_bar_broken" y="0"/>
                <use href="#kr_bar" y="1.7"/>
            </g>
            <g transform="translate(21.75, 4.5) rotate(33.7)">
                <use href="#kr_bar_broken" y="-1.7"/>
                <use href="#kr_bar" y="0"/>
                <use href="#kr_bar_broken" y="1.7"/>
            </g>
            <g transform="translate(21.75, 13.5) rotate(-33.7)">
                <use href="#kr_bar_broken" y="-1.7"/>
                <use href="#kr_bar_broken" y="0"/>
                <use href="#kr_bar_broken" y="1.7"/>
            </g>
        </g>
        <defs>
            <clipPath id="clipKr">
                <rect width="27" height="18" rx="2" fill="white"/>
            </clipPath>
        </defs>
    </svg>
);

export const FileTextIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" fill="currentColor" fillOpacity="0.1" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
    </IconBase>
);

export const ExternalLinkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
    </IconBase>
);

export const ClockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1" />
        <polyline points="12 6 12 12 16 14" />
    </IconBase>
);

export const AlignLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <line x1="17" y1="10" x2="3" y2="10" strokeWidth="3" strokeLinecap="square"/>
        <line x1="21" y1="6" x2="3" y2="6" strokeWidth="3" strokeLinecap="square"/>
        <line x1="21" y1="14" x2="3" y2="14" strokeWidth="3" strokeLinecap="square"/>
        <line x1="17" y1="18" x2="3" y2="18" strokeWidth="3" strokeLinecap="square"/>
    </IconBase>
);

export const HashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <line x1="4" y1="9" x2="20" y2="9" />
        <line x1="4" y1="15" x2="20" y2="15" />
        <line x1="10" y1="3" x2="8" y2="21" />
        <line x1="16" y1="3" x2="14" y2="21" />
    </IconBase>
);

export const LayoutDashboardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <rect width="7" height="9" x="3" y="3" rx="1" fill="currentColor" fillOpacity="0.1" />
        <rect width="7" height="5" x="14" y="3" rx="1" fill="currentColor" fillOpacity="0.2" />
        <rect width="7" height="9" x="14" y="12" rx="1" fill="currentColor" fillOpacity="0.1" />
        <rect width="7" height="5" x="3" y="16" rx="1" fill="currentColor" fillOpacity="0.2" />
    </IconBase>
);

export const ListMusicIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <path d="M21 15V6" />
        <path d="M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" fill="currentColor" fillOpacity="0.2" />
        <path d="M12 12H3" />
        <path d="M16 6H3" />
        <path d="M12 18H3" />
    </IconBase>
);
