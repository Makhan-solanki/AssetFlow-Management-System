import React from 'react';

interface CardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  indicatorText: string;
  indicatorColor: string;
  accentBgColor?: string;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  title,
  value,
  icon,
  indicatorText,
  indicatorColor,
  accentBgColor = 'bg-brand/5',
  className = '',
  onClick,
}) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-750 transition-all ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      <div className={`absolute top-0 right-0 w-24 h-24 ${accentBgColor} rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform`} />
      
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">{title}</span>
          <div className="text-3xl font-extrabold text-white">{value}</div>
        </div>
        <div className="shrink-0">
          {icon}
        </div>
      </div>
      
      <span className={`text-[10px] font-medium mt-4 block ${indicatorColor}`}>
        {indicatorText}
      </span>
    </div>
  );
};
