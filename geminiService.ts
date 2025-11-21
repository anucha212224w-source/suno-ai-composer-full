

import { GoogleGenAI, Type, Modality } from "@google/genai";
import { type Language, translations } from "./translations";
import { getProcessedStructure } from "./utils";
import type { FormState } from './types';

export class RateLimitError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'RateLimitError';
    }
}

export interface NarrativeConcept {
    coreTheme: string;
    story: string;
    keyEmotions: string;
    imagery: string;
}

/**
 * A centralized error handler for all Gemini API calls.
 * It parses the error and returns a user-friendly, translated message.
 * @param error The unknown error object from a catch block.
 * @param language The current language for translation.
 * @returns An Error object with a user-friendly message.
 */
const handleGeminiError = (error: unknown, language: Language): Error => {
    const t = translations[language].ui;
    let displayMessage = t.errorUnknown;
    let isRateLimitError = false;

    console.error("Gemini API Error:", error);

    if (error instanceof TypeError || (error instanceof Error && error.name === 'TypeError')) {
         displayMessage = t.errorNetwork; // Treat TypeError as network error (fetch failed)
    } else if (error instanceof Error) {
        const errorMessage = error.message;
        const lowerErrorMessage = errorMessage.toLowerCase();

        if (lowerErrorMessage.includes('api key not valid') || lowerErrorMessage.includes('api key') || lowerErrorMessage.includes('apikey')) {
            displayMessage = t.apiKeyInvalidError;
        } else if (lowerErrorMessage.includes('iso-8859-1') || lowerErrorMessage.includes('headers')) {
            // Handle "Failed to execute 'append' on 'Headers'" error typically caused by non-ASCII chars in API Key
            displayMessage = t.apiKeyInvalidError;
        } else if (lowerErrorMessage.includes('model is overloaded')) {
            displayMessage = t.errorModelOverloaded;
        } else if (lowerErrorMessage.includes('network') || lowerErrorMessage.includes('fetch') || lowerErrorMessage.includes('xhr') || lowerErrorMessage.includes('rpc')) {
            displayMessage = t.errorNetwork;
        } else if (lowerErrorMessage.includes('resource_exhausted') || lowerErrorMessage.includes('quota') || lowerErrorMessage.includes('429')) {
            displayMessage = t.errorRateLimit;
            isRateLimitError = true;
        } else {
             // If no simple match, try to parse as JSON for more details
            try {
                const jsonStart = errorMessage.indexOf('{');
                if (jsonStart !== -1) {
                    const jsonString = errorMessage.substring(jsonStart);
                    const parsedError = JSON.parse(jsonString);
                    const nestedError = parsedError.error || parsedError;

                    if (nestedError.status === 'RESOURCE_EXHAUSTED') {
                        displayMessage = t.errorRateLimit;
                        isRateLimitError = true;
                    } else if (nestedError.message) {
                        displayMessage = nestedError.message;
                    } else {
                        displayMessage = errorMessage;
                    }
                } else {
                     displayMessage = errorMessage;
                }
            } catch (e) {
                displayMessage = errorMessage;
            }
        }
    }
    
    if (isRateLimitError) {
        return new RateLimitError(displayMessage);
    }
    return new Error(displayMessage);
};

// --- Sanitization Functions ---

/**
 * Aggressively removes lines that look like Romanization/Phonetic guides.
 * e.g., "(Chan rak ter)" or "(Wo ai ni)"
 * Criteria: Line is wrapped in parens, contains mostly latin characters, 
 * and isn't a standard structural tag like [Verse] or (Chorus).
 * 
 * UPDATED: Now allows instrumental/performance tags in parentheses even if long.
 * UPDATED: Preserves [End], [Break], etc., and allows backing vocals with exclamation marks.
 */
const cleanRomanization = (text: string): string => {
    const lines = text.split('\n');
    const cleanedLines = lines.filter(line => {
        const trimmed = line.trim();
        // Check if line is wrapped in parens
        if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
            const content = trimmed.slice(1, -1).toLowerCase();
            
            // Allow musical instructions + END tag + Dynamic tags
            const isMusicalInstruction = /^(chorus|verse|intro|outro|solo|bridge|hook|pre-chorus|instrumental|fast flow|rap|guitar|drum|bass|piano|synth|ad-lib|spoken|background|music|fade|build|drop|break|riff|end)/i.test(content);
            if (isMusicalInstruction) return true;

            // Allow backing vocals/shouts (usually have exclamation marks or question marks)
            if (content.includes('!') || content.includes('?')) return true;

            // If it's not a musical instruction, check if it looks like Romanization
            // Romanization usually has spaces and looks like a sentence: (chan rak ter)
            // We assume that if it's NOT a musical instruction and has spaces, it MIGHT be Romanization.
            // However, user wants things like "(Funky Guitar Riff)" which has spaces.
            // So we check for specific musical keywords within the content.
            const musicalKeywords = ['guitar', 'drum', 'bass', 'piano', 'synth', 'solo', 'riff', 'instrumental', 'voice', 'vocal', 'sound', 'beat', 'music', 'fade', 'end', 'start', 'tempo', 'slow', 'fast', 'build', 'drop'];
            const hasMusicalKeyword = musicalKeywords.some(keyword => content.includes(keyword));
            
            if (hasMusicalKeyword) return true;

            // If no musical keyword and looks like a sentence, assume it's phonetic text (Romanization) and kill it.
            const hasSpaces = content.includes(' ');
            if (hasSpaces && content.length > 5) {
                 return false; 
            }
        }
        return true;
    });
    return cleanedLines.join('\n');
};


