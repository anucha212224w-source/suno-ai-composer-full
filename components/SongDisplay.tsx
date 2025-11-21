
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
    PlayIcon, StopCircleIcon, CopyIcon, CheckIcon, 
    RefreshCwIcon, WandSparklesIcon, ImageIcon, 
    DownloadIcon, ShareIcon, FileTextIcon, SpinnerIcon,
    MusicIcon, Settings2Icon, CpuChipIcon
} from './icons';
import { translations, type Language } from '../translations';
import { useAppContext } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { generateImagePrompt, generateVideoPrompt, reviseSong, generateVocalPreview, RateLimitError } from '../geminiService';
import { AlbumArtGeneratorModal } from './AlbumArtGeneratorModal';
import RevisionModal from './RevisionModal';
import type { FormState } from '../types';
import { decode, decodeAudioData, calculateAutoMetrics } from '../utils';
import AudioVisualizer from './AudioVisualizer';

interface SongDisplayProps {
  songData: string | null;
  isLoading: boolean;
  watermark: string;
  songStructure: string[];
  onRemix: () => void;
  inputs: FormState | null;
}

const createDynamicRegex = (getLabel: (t: (typeof translations)[keyof typeof translations]) => string): RegExp => {
    // Escape special characters and join labels
    const labels = Object.values(translations).map(t => getLabel(t).slice(0, -1).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    // Robust regex to handle optional Markdown asterisks around labels (e.g., **Style:** or **Style**: )
    return new RegExp(`^\\s*[\\*]*(${labels})[\\*]*\\s*:\\s*(.*)`, 'm');
};

const TITLE_REGEX = createDynamicRegex(t => t.prompts.label_song_title);
const STYLE_REGEX = createDynamicRegex(t => t.prompts.label_style);
const LYRICS_HEADER_REGEX = createDynamicRegex(t => t.prompts.label_lyrics);

// Helper to clean markdown bold/italics from extracted text
const cleanMarkdown = (text: string) => text.replace(/\*/g, '').trim();

export const SongDisplay: React.FC<SongDisplayProps> = ({ 
    songData, 
    isLoading, 
    watermark, 
    songStructure, 
    onRemix,
    inputs 
}) => {
    const { language, openBugReportModal } = useAppContext();
    const { showToast } = useToast();
    const t = translations[language].ui;

    const [parsedSong, setParsedSong] = useState<{ title: string; style: string; lyrics: string } | null>(null);
    const [isArtModalOpen, setIsArtModalOpen] = useState(false);
    const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
    const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
    const [isRevising, setIsRevising] = useState(false);
    
    // Audio Preview State
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoadingAudio, setIsLoadingAudio] = useState(false);
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
    const [audioSource, setAudioSource] = useState<AudioBufferSourceNode | null>(null);
    const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
    const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);

    // Metrics Calculation
    const metrics = useMemo(() => {
        if (!inputs) return { weirdness: 50, influence: 50 };
        if (inputs.sunoAiMode === 'auto') {
            return calculateAutoMetrics(inputs.selectedGenre, inputs.selectedMood);
        }
        return { weirdness: inputs.weirdness, influence: inputs.styleInfluence };
    }, [inputs]);

    useEffect(() => {
        if (songData) {
            const titleMatch = songData.match(TITLE_REGEX);
            const styleMatch = songData.match(STYLE_REGEX);
            
            const lyricsHeaderMatch = songData.match(LYRICS_HEADER_REGEX);
            let lyrics = '';
            
            if (lyricsHeaderMatch && lyricsHeaderMatch.index !== undefined) {
                lyrics = songData.substring(lyricsHeaderMatch.index + lyricsHeaderMatch[0].length).trim();
            } else {
                // Fallback if no lyrics header found, look for first bracketed section
                const firstSectionIndex = songData.search(/\[.*\]/);
                if (firstSectionIndex !== -1) {
                    lyrics = songData.substring(firstSectionIndex).trim();
                } else {
                    lyrics = songData; // Fallback to everything if structure is weird
                }
            }
            
            // Add watermark if present
            if (watermark && lyrics) {
                const cleanTitle = titleMatch ? cleanMarkdown(titleMatch[2]) : 'Untitled';
                const cleanStyle = styleMatch ? cleanMarkdown(styleMatch[2]) : 'Unknown Style';
                const formattedWatermark = watermark
                    .replace('{title}', cleanTitle)
                    .replace('{style}', cleanStyle);
                lyrics += `\n\n(${formattedWatermark})`;
            }

            setParsedSong({
                title: titleMatch ? cleanMarkdown(titleMatch[2]) : 'Untitled',
                style: styleMatch ? cleanMarkdown(styleMatch[2]) : 'Unknown Style',
                lyrics: lyrics
            });
        } else {
            setParsedSong(null);
        }
        
        // Cleanup audio on new song or unmount
        return () => stopAudio();
    }, [songData, watermark, language]); // Re-parse if language changes (regexes change)

    const stopAudio = () => {
        if (audioSource) {
            try {
                audioSource.stop();
            } catch (e) {
                // ignore if already stopped
            }
            setAudioSource(null);
        }
        setIsPlaying(false);
    };

    const handlePlayPreview = async () => {
        if (isPlaying) {
            stopAudio();
            return;
        }

        if (!songData) return;

        try {
            setIsLoadingAudio(true);
            
            let bufferToPlay = audioBuffer;

            if (!bufferToPlay) {
                // Generate if not cached
                const activeApiKey = localStorage.getItem('suno-composer-active-api-key');
                if (!activeApiKey) throw new Error("No API Key available");

                const base64Audio = await generateVocalPreview(songData, language, activeApiKey);
                
                const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                setAudioContext(ctx);
                
                const binaryData = decode(base64Audio);
                bufferToPlay = await decodeAudioData(binaryData, ctx, 24000, 1); // Mono for TTS usually
                setAudioBuffer(bufferToPlay);
            } else if (audioContext && audioContext.state === 'suspended') {
                 await audioContext.resume();
            }

            if (!bufferToPlay || !audioContext) return;

            const source = audioContext.createBufferSource();
            source.buffer = bufferToPlay;
            
            const newAnalyser = audioContext.createAnalyser();
            newAnalyser.fftSize = 256;
            source.connect(newAnalyser);
            newAnalyser.connect(audioContext.destination);
            
            setAnalyser(newAnalyser);
            setAudioSource(source);
            
            source.onended = () => {
                setIsPlaying(false);
                setAudioSource(null);
            };
            
            source.start();
            setIsPlaying(true);

        } catch (error) {
            console.error("Audio preview failed:", error);
            showToast("Failed to generate audio preview", 'error');
        } finally {
            setIsLoadingAudio(false);
        }
    };

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        showToast(`${label} ${t.copySuccess}`, 'success');
    };
    
    const handleDownload = () => {
        if (!parsedSong) return;
        const element = document.createElement("a");
        const file = new Blob([songData || ''], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = `${parsedSong.title.replace(/[^a-z0-9]/gi, '_')}_lyrics.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const handleArtSubmit = async (settings: any) => {
        setIsArtModalOpen(false);
        try {
            const activeApiKey = localStorage.getItem('suno-composer-active-api-key');
            if (!activeApiKey) throw new Error("No API Key");
            
            const artPrompt = await generateImagePrompt(songData!, inputs!, language, activeApiKey);
            
            navigator.clipboard.writeText(artPrompt);
            showToast("Art prompt copied to clipboard!", 'success');
            
        } catch (error) {
            console.error("Art prompt generation failed:", error);
            showToast("Failed to generate art prompt", 'error');
        }
    };
    
    const handleVideoGenerate = async () => {
        if (!songData || !inputs) return;
        setIsGeneratingVideo(true);
        try {
            const activeApiKey = localStorage.getItem('suno-composer-active-api-key');
            if (!activeApiKey) throw new Error("No API Key");

            const videoPrompt = await generateVideoPrompt(songData, inputs, language, activeApiKey);
            
            navigator.clipboard.writeText(videoPrompt);
            showToast("Video concept copied to clipboard!", 'success');
        } catch (error) {
             console.error("Video prompt failed:", error);
             openBugReportModal(error instanceof Error ? error.message : "Video Prompt Error");
             showToast("Failed to generate video concept", 'error');
        } finally {
            setIsGeneratingVideo(false);
        }
    };

    const handleRevisionSubmit = async (request: string) => {
        if (!parsedSong || !songData) return;
        setIsRevising(true);
        try {
            const activeApiKey = localStorage.getItem('suno-composer-active-api-key');
            if (!activeApiKey) throw new Error("No API Key");

            const revisedSong = await reviseSong(songData, request, inputs?.selectedModel || 'gemini-3-pro-preview', language, activeApiKey);
            
            navigator.clipboard.writeText(revisedSong);
            showToast("Revised song copied to clipboard! (Paste to replace)", 'success');
            setIsRevisionModalOpen(false);
            
        } catch (error) {
            handleError(error);
        } finally {
            setIsRevising(false);
        }
    };

    const handleError = (error: unknown) => {
        const msg = error instanceof Error ? error.message : t.errorUnknown;
        if (error instanceof RateLimitError) {
             showToast(msg, 'error');
        } else {
             showToast(msg, 'error');
        }
    };

    if (isLoading) {
        return (
            <div className="w-full py-12 flex flex-col items-center justify-center text-center space-y-6 animate-pulse-slow">
                <div className="relative">
                    <div className="absolute inset-0 bg-[var(--color-primary-brand)] blur-xl opacity-20 rounded-full"></div>
                    <SpinnerIcon className="w-12 h-12 text-[var(--color-primary-brand)] relative z-10 animate-spin" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-lg font-bold text-[var(--color-text-primary)]">{t.loadingMessages[0]}</h3>
                    <p className="text-sm text-[var(--color-text-tertiary)]">Powered by Gemini 3 Pro</p>
                </div>
            </div>
        );
    }

    if (!songData || !parsedSong) {
        return (
            <div className="w-full py-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-[var(--color-border)] rounded-xl bg-[var(--color-bg-light)]/50">
                <MusicIcon className="w-12 h-12 text-[var(--color-text-tertiary)] mb-4 opacity-50" />
                <h3 className="text-lg font-bold text-[var(--color-text-secondary)]">{t.displayPlaceholder1}</h3>
                <p className="text-sm text-[var(--color-text-tertiary)]">{t.displayPlaceholder2}</p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6 animate-fade-in">
            {/* Header Card */}
            <div className="glass-panel-pro p-6 rounded-xl border border-[var(--color-border)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[var(--color-primary-brand)] to-transparent opacity-5 blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row gap-6 justify-between items-start">
                    <div className="space-y-4 flex-grow min-w-0">
                        <div>
                            <div className="flex items-center gap-2 text-[var(--color-text-tertiary)] text-xs font-bold uppercase tracking-widest mb-1">
                                <span>Title</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black text-[var(--color-text-primary)] tracking-tight break-words leading-tight">
                                {parsedSong.title}
                            </h2>
                        </div>
                        
                        <div>
                             <div className="flex items-center gap-2 text-[var(--color-text-tertiary)] text-xs font-bold uppercase tracking-widest mb-1">
                                <span>Style</span>
                            </div>
                            <p className="text-sm sm:text-base font-medium text-[var(--color-primary-brand)] break-words leading-relaxed">
                                {parsedSong.style}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2">
                             <button onClick={() => handleCopy(parsedSong.title, t.copyTitle)} className="btn btn-secondary !text-xs flex items-center gap-2">
                                <CopyIcon className="w-3 h-3" /> {t.copyTitle}
                            </button>
                             <button onClick={() => handleCopy(parsedSong.style, t.copyStyle)} className="btn btn-secondary !text-xs flex items-center gap-2">
                                <CopyIcon className="w-3 h-3" /> {t.copyStyle}
                            </button>
                             <button onClick={() => handleCopy(songData, t.copyAll)} className="btn btn-secondary !text-xs flex items-center gap-2">
                                <CopyIcon className="w-3 h-3" /> {t.copyAll}
                            </button>
                        </div>
                    </div>

                    {/* Action Toolbar */}
                    <div className="flex flex-col gap-2 w-full md:w-auto flex-shrink-0">
                         <a 
                            href="https://suno.com/create" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="btn btn-primary w-full justify-center flex items-center gap-2 shadow-lg shadow-[var(--color-primary-brand)]/20"
                        >
                            <span className="font-bold">{t.openSunoButton}</span>
                            <ShareIcon className="w-4 h-4" />
                        </a>
                        
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => setIsArtModalOpen(true)} className="btn btn-secondary w-full justify-center flex-col gap-1 !py-2 h-auto">
                                <ImageIcon className="w-5 h-5 text-[var(--color-accent-cyan)]" />
                                <span className="text-[10px] font-bold uppercase">Art</span>
                            </button>
                            <button onClick={handleVideoGenerate} disabled={isGeneratingVideo} className="btn btn-secondary w-full justify-center flex-col gap-1 !py-2 h-auto">
                                {isGeneratingVideo ? <SpinnerIcon className="w-5 h-5 animate-spin text-[var(--color-accent-cyan)]" /> : <FileTextIcon className="w-5 h-5 text-[var(--color-accent-cyan)]" />}
                                <span className="text-[10px] font-bold uppercase">Video</span>
                            </button>
                            <button onClick={() => setIsRevisionModalOpen(true)} className="btn btn-secondary w-full justify-center flex-col gap-1 !py-2 h-auto">
                                <WandSparklesIcon className="w-5 h-5 text-[var(--color-primary-brand)]" />
                                <span className="text-[10px] font-bold uppercase">{t.reviseButton}</span>
                            </button>
                            <button onClick={onRemix} className="btn btn-secondary w-full justify-center flex-col gap-1 !py-2 h-auto">
                                <RefreshCwIcon className="w-5 h-5 text-[var(--color-primary-brand)]" />
                                <span className="text-[10px] font-bold uppercase">{t.remixButton}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Suno Settings Panel (Results View) */}
            <div className="glass-panel-pro p-4 rounded-xl border border-[var(--color-border)]">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-tertiary)] flex items-center gap-2">
                        <Settings2Icon className="w-4 h-4" /> {t.labelSunoSettings}
                    </h3>
                    {inputs?.sunoAiMode === 'auto' && (
                        <span className="px-2 py-0.5 rounded-full bg-[var(--color-accent-cyan-dim)] text-[var(--color-accent-cyan)] text-[10px] font-bold uppercase flex items-center gap-1">
                            <CpuChipIcon className="w-3 h-3" /> Auto Optimized
                        </span>
                    )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                    <div>
                        <div className="flex justify-between items-center text-xs text-[var(--color-text-secondary)] mb-1">
                            <span>{t.labelWeirdness}</span>
                            <span className={`font-mono font-bold ${inputs?.sunoAiMode === 'auto' ? 'text-[var(--color-accent-cyan)]' : 'text-[var(--color-primary-brand)]'}`}>
                                {metrics.weirdness}
                            </span>
                        </div>
                        <div className="w-full h-2 bg-[var(--color-bg)] rounded-full overflow-hidden border border-[var(--color-border)]">
                            <div 
                                className={`h-full rounded-full ${inputs?.sunoAiMode === 'auto' ? 'bg-[var(--color-accent-cyan)]' : 'bg-[var(--color-primary-brand)]'}`} 
                                style={{ width: `${metrics.weirdness}%` }}
                            ></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between items-center text-xs text-[var(--color-text-secondary)] mb-1">
                            <span>{t.labelStyleInfluence}</span>
                            <span className={`font-mono font-bold ${inputs?.sunoAiMode === 'auto' ? 'text-[var(--color-accent-cyan)]' : 'text-[var(--color-primary-brand)]'}`}>
                                {metrics.influence}
                            </span>
                        </div>
                        <div className="w-full h-2 bg-[var(--color-bg)] rounded-full overflow-hidden border border-[var(--color-border)]">
                            <div 
                                className={`h-full rounded-full ${inputs?.sunoAiMode === 'auto' ? 'bg-[var(--color-accent-cyan)]' : 'bg-[var(--color-primary-brand)]'}`} 
                                style={{ width: `${metrics.influence}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Audio Preview Section */}
            <div className="glass-panel-pro p-4 rounded-xl border border-[var(--color-border)] flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex-shrink-0 p-3 bg-[var(--color-bg)] rounded-full border border-[var(--color-border)]">
                     {isLoadingAudio ? <SpinnerIcon className="w-6 h-6 animate-spin text-[var(--color-primary-brand)]" /> : 
                      isPlaying ? <StopCircleIcon className="w-6 h-6 text-[var(--color-error)]" /> :
                      <PlayIcon className="w-6 h-6 text-[var(--color-primary-brand)]" />
                     }
                </div>
                <div className="flex-grow w-full text-center sm:text-left">
                    <h3 className="font-bold text-[var(--color-text-primary)] text-sm">{t.vocalPreviewTitle}</h3>
                    <p className="text-xs text-[var(--color-text-tertiary)]">AI-generated preview of the lyrics rhythm</p>
                </div>
                
                {isPlaying && analyser && (
                    <div className="flex-grow w-full sm:w-48 h-12">
                        <AudioVisualizer analyser={analyser} />
                    </div>
                )}
                
                <button 
                    onClick={handlePlayPreview} 
                    disabled={isLoadingAudio}
                    className={`btn w-full sm:w-auto whitespace-nowrap font-bold uppercase text-xs px-6 py-3 ${isPlaying ? 'btn-danger-outline' : 'btn-primary'}`}
                >
                    {isLoadingAudio ? t.loadingAudioButton : isPlaying ? t.stopAudioButton : t.listenButton}
                </button>
            </div>

            {/* Lyrics Section */}
            <div className="space-y-2">
                <div className="flex items-center justify-between px-2">
                     <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-tertiary)] flex items-center gap-2">
                        <FileTextIcon className="w-4 h-4" /> {t.labelLyrics}
                    </h3>
                    <div className="flex gap-2">
                        <button onClick={() => handleCopy(parsedSong.lyrics, t.copyLyrics)} className="text-xs font-bold text-[var(--color-primary-brand)] hover:underline uppercase">
                            {t.copyLyrics}
                        </button>
                         <button onClick={handleDownload} className="text-xs font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:underline uppercase flex items-center gap-1">
                            <DownloadIcon className="w-3 h-3" /> {t.downloadLyricsButton.replace('Download ', '')}
                        </button>
                    </div>
                </div>
                <div className="w-full min-h-[300px] p-6 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)] font-mono text-sm leading-relaxed whitespace-pre-wrap text-[var(--color-text-secondary)] shadow-inner select-text">
                    {parsedSong.lyrics}
                </div>
            </div>

            <AlbumArtGeneratorModal
                isOpen={isArtModalOpen}
                onClose={() => setIsArtModalOpen(false)}
                onSubmit={handleArtSubmit}
                songData={songData}
                inputs={inputs}
                t={t}
                language={language}
            />
            
            <RevisionModal
                isOpen={isRevisionModalOpen}
                onClose={() => setIsRevisionModalOpen(false)}
                originalSongData={songData}
                onSubmit={handleRevisionSubmit}
                isRevising={isRevising}
            />
        </div>
    );
};
