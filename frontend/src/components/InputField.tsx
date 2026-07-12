import React from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> {
  label: string;
  type?: 'text' | 'number' | 'password' | 'email' | 'date' | 'datetime-local' | 'time' | 'select' | 'textarea' | 'checkbox';
  options?: { value: string; label: string }[];
  rows?: number;
  error?: string;
  containerClassName?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  type = 'text',
  options = [],
  rows = 3,
  error,
  containerClassName = '',
  className = '',
  id,
  children,
  ...props
}) => {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
  const inputBaseStyles = 'appearance-none block w-full px-3.5 py-3 border border-slate-800 rounded-xl shadow-sm placeholder-slate-500 bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand text-xs transition-all';
  
  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {type !== 'checkbox' && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-300">
          {label}
        </label>
      )}

      {type === 'select' ? (
        <select
          id={inputId}
          className={`${inputBaseStyles} ${className}`}
          {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
        >
          {children ? children : (
            <>
              <option value="">Select...</option>
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </>
          )}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          id={inputId}
          rows={rows}
          className={`${inputBaseStyles} ${className}`}
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : type === 'checkbox' ? (
        <div className="flex items-center space-x-2">
          <input
            id={inputId}
            type="checkbox"
            className={`w-4 h-4 rounded border-slate-800 bg-slate-950 text-brand focus:ring-brand ${className}`}
            {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
          />
          <label htmlFor={inputId} className="text-xs font-semibold text-slate-300 select-none cursor-pointer">
            {label}
          </label>
        </div>
      ) : (
        <input
          id={inputId}
          type={type}
          className={`${inputBaseStyles} ${className}`}
          {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
        />
      )}

      {error && (
        <span className="text-[10px] text-red-400 font-semibold block">{error}</span>
      )}
    </div>
  );
};