const translateTagsToEnglish = async (tags: string[], language: Language, apiKey: string): Promise<string[]> => {
    if (tags.length === 0) {
        return [];
    }
    if (language === 'en') {
        return tags;
    }
    
    const languageMap = {
        th: 'Thai',
        zh: 'Chinese',
        ja: 'Japanese',
        ko: 'Korean',
        en: 'English'
    };
    const sourceLanguage = languageMap[language];

    const prompt = `Translate the following music style tags from ${sourceLanguage} to English. Provide the closest, most common English equivalent for each tag. For culturally specific genres (like 'ลูกทุ่ง'), transliterate them phonetically (e.g., 'Luk Thung'). Return ONLY the comma-separated list of the translated English terms, with no extra text or explanations.
Tags: ${tags.join(', ')}`;
    
    try {
        const ai = new GoogleGenAI({ apiKey });
        // Translation is a simple task, keep it fast/cheap with Flash
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', 
            contents: { parts: [{ text: prompt }] },
            config: { temperature: 0 }
        });

        const translatedText = response.text;
        if (translatedText) {
            return translatedText.split(',').map(tag => tag.trim()).filter(Boolean);
        }
        
        const candidate = response.candidates?.[0];
        if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
             console.warn(`Tag translation may have failed. Reason: ${candidate.finishReason}`);
        }
        return tags; 
    } catch (error) {
        throw handleGeminiError(error, language);
    }
};

const translateTextToEnglish = async (text: string, language: Language, apiKey: string): Promise<string> => {
    if (!text || language === 'en') {
        return text;
    }

    const languageMap: { [key in Language]?: string } = { th: 'Thai', zh: 'Chinese', ja: 'Japanese', ko: 'Korean' };
    const sourceLanguage = languageMap[language];
    if (!sourceLanguage) return text;

    const prompt = `Translate the following text from ${sourceLanguage} to English. Return ONLY the translated English text, with no extra formatting, labels, or explanations.\n\nText: "${text}"`;
    
    try {
        const ai = new GoogleGenAI({ apiKey });
        // Translation is a simple task, keep it fast/cheap with Flash
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: prompt }] },
            config: { temperature: 0 }
        });
        
        const translatedText = response.text.trim();
         if (!translatedText) {
            const candidate = response.candidates?.[0];
            if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
                console.warn(`Text translation may have failed. Reason: ${candidate.finishReason}`);
            }
        }
        return translatedText || text; // Fallback to original text if translation is empty
    } catch (error) {
        throw handleGeminiError(error, language);
    }
};


export interface GenerateSongParams {
  userPrompt: string;
  vocalGender: string;
  instruments: string[];
  genres: string[];
  moods: string[];
  tempos: string[];
  inspiredBySong?: string;
  inspiredByArtist?: string;
  maleRole?: string;
  femaleRole?: string;
  songStructure?: string[];
  sunoAiMode: 'auto' | 'manual';
  weirdness: number;
  styleInfluence: number;
  excludedWords?: string;
  model: string;
  language: Language;
}

export interface GenerateAlbumArtParams {
    prompt: string;
    noText: boolean;
}

