import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', size = 'md' }) => {
  const variantStyles: Record<BadgeVariant, string> = {
    success: 'bg-emerald-100 text-emerald-700 font-bold',
    warning: 'bg-amber-100 text-amber-700 font-bold',
    danger: 'bg-rose-100 text-rose-700 font-bold',
    info: 'bg-sky-100 text-sky-700 font-bold',
    purple: 'bg-purple-100 text-purple-700 font-bold',
    neutral: 'bg-slate-100 text-slate-700 font-bold'
  };

  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-[10px] rounded' : 'px-2.5 py-1 text-xs rounded-md';

  return (
    <span className={`inline-flex items-center ${variantStyles[variant]} ${sizeStyles} tracking-tight whitespace-nowrap`}>
      {children}
    </span>
  );
};
