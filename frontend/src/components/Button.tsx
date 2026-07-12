import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-brand hover:bg-brand-600 text-white shadow-md shadow-brand/20',
    secondary: 'bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-800',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/10',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/10',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-[10px]',
    md: 'px-4 py-2.5 text-xs',
    lg: 'px-6 py-3.5 text-sm',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />}
      {children}
    </button>
  );
};