const getMasterPrompt = (params: Omit<GenerateSongParams, 'model' | 'genres' | 'moods' | 'tempos'>, style: string): string => {
  const { userPrompt, vocalGender, instruments, inspiredBySong, inspiredByArtist, maleRole, femaleRole, songStructure, sunoAiMode, weirdness, styleInfluence, excludedWords, language } = params;
  const p = translations[language].prompts;
  const t = translations[language];

  // 1. Build dynamic instruction blocks
  const isRap = style.toLowerCase().includes('rap') || style.toLowerCase().includes('hip-hop');
  const rapInstruction = isRap ? p.rap_guidelines_title + p.rap_guidelines_content : '';
  
  const isLukThung = style.toLowerCase().includes('ลูกทุ่ง') || style.toLowerCase().includes('หมอลำ') || style.toLowerCase().includes('luk thung') || style.toLowerCase().includes('mor lam');
  const lukThungInstruction = isLukThung ? p.lukthung_guidelines_title + p.lukthung_guidelines_content : '';

  const autoParamInstruction = sunoAiMode === 'auto' ? p.suno_auto_rules_title + p.suno_auto_rules_content : '';

  let instrumentInstruction = '';
  let instrumentLyricConstraint = '';
  if (instruments.length > 0) {
    const instrumentList = instruments.join(', ');
    instrumentInstruction = p.instrument_focus_title + p.instrument_focus_content.replace('{instrumentList}', instrumentList);
    instrumentLyricConstraint = p.instrument_lyric_constraint.replace('{instrumentList}', instrumentList);
  }

  let exclusionInstruction = '';
  if (excludedWords && excludedWords.trim()) {
      exclusionInstruction = p.exclusion_rule_title + p.exclusion_rule_content.replace('{excludedWordsList}', excludedWords.trim());
  }

  // The duet option is always the third item in the VOCALS array for all languages.
  const isDuet = vocalGender === t.options.VOCALS[2];
  const duetInstruction = isDuet 
    ? p.duet_instructions_title + p.duet_instructions_content
        .replace('{maleRole}', maleRole || p.duet_default_male)
        .replace('{femaleRole}', femaleRole || p.duet_default_female)
    : '';
  
  let inspirationInstruction = '';
  if (inspiredBySong || inspiredByArtist) {
    inspirationInstruction += `\n\n${p.inspiration_guidelines_title}\n`;
    if (inspiredBySong) inspirationInstruction += p.inspiration_song.replace('{song}', inspiredBySong) + '\n';
    if (inspiredByArtist) inspirationInstruction += p.inspiration_artist.replace('{artist}', inspiredByArtist) + '\n';
  }

  const structureRule = (songStructure && songStructure.length > 0)
    ? p.structure_rule_title + p.structure_rule_content.replace('{structure}', songStructure.join(' -> '))
    : '';

  // Check for Fast Flow in structure
  const hasFastFlow = songStructure && songStructure.some(part => part.toLowerCase().includes('fast') || part.toLowerCase().includes('flow') || part.toLowerCase().includes('chopper'));
  const fastFlowInstruction = hasFastFlow ? p.fast_flow_instruction : '';

  // 2. Build the structure body
  const getStructurePlaceholder = (part: string) => {
      const lowerPart = part.toLowerCase();
      const instrumentalKeywords = t.options.instrumental_keywords;
      const isInstrumental = instrumentalKeywords.some(keyword => lowerPart.includes(keyword));

      if (isInstrumental) {
          if (lowerPart.includes('intro') || lowerPart.includes(t.options.instrumental_keywords[0])) return p.placeholder_intro; // Assumes 'intro' is the first keyword
          if (lowerPart.includes('solo') || lowerPart.includes(t.options.instrumental_keywords[1])) return p.placeholder_solo; // Assumes 'solo' is the second
          if (lowerPart.includes('outro') || lowerPart.includes(t.options.instrumental_keywords[2])) return p.placeholder_outro; // Assumes 'outro' is the third
          return p.placeholder_instrumental;
      }
      return p.placeholder_lyrics;
  };
  
  const structureBody = (() => {
      if (!songStructure || songStructure.length === 0) {
          return p.default_structure
            .replace(/{placeholder_intro}/g, getStructurePlaceholder('[Intro]'))
            .replace(/{placeholder_solo}/g, getStructurePlaceholder('[Solo]'))
            .replace(/{placeholder_outro}/g, getStructurePlaceholder('[Outro]'));
      }
      const processedParts = getProcessedStructure(songStructure);
      return processedParts.map(part => `${part}\n${getStructurePlaceholder(part)}`).join('\n\n');
  })();

  // 3. Build Suno parameter lines
  const weirdnessLine = sunoAiMode === 'manual'
    ? `${p.weirdnessLabel} ${weirdness}`
    : `${p.weirdnessLabel} ${p.suno_auto_weirdness_placeholder}`;
  const styleInfluenceLine = sunoAiMode === 'manual'
    ? `${p.styleInfluenceLabel} ${styleInfluence}`
    : `${p.styleInfluenceLabel} ${p.suno_auto_style_influence_placeholder}`;

  // 4. Assemble the final master prompt
  return p.master_template
    .replace('{final_goal}', p.final_goal)
    .replace('{label_song_title}', p.label_song_title)
    .replace('{placeholder_song_title}', p.placeholder_song_title)
    .replace('{label_style}', p.label_style)
    .replace('{style}', style)
    .replace('{label_vocal_gender}', p.label_vocal_gender)
    .replace('{vocalGender}', vocalGender)
    .replace('{weirdnessLabel} {suno_auto_weirdness_placeholder}', weirdnessLine)
    .replace('{styleInfluenceLabel} {suno_auto_style_influence_placeholder}', styleInfluenceLine)
    .replace('{label_lyrics}', p.label_lyrics)
    .replace('{structureBody}', structureBody)
    .replace('{golden_rules_title}', p.golden_rules_title)
    .replace('{rule_emotional_core}', p.rule_emotional_core)
    .replace('{rule_narrative_flow}', p.rule_narrative_flow)
    .replace('{rule_lyrical_craft}', p.rule_lyrical_craft)
    .replace('{rule_authentic_voice}', p.rule_authentic_voice)
    .replace('{rule_language}', p.rule_language)
    .replace('{rule_rhythm}', p.rule_rhythm)
    .replace('{rule_repetition}', p.rule_repetition)
    .replace('{rule_description_language}', p.rule_description_language)
    .replace('{rule_technical_lyricism_title}', p.rule_technical_lyricism_title)
    .replace('{rule_technical_lyricism_content}', p.rule_technical_lyricism_content)
    .replace('{instrumentLyricConstraint}', instrumentLyricConstraint)
    .replace('{exclusionInstruction}', exclusionInstruction)
    .replace('{rapInstruction}', rapInstruction)
    .replace('{lukThungInstruction}', lukThungInstruction)
    .replace('{autoParamInstruction}', autoParamInstruction)
    .replace('{analysis_guide_title}', p.analysis_guide_title)
    .replace('{analysis_guide_content}', p.analysis_guide_content)
    .replace('{instrumentInstruction}', instrumentInstruction)
    .replace('{duetInstruction}', duetInstruction)
    .replace('{inspirationInstruction}', inspirationInstruction)
    .replace('{structureRule}', structureRule)
    .replace('{fastFlowInstruction}', fastFlowInstruction)
    .replace('{command_instruction}', p.command_instruction)
    .replace('{user_request_header}', p.user_request_header)
    .replace('{userPrompt}', userPrompt);
}

