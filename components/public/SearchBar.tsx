'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
  onClear?: () => void;
}

/**
 * SearchBar component with debounced input for real-time filtering
 * Implements Requirements 12.1 (real-time filtering with debouncing)
 */
export function SearchBar({
  value,
  onChange,
  placeholder = 'Search...',
  debounceMs = 300,
  className = '',
  onClear,
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Sync local value with prop value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounced onChange
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onChange(localValue);
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [localValue, debounceMs, onChange]);

  const handleClear = useCallback(() => {
    setLocalValue('');
    onChange('');
    onClear?.();
  }, [onChange, onClear]);

  return (
    <div className={`relative ${className}`} role="search">
      <label htmlFor="search-input" className="sr-only">Search</label>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg className="h-5 w-5 text-[#555]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        id="search-input"
        type="search"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        className="w-full pl-10 pr-10 py-3 rounded-xl border border-[#1E1E1E] text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#FF6600]/50 transition-all"
        style={{ background: '#111' }}
        aria-label="Search"
        aria-describedby={localValue ? 'search-clear-button' : undefined}
      />
      {localValue && (
        <button
          id="search-clear-button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center justify-center hover:text-white transition-colors focus:outline-none"
          aria-label="Clear search"
          type="button"
        >
          <svg className="h-5 w-5 text-[#555] hover:text-[#FF6600]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

interface HighlightedTextProps {
  text: string;
  highlight: string;
  className?: string;
}

/**
 * HighlightedText component for highlighting search matches
 * Implements Requirements 12.2 (text highlighting for search matches)
 */
export function HighlightedText({ text, highlight, className = '' }: HighlightedTextProps) {
  if (!highlight.trim()) {
    return <span className={className}>{text}</span>;
  }

  // Escape special regex characters
  const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedHighlight})`, 'gi');
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        const isMatch = regex.test(part);
        regex.lastIndex = 0; // Reset regex state

        return isMatch ? (
          <mark
            key={index}
            className="bg-[#FF6600]/30 text-[#FFB700] font-bold px-0.5 rounded"
          >
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        );
      })}
    </span>
  );
}
