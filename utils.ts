
// This utility file centralizes shared logic to avoid duplication.

/**
 * Returns the user-provided song structure. Originally, this function would
 * process and re-number sections, but based on user feedback, it now
 * preserves the user's input exactly as provided to give them full control.
 * @param songStructure - An array of structure parts, e.g., ['[Verse]', '[Chorus]', '[Verse 2]'].
 * @returns The original, unmodified array of structure parts.
 */
export const getProcessedStructure = (songStructure: string[]): string[] => {
    if (!songStructure) return [];
    return songStructure;
};

/**
 * Decodes a base64 string into a Uint8Array.
 * @param base64 - The base64 encoded string.
 * @returns The decoded byte array.
 */
export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Decodes raw PCM audio data into an AudioBuffer for playback.
 * The browser's native `decodeAudioData` is for file formats like MP3/WAV, not raw streams.
 * @param data - The raw PCM data as a Uint8Array.
 * @param ctx - The AudioContext to use for creating the buffer.
 * @param sampleRate - The sample rate of the audio (e.g., 24000 for Gemini TTS).
 * @param numChannels - The number of audio channels (e.g., 1 for mono).
 * @returns A promise that resolves to an AudioBuffer.
 */
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  // The raw data is 16-bit PCM, so we create an Int16Array view on the buffer.
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      // Normalize the 16-bit integer samples to the [-1.0, 1.0] range for the AudioBuffer.
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

/**
 * Calculates the estimated Weirdness and Style Influence metrics for Suno AI
 * based on selected genres and moods.
 * Now covers comprehensive genre lists including Thai, Asian, and Niche styles.
 * @param genres List of selected genres
 * @param moods List of selected moods
 * @returns Object containing { weirdness, influence }
 */
export const calculateAutoMetrics = (genres: string[], moods: string[]) => {
    const allTags = [...genres, ...moods].map(t => t.toLowerCase());
    const tagString = allTags.join('');
    
    // Deterministic jitter based on the content of the tags
    // This ensures the same combination always gives the same result, but feels "organic"
    let hash = 0;
    for (let i = 0; i < tagString.length; i++) {
        hash = ((hash << 5) - hash) + tagString.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
    }
    const jitterW = (hash % 5); // -2 to +2 variance could be applied, here we keep it simple 0-4
    const jitterI = ((hash >> 1) % 5);

    let w = 50; // Base Weirdness
    let i = 50; // Base Influence

    // --- WEIRDNESS CALCULATIONS ---

    // Extreme Weirdness (+30 to +40)
    if (allTags.some(t => t.includes('glitch') || t.includes('breakcore') || t.includes('hyperpop') || t.includes('experimental') || t.includes('idm') || t.includes('avant-garde') || t.includes('psychedelic') || t.includes('weird') || t.includes('whimsical'))) {
        w += 35;
    }

    // High Weirdness (+20 to +25)
    else if (allTags.some(t => t.includes('metal') || t.includes('death') || t.includes('trap') || t.includes('drill') || t.includes('dubstep') || t.includes('industrial') || t.includes('techno') || t.includes('cyberpunk') || t.includes('sci-fi') || t.includes('vocaloid') || t.includes('opera'))) {
        w += 20;
    }

    // Moderate Weirdness (+10 to +15)
    else if (allTags.some(t => t.includes('jazz') || t.includes('fusion') || t.includes('rap') || t.includes('hip hop') || t.includes('funk') || t.includes('synthwave') || t.includes('electronic') || t.includes('reggae') || t.includes('ska') || t.includes('latin') || t.includes('bossa'))) {
        w += 10;
    }

    // Low Weirdness (Safe/Standard) (-10 to -20)
    else if (allTags.some(t => t.includes('pop') || t.includes('ballad') || t.includes('acoustic') || t.includes('folk') || t.includes('country') || t.includes('easy listening') || t.includes('lullaby') || t.includes('children') || t.includes('classical') || t.includes('relax') || t.includes('calm'))) {
        w -= 15;
    }

    // --- INFLUENCE CALCULATIONS ---

    // Extreme Influence (+30 to +40) - Strict genres that must sound "authentic"
    if (allTags.some(t => t.includes('classical') || t.includes('opera') || t.includes('orchestral') || t.includes('traditional') || t.includes('ancient') || t.includes('luk thung') || t.includes('ลูกทุ่ง') || t.includes('mor lam') || t.includes('หมอลำ') || t.includes('enka') || t.includes('trot') || t.includes('gospel') || t.includes('choral') || t.includes('march'))) {
        i += 35;
    }

    // High Influence (+15 to +25) - Distinct styles
    else if (allTags.some(t => t.includes('metal') || t.includes('blues') || t.includes('jazz') || t.includes('country') || t.includes('techno') || t.includes('trance') || t.includes('house') || t.includes('disco') || t.includes('synthwave') || t.includes('city pop') || t.includes('k-pop') || t.includes('j-pop'))) {
        i += 20;
    }

    // Moderate Influence (+5 to +10)
    else if (allTags.some(t => t.includes('rock') || t.includes('pop') || t.includes('r&b') || t.includes('soul') || t.includes('hip hop') || t.includes('rap'))) {
        i += 5;
    }

    // Low Influence / Loose Structure (-10 to -20)
    else if (allTags.some(t => t.includes('lo-fi') || t.includes('ambient') || t.includes('dream') || t.includes('shoegaze') || t.includes('indie') || t.includes('alternative') || t.includes('fusion') || t.includes('experimental') || t.includes('chill'))) {
        i -= 15;
    }

    // --- MOOD MODIFIERS ---
    if (allTags.some(t => t.includes('dark') || t.includes('scary') || t.includes('horror') || t.includes('anxious') || t.includes('tense'))) w += 10;
    if (allTags.some(t => t.includes('happy') || t.includes('joy') || t.includes('romantic') || t.includes('warm') || t.includes('upbeat'))) w -= 5;
    if (allTags.some(t => t.includes('focused') || t.includes('intense') || t.includes('epic') || t.includes('cinematic'))) i += 10;

    // Apply Jitter to make it feel organic
    w += (jitterW - 2); // +/- 2
    i += (jitterI - 2); // +/- 2

    return { 
        weirdness: Math.min(100, Math.max(0, w)), 
        influence: Math.min(100, Math.max(0, i)) 
    };
};
