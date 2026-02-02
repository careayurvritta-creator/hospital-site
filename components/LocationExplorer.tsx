import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { MapPin, Navigation, Search, Loader2, ExternalLink } from 'lucide-react';

const LocationExplorer: React.FC = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mapLinks, setMapLinks] = useState<any[]>([]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResponse(null);
    setMapLinks([]);

    try {
      // Use Vite's import.meta.env for client-side environment variables
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key missing");

      const ai = new GoogleGenAI({ apiKey });
      // Using gemini-2.5-flash with googleMaps tool as requested
      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: query,
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng: {
                latitude: 22.322,
                longitude: 73.155
              }
            }
          },
          systemInstruction: `You are a location assistant for Ayurvritta Ayurveda Hospital. 
          The hospital is located at Lat: 22.322, Lng: 73.155 (New Alkapuri, Vadodara).
          Help users find nearby landmarks, hotels, pharmacies, or understand the location. 
          Focus on providing helpful, location-specific information relative to the hospital.`
        },
      });

      const text = result.text;
      setResponse(text || "No details found.");

      // Extract grounding chunks for Maps
      const chunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        setMapLinks(chunks);
      }

    } catch (error) {
      console.error("Maps Error:", error);
      setResponse("Sorry, I couldn't fetch location details right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-ayur-subtle overflow-hidden">
      <div className="bg-ayur-green/5 p-6 border-b border-ayur-subtle">
        <h3 className="font-serif text-xl font-bold text-ayur-green flex items-center gap-2">
          <MapPin size={20} className="text-ayur-gold" />
          Explore Our Neighborhood with AI
        </h3>
        <p className="text-sm text-ayur-gray mt-2">
          Ask Gemini about nearby landmarks, hotels for your stay, or directions to our clinic.
        </p>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., Hotels near Ayurvritta Hospital"
            className="flex-1 px-4 py-3 bg-white text-ayur-green placeholder-gray-400 border border-ayur-subtle rounded-xl focus:outline-none focus:border-ayur-green focus:ring-1 focus:ring-ayur-green shadow-sm"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-ayur-green text-white px-6 rounded-xl font-bold hover:bg-ayur-gold transition-colors disabled:opacity-70 flex items-center gap-2 shadow-lg"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>

        {response && (
          <div className="mt-4 bg-ayur-cream/30 p-4 rounded-xl border border-ayur-subtle animate-fadeIn">
            <p className="text-ayur-gray whitespace-pre-line text-sm leading-relaxed">{response}</p>

            {mapLinks.length > 0 && (
              <div className="mt-4 pt-4 border-t border-ayur-subtle">
                <h4 className="text-xs font-bold uppercase tracking-wider text-ayur-gray mb-2">Sources & Map Links</h4>
                <div className="flex flex-wrap gap-2">
                  {mapLinks.map((chunk, idx) => {
                    // groundingChunks from googleMaps tool usually contain web uri or place uri
                    if (chunk.web?.uri) {
                      return (
                        <a key={idx} href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs bg-white border border-ayur-subtle px-3 py-1.5 rounded-lg text-ayur-green hover:text-ayur-gold hover:border-ayur-gold transition-colors">
                          <ExternalLink size={10} />
                          {chunk.web.title || "View Web Source"}
                        </a>
                      );
                    }
                    // Handle Maps chunks if present (often structure is different)
                    // The SDK types might not explicitly show it here without deeper inspection, 
                    // but commonly it's under 'maps' or similar. 
                    // Assuming the current error is just the toolConfig.
                    return null;
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationExplorer;