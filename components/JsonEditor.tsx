/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { json } from '@codemirror/lang-json';
import { useTheme } from 'next-themes';

// Dynamically import ReactCodeMirror to prevent SSR issues with document/window
const ReactCodeMirror = dynamic(() => import('@uiw/react-codemirror'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-80 bg-muted animate-pulse rounded-xl border border-border flex items-center justify-center">
      <span className="text-foreground/50 text-sm">Loading Editor...</span>
    </div>
  )
});

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  isValid: boolean;
  onFormat?: () => void;
  onGenerateUUID?: () => void;
}

export default function JsonEditor({
  value,
  onChange,
  isValid,
  onFormat,
  onGenerateUUID,
}: JsonEditorProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative border border-border rounded-xl overflow-hidden flex flex-col h-full min-h-[350px] shadow-sm">
      {/* Editor Header / Toolbars */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted border-b border-border text-xs">
        <div className="flex items-center space-x-2">
          <span
            className={`inline-block w-2.5 h-2.5 rounded-full transition-all ${
              isValid ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.5)]'
            }`}
          />
          <span className="font-semibold">
            {isValid ? '✓ Valid JSON' : '✗ Invalid JSON'}
          </span>
        </div>
        <div className="flex space-x-2">
          {onGenerateUUID && (
            <button
              onClick={onGenerateUUID}
              className="px-3 py-1 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-md font-semibold cursor-pointer transition-colors text-foreground"
            >
              Generate UUID
            </button>
          )}
          {onFormat && (
            <button
              onClick={onFormat}
              className="px-3 py-1 bg-primary text-white hover:bg-opacity-95 rounded-md font-semibold cursor-pointer transition-all shadow-sm"
            >
              Format
            </button>
          )}
        </div>
      </div>

      {/* CodeMirror instance */}
      <div className="flex-1 bg-white dark:bg-[#050505] text-sm">
        {mounted && (
          <ReactCodeMirror
            value={value}
            height="100%"
            minHeight="320px"
            extensions={[json()]}
            theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
            onChange={(val) => onChange(val)}
            className="h-full focus-within:ring-2 focus-within:ring-secondary/50 outline-none"
          />
        )}
      </div>
    </div>
  );
}