export const generateSong = async (params: GenerateSongParams, apiKey: string): Promise<string> => {
  // Combine all style-related tags into one array for translation.
  // This ensures the final 'Style:' metadata line is in English for Suno AI compatibility,
  // even for culturally specific genres like 'ลูกทุ่ง'.
  const allTagsToTranslate = [
    params.vocalGender, // Include vocal gender in translation/style tags for Suno optimization
    ...params.genres,
    ...params.moods,
    ...params.tempos,
    ...params.instruments,
  ].filter(Boolean);
  
  // Translate all tags to English.
  const translatedTags = await translateTagsToEnglish(allTagsToTranslate, params.language, apiKey);
  
  // The final style string is now entirely in English.
  const finalStyle = [...new Set(translatedTags)].join(', ');
  
  const fullPrompt = getMasterPrompt(params, finalStyle);

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: params.model, // Uses the selected model (default 3 Pro)
      contents: { parts: [{ text: fullPrompt }] },
    });
    
    let songText = response.text;

    if (!songText) {
        const candidate = response.candidates?.[0];
        if (candidate?.finishReason === 'SAFETY') {
            const safetyMessage = "The response was blocked for safety reasons. This can happen if the prompt contains sensitive topics. Please adjust your prompt and try again.";
            console.warn("Safety ratings:", candidate.safetyRatings);
            throw new Error(safetyMessage);
        }
        
        if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
            throw new Error(`The AI model stopped generating for an unexpected reason: ${candidate.finishReason}. Please try your request again.`);
        }

        throw new Error("The AI model returned an empty response. This might be a temporary issue, please try again.");
    }
    
    // Clean up Romanization/Phonetic guides before returning
    songText = cleanRomanization(songText);

    return songText;

  } catch (error) {
    throw handleGeminiError(error, params.language);
  }
};

const getRevisionPrompt = (originalSong: string, revisionRequest: string, language: Language): string => {
    const p = translations[language].prompts;
    return `You are a master lyricist and song editor. Your task is to revise an existing song based on specific user feedback.

# CRITICAL RULES
1.  **Preserve Metadata:** You MUST preserve the original metadata (Song Title, Style, Vocal Gender, Weirdness, Style Influence) exactly as it is, unless the user's feedback explicitly asks to change it.
2.  **Targeted Revisions:** Only modify the lyrics sections (e.g., [Verse], [Chorus]) to incorporate the user's feedback. Do not rewrite sections that were not mentioned.
3.  **Maintain Language:** The language of the lyrics MUST remain the same as the original song's language.
4.  **Complete Output:** Return the FULL, complete song text in the original, correct format. Do not provide only the changed parts or any extra commentary.
5.  **NO TRANSLATIONS/NOTES:** Do NOT include translations, romanization (karaoke), or explanations in the lyrics. Output ONLY what is to be sung.

---

# Original Song
${originalSong}

---

# User's Revision Request
"${revisionRequest}"

---

# Command
Now, generate the revised song based on the user's request, following all rules strictly.`;
};


export const reviseSong = async (originalSong: string, revisionRequest: string, model: string, language: Language, apiKey: string): Promise<string> => {
    const prompt = getRevisionPrompt(originalSong, revisionRequest, language);
    try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: model, // Use the same model as the original generation for consistency
            contents: { parts: [{ text: prompt }] },
        });

        let revisedSongText = response.text;
        if (!revisedSongText) {
            const candidate = response.candidates?.[0];
            if (candidate?.finishReason === 'SAFETY') {
                throw new Error("The revision was blocked for safety reasons. Please adjust your request.");
            }
             if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
                throw new Error(`The AI model stopped generating for an unexpected reason: ${candidate.finishReason}. Please try again.`);
            }
            throw new Error("The AI model returned an empty response during revision.");
        }
        
        // Clean up Romanization/Phonetic guides before returning
        revisedSongText = cleanRomanization(revisedSongText);

        return revisedSongText;
    } catch (error) {
        throw handleGeminiError(error, language);
    }
};


