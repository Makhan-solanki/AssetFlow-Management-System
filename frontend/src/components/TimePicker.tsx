import React, { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface TimePickerProps {
  value: string; // HH:MM format (24-hour)
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Select time...',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse hours and minutes from value
  const [selectedHour, setSelectedHour] = useState<string | null>(null);
  const [selectedMinute, setSelectedMinute] = useState<string | null>(null);

  useEffect(() => {
    if (value && value.includes(':')) {
      const [h, m] = value.split(':');
      setSelectedHour(h);
      setSelectedMinute(m);
    } else {
      setSelectedHour(null);
      setSelectedMinute(null);
    }
  }, [value]);

  // Close calendar on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutes = ['00', '15', '30', '45'];

  const handleSelectHour = (h: string) => {
    setSelectedHour(h);
    const m = selectedMinute || '00';
    onChange(`${h}:${m}`);
  };

  const handleSelectMinute = (m: string) => {
    setSelectedMinute(m);
    const h = selectedHour || '09';
    onChange(`${h}:${m}`);
    setIsOpen(false); // Auto close after selecting minute
  };

  // Format 24h to 12h for display
  const displayValue = value ? (() => {
    try {
      const parts = value.split(':');
      if (parts.length === 2) {
        const h = parseInt(parts[0], 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayH = h % 12 === 0 ? 12 : h % 12;
        return `${displayH}:${parts[1]} ${ampm}`;
      }
      return value;
    } catch {
      return value;
    }
  })() : '';

  return (
    <div ref={containerRef} className={`relative flex flex-col space-y-1.5 ${className}`}>
      {label && (
        <span className="block text-xs font-semibold text-slate-500 text-left">
          {label}
        </span>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 flex items-center justify-between text-left font-semibold text-xs shadow-sm hover:border-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
        >
          <span className={displayValue ? "text-slate-800" : "text-slate-400"}>
            {displayValue || placeholder}
          </span>
          <Clock className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
        </button>

        {isOpen && (
          <div className="absolute z-35 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 w-48 animate-in fade-in slide-in-from-top-1 duration-100 flex gap-2">
            {/* Hours Column */}
            <div className="flex-1 flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase text-center mb-1.5 border-b border-slate-100 pb-1 font-sans">Hour</span>
              <div className="max-h-36 overflow-y-auto space-y-0.5 pr-1 scrollbar-thin">
                {hours.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => handleSelectHour(h)}
                    className={`w-full py-1 text-center text-xs font-semibold rounded-lg transition-all ${
                      selectedHour === h
                        ? 'bg-purple-50 text-purple-600 font-bold'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="w-[1px] bg-slate-100 self-stretch" />

            {/* Minutes Column */}
            <div className="w-16 flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase text-center mb-1.5 border-b border-slate-100 pb-1 font-sans">Min</span>
              <div className="space-y-0.5">
                {minutes.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleSelectMinute(m)}
                    className={`w-full py-1.5 text-center text-xs font-semibold rounded-lg transition-all ${
                      selectedMinute === m
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
