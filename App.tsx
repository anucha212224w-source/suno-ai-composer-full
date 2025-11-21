
import React, { useState, useCallback, useEffect, useMemo, lazy, Suspense, useRef } from 'react';
import { InputForm } from './components/InputForm';
import { SongDisplay } from './components/SongDisplay';
import { generateSong, RateLimitError } from './geminiService';
import { SunIcon, MoonIcon, HistoryIcon, Music4Icon } from './components/icons';
import { translations, type Language } from './translations';
import { useAppContext } from './contexts/AppContext';
import { useToast } from './contexts/ToastContext';
import { ToastContainer } from './components/Toast';
import WelcomeModal from './components/WelcomeModal';
import ApiKeyModal from './components/ApiKeyModal';
import ConfirmationDialog from './components/ConfirmationDialog';
import RateLimitModal from './components/RateLimitModal';
import { generateRandomIdea, generateNarrativeFromIdea, generateRandomNarrative, generateSongStructure, generateStyleFromArtist, generateStyleFromIdea } from './geminiService';
import type { FormState, ActiveTab, HistoryItem } from './types';
import BugReportModal from './components/BugReportModal';
import FloatingBugButton from './components/FloatingBugButton';

const HistoryModal = lazy(() => import('./components/HistoryModal'));
const SupportModal = lazy(() => import('./components/SupportModal'));

const initialFormState: FormState = {
    prompt: '',
    coreTheme: '',
    story: '',
    keyEmotions: '',
    imagery: '',
    selectedGenre: [],
    selectedMood: [],
    selectedTempo: [],
    selectedVocal: translations['th'].options.VOCALS[0],
    selectedInstruments: [],
    inspiredBySong: '',
    inspiredByArtist: '',
    maleRole: '',
    femaleRole: '',
    songStructure: [],
    sunoAiMode: 'auto',
    weirdness: 50,
    styleInfluence: 50,
    selectedModel: 'gemini-3-pro-preview',
    excludedWords: '',
    watermark: '',
};

const HISTORY_KEY = 'suno-composer-history';
const MAX_HISTORY_ITEMS = 30;