export const generateImagePrompt = async (songData: string, inputs: FormState, language: Language, apiKey: string): Promise<string> => {
    const englishPrompt = await translateTextToEnglish(inputs.prompt || inputs.coreTheme, language, apiKey);
    const englishGenres = await translateTagsToEnglish(inputs.selectedGenre, language, apiKey);
    const englishMoods = await translateTagsToEnglish(inputs.selectedMood, language, apiKey);
    const englishImagery = await translateTextToEnglish(inputs.imagery, language, apiKey);

    const prompt = `You are a professional art director specializing in creating prompts for AI image generators (like Midjourney, DALL-E 3). Your task is to generate a single, highly-detailed, and evocative prompt to create album cover art for a song.

    **Song Analysis:**
    - **Concept:** ${englishPrompt}
    - **Genre/Style:** ${englishGenres.join(', ')}
    - **Mood:** ${englishMoods.join(', ')}
    - **Key Imagery/Symbols:** ${englishImagery || 'Not specified'}

    **Instructions for Prompt Generation:**
    1.  **Core Principle: Emotional Realism.** The prompt must evoke a realistic, cinematic, and emotionally resonant scene that captures the song's core feeling. Avoid fantastical, surreal, or abstract elements. Focus on tangible, relatable imagery that tells a human story.
    2.  **Mandatory Character Trait:** If any human characters are described, they **MUST** be explicitly described as being of **Thai ethnicity** (e.g., "a young Thai woman looking out a rain-streaked bus window," "a thoughtful Thai man in his 30s sitting in a dimly lit coffee shop"). This is a non-negotiable requirement.
    3.  **Format:** Create a single, continuous paragraph of text. Do not use line breaks.
    4.  **Content:** The prompt must be a rich, descriptive paragraph. Blend the song's concept, mood, and imagery into a coherent visual scene. Describe the subject, setting, composition, lighting, and color palette.
    5.  **Style Keywords:** Incorporate artistic style keywords (e.g., "photorealistic, cinematic, dramatic lighting, 35mm film photography").
    6.  **Technical Details:** Add technical terms for the AI, such as lighting descriptions ("cinematic lighting, soft volumetric light, moody shadows"), camera details ("dynamic angle, close-up shot, 85mm lens"), and quality specifiers ("hyperdetailed, intricate details, 8k, photorealistic").
    7.  **Language:** The entire output prompt MUST be in English.
    8.  **Output:** Return ONLY the generated prompt text, with no additional commentary, labels, or explanations.

    **Example Output:**
    "cinematic photo, a young Thai woman sitting alone in a vintage cafe, looking out a rain-streaked window at the bustling Bangkok city lights, a sense of bittersweet nostalgia on her face, soft moody lighting, shallow depth of field, 35mm film grain, hyperrealistic, intricate details, 8k --ar 1:1"

    Now, generate the prompt based on the provided song analysis.`;

    try {
        const ai = new GoogleGenAI({ apiKey });
        // Use 2.5 Flash for prompt generation as it's efficient and capable enough
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: prompt }] },
            config: { temperature: 0.8 }
        });
        return response.text.trim();
    } catch (error) {
        throw handleGeminiError(error, language);
    }
};

