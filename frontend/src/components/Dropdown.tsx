import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface DropdownOption {
  value: string | number;
  label: string;
}

interface DropdownProps {
  value: string | number;
  onChange: (value: any) => void;
  options: DropdownOption[];
  placeholder?: string;
  className?: string;
  label?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  className = '',
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
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

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div ref={containerRef} className={`relative flex flex-col space-y-1.5 ${className}`}>
      {label && (
        <span className="block text-xs font-semibold text-slate-400 text-left">
          {label}
        </span>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 flex items-center justify-between text-left font-semibold text-xs shadow-sm hover:border-slate-650 transition-all focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
        </button>

        {isOpen && (
          <div className="absolute z-30 left-0 right-0 mt-1.5 bg-slate-900 border border-slate-750 rounded-xl shadow-xl max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-100">
            {options.map((opt) => (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`px-3.5 py-2 hover:bg-slate-850 cursor-pointer transition-colors text-left text-xs ${
                  value === opt.value
                    ? 'bg-purple-100/40 text-brand font-bold'
                    : 'text-slate-100'
                }`}
              >
                {opt.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