const App: React.FC = () => {
  const { 
    language, 
    handleLanguageChange: setLanguage,
    isSupportModalOpen,
    handleCloseSupportModal,
    rateLimitError,
    setRateLimitError,
    theme,
    toggleTheme,
    activeApiKey,
    isApiKeyModalOpen,
    openApiKeyModal,
    deleteApiKey,
    isWelcomeModalOpen,
    isBugReportModalOpen,
    openBugReportModal
  } = useAppContext();
  
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState<ActiveTab>('idea');
  
  const t = useMemo(() => translations[language], [language]);

  const [formState, setFormState] = useState<FormState>({
    ...initialFormState,
    selectedVocal: t.options.VOCALS[0],
  });

  const [songData, setSongData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRandomizingIdea, setIsRandomizingIdea] = useState<boolean>(false);
  const [pendingIdeaRandomization, setPendingIdeaRandomization] = useState<string | null>(null);
  const [isRandomizingNarrative, setIsRandomizingNarrative] = useState<boolean>(false);
  const [isRandomizingStructure, setIsRandomizingStructure] = useState<boolean>(false);
  const [isRandomizingStyle, setIsRandomizingStyle] = useState<boolean>(false);
  const [isAnalyzingArtistStyle, setIsAnalyzingArtistStyle] = useState<boolean>(false);
  const [isRandomizingAll, setIsRandomizingAll] = useState<boolean>(false);
  const [pendingRandomization, setPendingRandomization] = useState<Partial<FormState> | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [currentSongInputs, setCurrentSongInputs] = useState<FormState | null>(null);
  
  const resultsRef = useRef<HTMLDivElement>(null);

  // --- Dynamic Browser Theme Color for Mobile ---
  useEffect(() => {
      const metaThemeColor = document.querySelector("meta[name='theme-color']");
      if (metaThemeColor) {
          // If light theme, use white (#ffffff) or light gray (#f8fafc)
          // If dark theme, use the dark background color (#050506)
          metaThemeColor.setAttribute('content', theme === 'light' ? '#ffffff' : '#050506');
      }
  }, [theme]);

  useEffect(() => {
    const initialize = () => {
        try {
            const savedStateJSON = localStorage.getItem('suno-composer-form-state');
            if (savedStateJSON) {
                const savedState = JSON.parse(savedStateJSON);
                
                if (!savedState.selectedModel || (savedState.selectedModel !== 'gemini-2.5-pro' && savedState.selectedModel !== 'gemini-3-pro-preview')) {
                    savedState.selectedModel = 'gemini-3-pro-preview';
                }
                
                const currentLangOptions = translations[language].options;

                if (savedState.selectedVocal && !currentLangOptions.VOCALS.includes(savedState.selectedVocal)) {
                    savedState.selectedVocal = currentLangOptions.VOCALS[0];
                }
                if (savedState.selectedGenre) {
                    savedState.selectedGenre = savedState.selectedGenre.filter((g: string) => [...currentLangOptions.GENRES, ...savedState.selectedGenre].includes(g));
                }
                 if (savedState.selectedMood) {
                    savedState.selectedMood = savedState.selectedMood.filter((m: string) => [...currentLangOptions.MOODS, ...savedState.selectedMood].includes(m));
                }
                if (savedState.selectedTempo) {
                    savedState.selectedTempo = savedState.selectedTempo.filter((t: string) => [...currentLangOptions.TEMPOS, ...savedState.selectedTempo].includes(t));
                }
                if (savedState.selectedInstruments) {
                    savedState.selectedInstruments = savedState.selectedInstruments.filter((i: string) => [...currentLangOptions.INSTRUMENTS, ...savedState.selectedInstruments].includes(i));
                }

                setFormState(prevState => ({ ...prevState, ...savedState }));
            }
            
            const savedHistoryJSON = localStorage.getItem(HISTORY_KEY);
            if (savedHistoryJSON) {
                setHistory(JSON.parse(savedHistoryJSON));
            }
        } catch (error) {
            console.error('Could not load state from localStorage:', error);
            localStorage.removeItem('suno-composer-form-state');
            localStorage.removeItem(HISTORY_KEY);
        }
    };
    initialize();
  }, [language]);


  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem('suno-composer-form-state', JSON.stringify(formState));
      } catch (error) {
        console.error('Could not save form state to localStorage:', error);
      }
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [formState]);

  useEffect(() => {
    const mainContainer = document.getElementById('main-container');
    if (mainContainer) {
        if (isHistoryModalOpen || isResetConfirmOpen || isApiKeyModalOpen || isSupportModalOpen || isWelcomeModalOpen || isBugReportModalOpen || !!rateLimitError) {
            mainContainer.setAttribute('aria-hidden', 'true');
        } else {
            mainContainer.removeAttribute('aria-hidden');
        }
    }
  }, [isHistoryModalOpen, isResetConfirmOpen, isApiKeyModalOpen, isSupportModalOpen, isWelcomeModalOpen, isBugReportModalOpen, rateLimitError]);

  useEffect(() => {
    const isModalOpen = isHistoryModalOpen || isResetConfirmOpen || !!rateLimitError || isApiKeyModalOpen || isSupportModalOpen || isWelcomeModalOpen || isBugReportModalOpen;
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isHistoryModalOpen, isResetConfirmOpen, rateLimitError, isApiKeyModalOpen, isSupportModalOpen, isWelcomeModalOpen, isBugReportModalOpen]);


  const addToHistory = (songData: string, inputs: FormState) => {
    const titleMatch = songData.match(new RegExp(`^${t.prompts.label_song_title.slice(0, -1)}:\\s*(.*)`, 'm'));
    const styleMatch = songData.match(new RegExp(`^${t.prompts.label_style.slice(0, -1)}:\\s*(.*)`, 'm'));

    const newHistoryItem: HistoryItem = {
      id: Date.now(),
      songData,
      inputs,
      title: titleMatch ? titleMatch[1].trim() : 'Untitled',
      style: styleMatch ? styleMatch[1].trim() : 'Unknown Style',
      createdAt: new Date().toISOString(),
    };

    setHistory(prevHistory => {
        const updatedHistory = [newHistoryItem, ...prevHistory].slice(0, MAX_HISTORY_ITEMS);
        try {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
        } catch (error) {
            console.error("Could not save history to localStorage:", error);
        }
        return updatedHistory;
    });
  };

  const deleteHistoryItem = (id: number) => {
    setHistory(prevHistory => {
        const updatedHistory = prevHistory.filter(item => item.id !== id);
        try {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
        } catch (error) {
            console.error("Could not save history to localStorage:", error);
        }
        return updatedHistory;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    try {
        localStorage.removeItem(HISTORY_KEY);
    } catch (error) {
        console.error("Could not remove history from localStorage:", error);
    }
  };

  const restoreFromHistory = (item: HistoryItem) => {
    setFormState(item.inputs);
    setSongData(item.songData);
    setCurrentSongInputs(item.inputs); 
    setIsHistoryModalOpen(false);
    // Scroll to results after restore
    setTimeout(() => {
        if (resultsRef.current) {
            resultsRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, 300);
  };

  const handleApiError = useCallback((error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : t.ui.errorUnknown;
      if (errorMessage === t.ui.apiKeyInvalidError && activeApiKey) {
          showToast(errorMessage, 'error');
          deleteApiKey(activeApiKey); 
          return true; 
      }
      if (error instanceof RateLimitError) {
          setRateLimitError(errorMessage);
      } else {
          showToast(errorMessage, 'error');
          if (errorMessage !== t.ui.errorNetwork && errorMessage !== t.ui.errorModelOverloaded) {
             openBugReportModal(errorMessage);
          }
      }
      return false; 
  }, [t.ui.errorUnknown, t.ui.apiKeyInvalidError, t.ui.errorNetwork, t.ui.errorModelOverloaded, showToast, deleteApiKey, setRateLimitError, activeApiKey, openBugReportModal]);


  const handleFormChange = useCallback((newState: Partial<FormState>) => {
    setFormState(prevState => ({ ...prevState, ...newState }));
  }, []);

  const handleGenerateSong = useCallback(async () => {
    if (!activeApiKey) {
      openApiKeyModal();
      return;
    }

    const hasMainIdea = formState.prompt.trim() !== '';
    const hasNarrative = [formState.coreTheme, formState.story, formState.keyEmotions, formState.imagery].some(field => field.trim() !== '');

    if (!hasMainIdea && !hasNarrative) {
      showToast(t.ui.errorPrompt, 'error');
      return;
    }
    
    setIsLoading(true);
    setSongData(null);
    setCurrentSongInputs(null);
    
    // Scroll to results immediately so user sees the loading state
    setTimeout(() => {
         if (resultsRef.current) {
             resultsRef.current.scrollIntoView({ behavior: 'smooth' });
         }
    }, 100);

    const userPrompt = [
        `Main Idea: ${formState.prompt || 'Not provided'}.`,
        `Core Theme: ${formState.coreTheme || 'Not provided'}.`,
        `Story: ${formState.story || 'Not provided'}.`,
        `Key Emotions: ${formState.keyEmotions || 'Not provided'}.`,
        `Imagery: ${formState.imagery || 'Not provided'}.`
    ].join('\n');


    try {
      const result = await generateSong({
        userPrompt,
        genres: formState.selectedGenre,
        moods: formState.selectedMood,
        tempos: formState.selectedTempo,
        vocalGender: formState.selectedVocal,
        instruments: formState.selectedInstruments,
        inspiredBySong: formState.inspiredBySong,
        inspiredByArtist: formState.inspiredByArtist,
        maleRole: formState.maleRole,
        femaleRole: formState.femaleRole,
        songStructure: formState.songStructure,
        sunoAiMode: formState.sunoAiMode,
        weirdness: formState.weirdness,
        styleInfluence: formState.styleInfluence,
        excludedWords: formState.excludedWords,
        model: formState.selectedModel,
        language,
      }, activeApiKey);
      setSongData(result);
      setCurrentSongInputs(formState);
      addToHistory(result, formState);

    } catch (error) {
      console.error("Song generation failed:", error);
      handleApiError(error);
      setSongData(null);
    } finally {
      setIsLoading(false);
    }
  }, [formState, language, showToast, t, setRateLimitError, activeApiKey, openApiKeyModal, handleApiError]);

  const handleRandomizeMainIdea = async () => {
    if (!activeApiKey) { openApiKeyModal(); return; }
    setIsRandomizingIdea(true);
    setPendingIdeaRandomization(null);
    try {
        const idea = await generateRandomIdea(language, activeApiKey);
        setPendingIdeaRandomization(idea);
    } catch (error) {
        handleApiError(error);
    } finally {
        setIsRandomizingIdea(false);
    }
  };

  const applyIdeaRandomization = () => {
      if (pendingIdeaRandomization) {
          setFormState(prev => ({...prev, prompt: pendingIdeaRandomization}));
          setPendingIdeaRandomization(null);
          showToast(t.ui.ideaAppliedSuccess, 'success');
      }
  };
  const cancelIdeaRandomization = () => setPendingIdeaRandomization(null);

  const handleRandomizeNarrative = async () => {
      if (!activeApiKey) { openApiKeyModal(); return; }
      setIsRandomizingNarrative(true);
      try {
          let narrative;
          if (formState.prompt.trim()) {
              narrative = await generateNarrativeFromIdea(language, formState.prompt, activeApiKey);
          } else {
              narrative = await generateRandomNarrative(language, activeApiKey);
          }
          setFormState(prev => ({...prev, ...narrative}));
      } catch (error) {
          handleApiError(error);
      } finally {
          setIsRandomizingNarrative(false);
      }
  };

  const handleRandomizeStructure = async () => {
      if (!activeApiKey) { openApiKeyModal(); return; }
      const hasMainIdea = formState.prompt.trim() !== '';
      const hasStyle = formState.selectedGenre.length > 0 || formState.selectedMood.length > 0;
      if (!hasMainIdea && !hasStyle) {
          showToast(t.ui.structureSuggestionError, 'error');
          return;
      }
      setIsRandomizingStructure(true);
      try {
          const structure = await generateSongStructure(formState, language, activeApiKey);
          setFormState(prev => ({...prev, songStructure: structure}));
          showToast(t.ui.structureSuggestionSuccess, 'success');
      } catch (error) {
          handleApiError(error);
      } finally {
          setIsRandomizingStructure(false);
      }
  };

  const handleRandomizeStyle = async () => {
      if (!activeApiKey) { openApiKeyModal(); return; }
      if (!formState.prompt.trim() && !formState.coreTheme.trim()) {
          showToast(t.ui.styleSuggestionError, 'error');
          return;
      }
      setIsRandomizingStyle(true);
      try {
          const style = await generateStyleFromIdea(formState, language, activeApiKey);
          setFormState(prev => ({
              ...prev, 
              selectedGenre: style.genres, 
              selectedMood: style.moods, 
              selectedTempo: style.tempos, 
              selectedInstruments: style.instruments,
          }));
          showToast(t.ui.styleSuggestionSuccess, 'success');
      } catch (error) {
          handleApiError(error);
      } finally {
          setIsRandomizingStyle(false);
      }
  };

  const handleAnalyzeArtistStyle = async () => {
    if (!activeApiKey) { openApiKeyModal(); return; }
    if (!formState.inspiredByArtist.trim()) {
        showToast(t.ui.analyzeArtistError, 'error');
        return;
    }
    setIsAnalyzingArtistStyle(true);
    try {
        const styleSuggestion = await generateStyleFromArtist(formState.inspiredByArtist, language, activeApiKey);
        
        setFormState(prevState => ({
            ...prevState,
            selectedGenre: [...new Set([...prevState.selectedGenre, ...styleSuggestion.genres])],
            selectedMood: [...new Set([...prevState.selectedMood, ...styleSuggestion.moods])],
            selectedInstruments: [...new Set([...prevState.selectedInstruments, ...styleSuggestion.instruments])],
            selectedTempo: styleSuggestion.tempos.length > 0 ? [styleSuggestion.tempos[0]] : prevState.selectedTempo,
        }));

        showToast(t.ui.analyzeArtistSuccess, 'success');
        setActiveTab('style'); 
    } catch (error) {
        handleApiError(error);
    } finally {
        setIsAnalyzingArtistStyle(false);
    }
  };


  const handleRandomizeAll = async () => {
    if (!activeApiKey) { openApiKeyModal(); return; }
    setIsRandomizingAll(true);
    setPendingRandomization(null);
    try {
      const idea = await generateRandomIdea(language, activeApiKey);
      const tempFormStateForStyle = { ...formState, prompt: idea };
      const style = await generateStyleFromIdea(tempFormStateForStyle, language, activeApiKey);
      
      setPendingRandomization({
          prompt: idea,
          selectedGenre: style.genres,
          selectedMood: style.moods,
          selectedTempo: style.tempos,
          selectedInstruments: style.instruments,
      });

    } catch (error) {
        handleApiError(error);
    } finally {
        setIsRandomizingAll(false);
    }
  };

  const applyRandomization = () => {
    if (pendingRandomization) {
        setFormState(prev => ({ ...prev, ...pendingRandomization }));
        setPendingRandomization(null);
        showToast(t.ui.randomizationAppliedSuccess, 'success');
    }
  };
  const cancelRandomization = () => setPendingRandomization(null);

  const resetNarrative = () => {
      setFormState(prev => ({
          ...prev,
          coreTheme: '',
          story: '',
          keyEmotions: '',
          imagery: '',
      }));
  };

  const handleResetAll = () => {
      setFormState({
        ...initialFormState,
        selectedVocal: t.options.VOCALS[0],
        selectedModel: 'gemini-3-pro-preview',
        watermark: formState.watermark,
      });
      setSongData(null);
      setCurrentSongInputs(null);
      setIsResetConfirmOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleRemix = () => {
    if (currentSongInputs) {
        setFormState(currentSongInputs);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };


  return (
    <>
      <main id="main-container" className="min-h-screen w-full flex flex-col text-[var(--color-text-primary)] bg-[var(--color-bg)]">
          <header className="flex-shrink-0 flex justify-between items-center px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-panel)] z-30 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.4)] sticky top-0">
            {/* Add global SVG defs for gradients */}
            <svg width="0" height="0" className="absolute">
              <defs>
                <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#d946ef" />
                </linearGradient>
              </defs>
            </svg>

            <div className="flex items-center gap-3">
              <div 
                className="p-2.5 rounded-xl bg-[#09090b] border border-[#27272a] shadow-[0_0_15px_rgba(0,0,0,0.5)] cursor-pointer hover:scale-105 transition-transform group relative overflow-hidden" 
                onClick={handleRemix} 
                title={t.ui.remixButton}
              >
                  {/* Subtle glow behind icon */}
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-fuchsia-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <Music4Icon 
                    className="w-6 h-6 relative z-10" 
                    style={{ stroke: 'url(#logo-gradient)' }} 
                  />
              </div>
              <div>
                  {/* FORCE TEXT COLOR OVERRIDE FOR LIGHT MODE VISIBILITY */}
                  <h1 
                    className="text-lg font-extrabold tracking-tight"
                    style={{ color: theme === 'light' ? '#000000' : '#ffffff' }}
                  >
                    {t.ui.appTitle}
                  </h1>
                  <p 
                    className="text-[10px] font-mono tracking-widest uppercase"
                    style={{ color: theme === 'light' ? '#666666' : '#a1a1aa' }}
                  >
                      AI Studio v1.0
                  </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
               <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-[var(--color-border)] transition-colors text-[var(--color-text-secondary)]" aria-label={t.ui.toggleThemeButton}>
                {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
              </button>
              <button onClick={() => setIsHistoryModalOpen(true)} className="p-2 rounded-full hover:bg-[var(--color-border)] transition-colors text-[var(--color-text-secondary)]" title={t.ui.historyButton}>
                <HistoryIcon className="w-5 h-5" />
              </button>
            </div>
          </header>

          <div className="flex-grow flex flex-col max-w-4xl mx-auto w-full p-4 sm:p-6 gap-8 pb-20">
                <InputForm
                    formState={formState}
                    setFormState={setFormState}
                    onRandomizeMainIdea={handleRandomizeMainIdea}
                    isRandomizingIdea={isRandomizingIdea}
                    pendingIdeaRandomization={pendingIdeaRandomization}
                    onApplyIdeaRandomization={applyIdeaRandomization}
                    onCancelIdeaRandomization={cancelIdeaRandomization}
                    onRandomizeNarrative={handleRandomizeNarrative}
                    isRandomizingNarrative={isRandomizingNarrative}
                    onRandomizeStructure={handleRandomizeStructure}
                    isRandomizingStructure={isRandomizingStructure}
                    onRandomizeStyle={handleRandomizeStyle}
                    isRandomizingStyle={isRandomizingStyle}
                    onAnalyzeArtistStyle={handleAnalyzeArtistStyle}
                    isAnalyzingArtistStyle={isAnalyzingArtistStyle}
                    onRandomizeAll={handleRandomizeAll}
                    isRandomizingAll={isRandomizingAll}
                    pendingRandomization={pendingRandomization}
                    onApplyRandomization={applyRandomization}
                    onCancelRandomization={cancelRandomization}
                    onResetNarrative={resetNarrative}
                    onResetAll={() => setIsResetConfirmOpen(true)}
                    onGenerateSong={handleGenerateSong}
                    isLoading={isLoading}
                    onLanguageChange={setLanguage}
                    t={t}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    onOpenApiKeyModal={openApiKeyModal}
                />

                {/* Result Section - Always present but conditionally renders content */}
                <div ref={resultsRef} className="w-full transition-all duration-500">
                     {(songData || isLoading) && (
                        <div className="animate-fade-in pt-8 border-t border-[var(--color-border)]">
                             <div className="flex items-center gap-2 mb-4">
                                <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-tertiary)]">Output</span>
                                <div className="h-px flex-grow bg-[var(--color-border)]"></div>
                             </div>
                             <SongDisplay 
                                songData={songData} 
                                isLoading={isLoading} 
                                watermark={formState.watermark} 
                                songStructure={formState.songStructure}
                                onRemix={() => window.scrollTo({ top: 0, behavior: 'smooth' })} // Scroll to top for editor
                                inputs={currentSongInputs}
                            />
                        </div>
                     )}
                </div>
          </div>
      </main>
      <ApiKeyModal />
      <BugReportModal />
      <FloatingBugButton />
      <Suspense fallback={null}>
        {isHistoryModalOpen && (
          <HistoryModal
            isOpen={isHistoryModalOpen}
            onClose={() => setIsHistoryModalOpen(false)}
            history={history}
            onRestore={restoreFromHistory}
            onDelete={deleteHistoryItem}
            onClearAll={clearHistory}
            t={t.ui}
          />
        )}
      </Suspense>
      <Suspense fallback={null}>
          {isSupportModalOpen && (
              <SupportModal
                  isOpen={isSupportModalOpen}
                  onClose={handleCloseSupportModal}
              />
          )}
      </Suspense>
      <ToastContainer />
      <WelcomeModal />
      {isResetConfirmOpen && (
        <ConfirmationDialog
            title={t.ui.confirmResetAllTitle}
            message={t.ui.confirmResetAllMessage}
            onConfirm={handleResetAll}
            onCancel={() => setIsResetConfirmOpen(false)}
            t={t.ui}
        />
      )}
       {rateLimitError && (
          <RateLimitModal
              message={rateLimitError}
              onClose={() => setRateLimitError(null)}
              t={t.ui}
          />
      )}
    </>
  );
};

export default App;
