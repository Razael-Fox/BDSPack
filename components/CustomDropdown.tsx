'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
}

export default function CustomDropdown({ options, value, onChange }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full rounded-xl border border-border bg-muted hover:bg-black/5 dark:hover:bg-white/5 px-3 py-2.5 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all cursor-pointer shadow-sm"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span>{selectedOption ? selectedOption.label : 'Pilih mode...'}</span>
        <ChevronDown className={`w-4 h-4 text-foreground/50 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-full rounded-xl border border-border bg-white dark:bg-[#0a0a0a] shadow-lg focus:outline-none z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="p-1" role="menu" aria-orientation="vertical">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  option.value === value
                    ? 'bg-primary/10 text-primary dark:bg-primary/20'
                    : 'text-foreground/80 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'
                }`}
                role="menuitem"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