const createDynamicRegexForService = (getLabel: (t: (typeof translations)[keyof typeof translations]) => string): RegExp => {
    // Escape special characters and join labels
    const labels = Object.values(translations).map(t => getLabel(t).slice(0, -1).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    // Robust regex to handle optional Markdown asterisks around labels (e.g., **Style:** or **Style**: )
    return new RegExp(`^\\s*[\\*]*(${labels})[\\*]*\\s*:\\s*(.*)`, 'm');
};

export const generateVideoPrompt = async (songData: string, inputs: FormState, language: Language, apiKey: string): Promise<string> => {
    const TITLE_REGEX = createDynamicRegexForService(t => t.prompts.label_song_title);
    const songTitleMatch = songData.match(TITLE_REGEX);
    const title = songTitleMatch ? songTitleMatch[2].replace(/\*/g, '').trim() : "Untitled";

    const story = inputs.story || inputs.prompt || inputs.coreTheme;
    
    // Translate key elements to English for the prompt
    const englishStory = await translateTextToEnglish(story, language, apiKey);
    const englishGenres = await translateTagsToEnglish(inputs.selectedGenre, language, apiKey);
    const englishMoods = await translateTagsToEnglish(inputs.selectedMood, language, apiKey);
    const englishImagery = await translateTextToEnglish(inputs.imagery, language, apiKey);
    const englishTitle = await translateTextToEnglish(title, language, apiKey);

    const prompt = `You are a visionary music video director. Your task is to create a detailed, scene-by-scene concept for a music video based on the provided song analysis.

    **Song Analysis:**
    - **Title:** ${englishTitle}
    - **Story/Concept:** ${englishStory}
    - **Genre/Style:** ${englishGenres.join(', ')}
    - **Mood:** ${englishMoods.join(', ')}
    - **Key Imagery/Symbols:** ${englishImagery || 'Not specified'}

    **Instructions for Video Concept Generation:**
    1.  **Core Principle: Grounded Storytelling.** The concept must be grounded in reality, creating a believable and emotionally impactful narrative that connects with the song's lyrics and mood. Avoid overly abstract or fantastical concepts.
    2.  **Mandatory Character Trait:** All characters featured in the video concept **MUST** be explicitly described as being of **Thai ethnicity**. This is a non-negotiable requirement.
    3.  **Overall Vision:** Start with a brief, powerful paragraph summarizing the video's concept, visual style, and emotional arc.
    4.  **Visual Style:** Describe the overall aesthetic. Include details on color grading (e.g., "Saturated, vibrant colors of a Thai market," "desaturated, gritty look of Bangkok at night"), lighting ("high contrast, dramatic shadows," "soft, dreamlike diffusion of morning light"), and overall feel (e.g., "cinematic realism," "raw and documentary-style").
    5.  **Scene-by-Scene Breakdown:** Write short, descriptive paragraphs for at least 3-4 key scenes (e.g., Verse 1, Chorus, Bridge, Outro). For each scene, describe:
        -   **Characters & Action:** What are the Thai characters doing? What is their story?
        -   **Location:** Where does it take place? Use specific, evocative Thai locations (e.g., "a quiet soi in Chiang Mai," "on a Chao Phraya River ferry," "a bustling night market").
        -   **Cinematography:** Describe specific shots (e.g., "extreme close-up on the Thai protagonist's eyes," "sweeping drone shot over rice paddies," "handheld, shaky camera following the character through a crowd").
    6.  **Editing & Effects:** Suggest an editing style (e.g., "fast-paced cuts synchronized to the beat," "long, meditative takes," "use of slow-motion and match cuts"). Mention any key visual effects (e.g., "light leaks, film grain").
    7.  **Language:** The entire output MUST be in English for maximum compatibility with video creation tools and teams.
    8.  **Output:** Return ONLY the generated video concept, formatted with clear headings for each section (e.g., **Overall Vision**, **Visual Style**, **Scene 1: Verse**, etc.). Do not include any other commentary.

    Generate the music video concept now.`;

    try {
        const ai = new GoogleGenAI({ apiKey });
        // Upgrade to 3 Pro for high-quality creative video concepts
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: { parts: [{ text: prompt }] },
            config: { temperature: 0.7 }
        });
        return response.text.trim();
    } catch (error) {
        throw handleGeminiError(error, language);
    }
};

const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const cleanLyricsForTTS = (songData: string, t: (typeof translations)[keyof typeof translations]): string => {
    const lyricsHeaderRegex = createDynamicRegexForService(trans => trans.prompts.label_lyrics);
    const lyricsStartIndex = songData.search(lyricsHeaderRegex);
    if (lyricsStartIndex === -1) return '';

    let lyricsText = songData.substring(lyricsStartIndex);
    lyricsText = lyricsText.replace(lyricsHeaderRegex, '');
    lyricsText = lyricsText.replace(/\[.*?\]/g, '\n');
    
    const isDuet = songData.includes(t.options.VOCALS[2]);
    if (isDuet) {
        const maleTag = `(${t.options.VOCALS[0]}):`;
        const femaleTag = `(${t.options.VOCALS[1]}):`;
        lyricsText = lyricsText.replace(new RegExp(escapeRegExp(maleTag), 'g'), 'Male:');
        lyricsText = lyricsText.replace(new RegExp(escapeRegExp(femaleTag), 'g'), 'Female:');
    } else {
        lyricsText = lyricsText.replace(/\(.*?\):\s*/g, '');
    }

    lyricsText = lyricsText.replace(/\(instrumental.*?\)/gi, '');
    lyricsText = lyricsText.replace(/\(.*?solo.*?\)/gi, '');
    lyricsText = lyricsText.replace(/\(fade.*?\)/gi, '');

    return lyricsText.replace(/\n\s*\n/g, '\n').trim();
};

