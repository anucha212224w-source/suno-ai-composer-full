import { GoogleGenAI } from "@google/genai";

/**
 * Verifies a Gemini API key by making a lightweight, non-billed request.
 * @param apiKey The user-provided API key string.
 * @returns An object indicating if the key is valid, with an optional error message.
 */
export const verifyApiKey = async (apiKey: string): Promise<{ valid: boolean; error?: string }> => {
    if (!apiKey || !apiKey.trim()) {
        return { valid: false, error: "API Key cannot be empty." };
    }
    
    const sanitizedKey = apiKey.trim();

    // Basic validation: API keys must be ASCII characters only. 
    // If it contains non-ASCII (like Thai characters or invisible control chars), headers will fail.
    // eslint-disable-next-line no-control-regex
    if (/[^\x00-\x7F]/.test(sanitizedKey)) {
         return { valid: false, error: "API Key contains invalid characters (non-ASCII). Please check your input." };
    }

    try {
        const ai = new GoogleGenAI({ apiKey: sanitizedKey });
        // Use a lightweight generateContent call to a fast model for verification.
        // Explicitly using the object structure to avoid potential SDK type errors with raw strings.
        await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: 'Hi' }] },
        });
        return { valid: true };
    } catch (error) {
        console.error("API Key verification failed:", error);
        let errorMessage = "An unknown error occurred during verification.";
        
        if (error instanceof TypeError) {
             // TypeError is often thrown by fetch for network issues (CORS, offline, blocked)
             errorMessage = "Network error: Unable to connect to Gemini API. Please check your internet connection or firewall.";
        } else if (error instanceof Error) {
            const lowerMessage = error.message.toLowerCase();
            
            // Handle header appending errors (non-ISO-8859-1 characters)
            if (lowerMessage.includes('iso-8859-1') || lowerMessage.includes('headers') || lowerMessage.includes('append')) {
                errorMessage = "API Key contains invalid characters. Please ensure you copied it correctly.";
            } else if (lowerMessage.includes('api key not valid') || lowerMessage.includes('invalid api key')) {
                errorMessage = "The provided API Key is not valid. Please check and try again.";
            } else if (lowerMessage.includes('network') || lowerMessage.includes('fetch') || lowerMessage.includes('type error')) {
                errorMessage = "Network connection failed. Please check your internet or VPN.";
            } else if (lowerMessage.includes('403')) {
                 errorMessage = "Access denied (403). Your API key might lack permissions or be restricted.";
            } else {
                errorMessage = `Verification failed: ${error.message}`;
            }
        }
        return { valid: false, error: errorMessage };
    }
};