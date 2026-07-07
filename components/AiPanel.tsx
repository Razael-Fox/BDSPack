/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Wrench, Settings, X, Eye, EyeOff } from 'lucide-react';

interface AiPanelProps {
  currentJson: string;
  onAiResponse: (newJson: string) => void;
}

export default function AiPanel({ currentJson, onAiResponse }: AiPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load API Key from localStorage
    const savedKey = localStorage.getItem('groq_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const saveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('groq_api_key', key);
  };

  const handleAiAction = async (mode: 'fix' | 'generate') => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-groq-api-key': apiKey,
        },
        body: JSON.stringify({
          mode,
          prompt: mode === 'generate' ? prompt : undefined,
          json: mode === 'fix' ? currentJson : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Terjadi kesalahan pada AI request.');
      }

      if (data.result) {
        onAiResponse(data.result);
        if (mode === 'generate') {
          setPrompt('');
        }
      } else {
        throw new Error('AI tidak mengembalikan output JSON yang valid.');
      }
    } catch (err: any) {
      setError(err.message || 'Gagal terhubung ke AI server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-muted/30 border border-border rounded-xl p-4 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-secondary animate-pulse" />
          <h3 className="font-bold text-sm">AI Assistant (Groq)</h3>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer text-foreground/75 hover:text-foreground"
          title="AI Settings"
        >
          <Settings className="w-4.5 h-4.5" />
        </button>
      </div>

      {showSettings && (
        <div className="bg-muted p-3 rounded-lg border border-border space-y-2.5 relative">
          <button
            onClick={() => setShowSettings(false)}
            className="absolute top-2 right-2 text-foreground/45 hover:text-foreground cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground/60">
            Groq API Settings
          </h4>
          <div className="space-y-1">
            <label className="text-xs font-semibold">Groq API Key (Opsional)</label>
            <div className="relative flex items-center">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => saveApiKey(e.target.value)}
                placeholder="gsk_..."
                className="w-full bg-background border border-border rounded-md pl-3 pr-10 py-1.5 text-xs outline-none focus:ring-1 focus:ring-secondary/50"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 text-foreground/45 hover:text-foreground cursor-pointer"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-foreground/50 mt-1">
              Disimpan di browser Anda (`localStorage`). Jika dikosongkan, API akan menggunakan server key (jika tersedia).
            </p>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Tulis apa yang ingin dibuat... (Contoh: 'Buat 2 behavior pack entries dengan UUID random')"
          className="w-full h-24 bg-background border border-border rounded-lg p-3 text-xs outline-none focus:ring-1 focus:ring-secondary/50 resize-none font-sans"
          disabled={loading}
        />
        
        <div className="flex space-x-2">
          <button
            onClick={() => handleAiAction('generate')}
            disabled={loading || !prompt.trim()}
            className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 bg-secondary text-black hover:bg-opacity-90 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-xs font-bold transition-all shadow-md shadow-secondary/15 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate JSON</span>
          </button>
          
          <button
            onClick={() => handleAiAction('fix')}
            disabled={loading || !currentJson.trim()}
            className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-xs font-semibold border border-border transition-all cursor-pointer text-foreground"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>AI Auto-Fix</span>
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center space-x-2 py-1">
          <div className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-foreground/60">AI sedang memproses...</span>
        </div>
      )}

      {error && (
        <div className="p-2.5 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-xs font-medium">
          {error}
        </div>
      )}
    </div>
  );
}