export const generateVocalPreview = async (songData: string, language: Language, apiKey: string): Promise<string> => {
    const t = translations[language];
    const lyrics = cleanLyricsForTTS(songData, t);

    if (!lyrics) {
        throw new Error("No lyrics found to generate audio preview.");
    }
    
    const vocalGenderLine = songData.split('\n').find(line => line.startsWith(t.prompts.label_vocal_gender));
    const isDuet = vocalGenderLine?.includes(t.options.VOCALS[2]);
    const isMale = vocalGenderLine?.includes(t.options.VOCALS[0]);

    let speechConfig: any;

    if (isDuet) {
        speechConfig = {
            multiSpeakerVoiceConfig: {
                speakerVoiceConfigs: [
                    { speaker: 'Male', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
                    { speaker: 'Female', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } }
                ]
            }
        };
    } else {
        speechConfig = {
            voiceConfig: {
                prebuiltVoiceConfig: { voiceName: isMale ? 'Puck' : 'Kore' }
            }
        };
    }

    try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: { parts: [{ text: lyrics }] },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig,
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("AI did not return audio data.");
        }
        return base64Audio;
    } catch (error) {
        throw handleGeminiError(error, language);
    }
};


export const generateRandomIdea = async (language: Language, apiKey: string): Promise<string> => {
    const langName = translations[language].languageName;
    const prompt = `As an acclaimed A&R executive with a golden ear for hits, pitch a single, modern, and commercially viable song concept in ${langName}. The idea must feel fresh, culturally relevant, and tap into a genuine human emotion. Present it as a high-concept, one-sentence pitch. Return ONLY the pitch, with no extra text, labels, or quotation marks.`;

    try {
        const ai = new GoogleGenAI({ apiKey });
        // Use 3 Pro for better creativity
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: { parts: [{ text: prompt }] },
            config: { temperature: 1.0 }
        });
        return response.text.trim();
    } catch (error) {
        throw handleGeminiError(error, language);
    }
};

export const generateRandomNarrative = async (language: Language, apiKey: string): Promise<NarrativeConcept> => {
    const langName = translations[language].languageName;
    const prompt = `You are an elite narrative designer for a top-tier record label. Your task is to generate a complete, artistically profound, and commercially appealing narrative blueprint for a song in ${langName}. The concept must be modern, emotionally intelligent, and contain a unique twist or perspective. Ensure all fields are filled with vivid, interconnected ideas.`;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            coreTheme: { type: Type.STRING, description: `The central, universal human truth the song explores in ${langName}. Make it concise and powerful.` },
            story: { type: Type.STRING, description: `A specific, cinematic scenario or moment in time that illustrates the theme in ${langName}.` },
            keyEmotions: { type: Type.STRING, description: `A sophisticated blend of primary and secondary emotions the listener should feel, in ${langName}.` },
            imagery: { type: Type.STRING, description: `A list of striking, symbolic visual metaphors that enhance the story and theme in ${langName}.` },
        },
        required: ['coreTheme', 'story', 'keyEmotions', 'imagery'],
    };

    try {
        const ai = new GoogleGenAI({ apiKey });
        // Use 3 Pro for deep narrative generation
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: { parts: [{ text: prompt }] },
            config: {
                temperature: 1.0,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });
        
        const narrative = JSON.parse(response.text);
        return narrative;
    } catch (error) {
        throw handleGeminiError(error, language);
    }
};

export const generateNarrativeFromIdea = async (language: Language, mainIdea: string, apiKey: string): Promise<NarrativeConcept> => {
    const langName = translations[language].languageName;
    const prompt = `As an elite narrative designer, take the following user-provided song idea and expand it into a complete, artistically profound, and commercially appealing narrative blueprint in ${langName}. Ensure the generated blueprint is directly inspired by and consistent with the user's idea. Fill all fields with vivid, interconnected concepts.
User Idea: "${mainIdea}"`;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            coreTheme: { type: Type.STRING, description: `The central, universal human truth the song explores in ${langName}, derived from the user's idea.` },
            story: { type: Type.STRING, description: `A specific, cinematic scenario or moment in time that illustrates the theme in ${langName}, based on the user's idea.` },
            keyEmotions: { type: Type.STRING, description: `A sophisticated blend of primary and secondary emotions the listener should feel, in ${langName}, based on the user's idea.` },
            imagery: { type: Type.STRING, description: `A list of striking, symbolic visual metaphors that enhance the story and theme in ${langName}, based on the user's idea.` },
        },
        required: ['coreTheme', 'story', 'keyEmotions', 'imagery'],
    };

    try {
        const ai = new GoogleGenAI({ apiKey });
        // Use 3 Pro for complex narrative expansion
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: { parts: [{ text: prompt }] },
            config: {
                temperature: 0.7,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });
        
        const narrative = JSON.parse(response.text);
        return narrative;
    } catch (error) {
        throw handleGeminiError(error, language);
    }
};

export interface StyleSuggestion {
    genres: string[];
    moods: string[];
    tempos: string[];
    instruments: string[];
}

export const generateStyleFromArtist = async (artistName: string, language: Language, apiKey: string): Promise<StyleSuggestion> => {
    const langName = translations[language].languageName;
    const t = translations[language].options;
    const prompt = `You are a world-class musicologist. Analyze the musical style of the artist "${artistName}".
Based on their typical sound, provide a list of relevant genres, moods, tempos, and instruments in ${langName}.
- For genres, select up to 3 most dominant genres from this list: ${t.GENRES.join(', ')}.
- For moods, select up to 3 most fitting moods from this list: ${t.MOODS.join(', ')}.
- For tempos, select ONLY ONE most representative tempo from this list: ${t.TEMPOS.join(', ')}.
- For instruments, select up to 4 relevant instruments from this list: ${t.INSTRUMENTS.join(', ')}.
Return the result as a JSON object. Ensure all tags are in ${langName}.`;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            genres: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: `Up to 3 most dominant genres for the artist in ${langName}.`,
            },
            moods: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: `Up to 3 most fitting moods for the artist in ${langName}.`,
            },
            tempos: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: `Exactly one most representative tempo for the artist in ${langName}.`,
            },
            instruments: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: `Up to 4 relevant instruments for the artist in ${langName}.`,
            },
        },
        required: ['genres', 'moods', 'tempos', 'instruments'],
    };

    try {
        const ai = new GoogleGenAI({ apiKey });
        // Use 3 Pro for accurate musical analysis
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: { parts: [{ text: prompt }] },
            config: {
                temperature: 0.2,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });
        
        const style = JSON.parse(response.text);
        // Ensure tempos is an array and we only take one value, as requested.
        if (!Array.isArray(style.tempos)) {
            style.tempos = [];
        }

        return {
             genres: style.genres || [],
             moods: style.moods || [],
             tempos: style.tempos.slice(0, 1) || [],
             instruments: style.instruments || [],
        };
    } catch (error) {
        throw handleGeminiError(error, language);
    }
};

export const generateStyleFromIdea = async (formState: any, language: Language, apiKey: string): Promise<StyleSuggestion> => {
    const langName = translations[language].languageName;
    const t = translations[language].options;
    
    const prompt = `You are a visionary A&R executive. Based on the following song concept, suggest the most commercially viable and artistically fitting musical style. Provide your answer in ${langName}.
- Select up to 3 genres from this list: ${t.GENRES.join(', ')}.
- Select up to 3 moods from this list: ${t.MOODS.join(', ')}.
- Select ONLY ONE tempo from this list: ${t.TEMPOS.join(', ')}.
- Select up to 4 relevant instruments from this list: ${t.INSTRUMENTS.join(', ')}.

Song Concept:
- Main Idea: ${formState.prompt}
- Core Theme: ${formState.coreTheme}
- Story: ${formState.story}
- Key Emotions: ${formState.keyEmotions}
- Imagery: ${formState.imagery}

Return ONLY a JSON object with the keys "genres", "moods", "tempos", and "instruments".`;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            genres: { type: Type.ARRAY, items: { type: Type.STRING } },
            moods: { type: Type.ARRAY, items: { type: Type.STRING } },
            tempos: { type: Type.ARRAY, items: { type: Type.STRING } },
            instruments: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['genres', 'moods', 'tempos', 'instruments'],
    };
    
    try {
        const ai = new GoogleGenAI({ apiKey });
        // Use 3 Pro for creative style matching
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: { parts: [{ text: prompt }] },
            config: {
                temperature: 0.5,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });
        
        const style = JSON.parse(response.text);
         if (!Array.isArray(style.tempos)) {
            style.tempos = [];
        }

        return {
             genres: style.genres || [],
             moods: style.moods || [],
             tempos: style.tempos.slice(0, 1) || [],
             instruments: style.instruments || [],
        };
    } catch (error) {
        throw handleGeminiError(error, language);
    }
};

export const generateSongStructure = async (formState: any, language: Language, apiKey: string): Promise<string[]> => {
    const langName = translations[language].languageName;
    const p = translations[language].prompts;
    const t = translations[language].options;

    const combinedStyle = [...formState.selectedGenre, ...formState.selectedMood].join(', ');

    const prompt = `As a master songwriter, analyze the following song concept and musical style. Suggest the most effective and conventional song structure in ${langName}.
- Choose from these available parts: ${t.SONG_STRUCTURE_PARTS.join(', ')}.
- The structure should be logical and build emotional momentum.
- Return ONLY a JSON array of strings representing the structure, e.g., ["[Intro]", "[Verse 1]", "[Chorus]"].

Song Concept:
- Main Idea: ${formState.prompt}
- Core Theme: ${formState.coreTheme}
- Musical Style: ${combinedStyle}`;
    
    const responseSchema = {
        type: Type.ARRAY,
        items: { type: Type.STRING, description: `A song structure part, e.g., "[Verse]"` }
    };
    
    try {
        const ai = new GoogleGenAI({ apiKey });
        // Use 3 Pro for structural planning
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: { parts: [{ text: prompt }] },
            config: {
                temperature: 0.3,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });
        
        const structure = JSON.parse(response.text);
        if (Array.isArray(structure) && structure.every(s => typeof s === 'string')) {
            return structure;
        }
        throw new Error("Invalid structure format returned from AI.");

    } catch (error) {
        throw handleGeminiError(error, language);
    }
};