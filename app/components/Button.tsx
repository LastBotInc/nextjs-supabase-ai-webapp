'use client';

import { ButtonHTMLAttributes, KeyboardEvent } from 'react';
import type { MouseEvent } from 'react';
import { Link } from '@/app/i18n/navigation';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'gradient' | 'darkCta';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  target?: string;
  rel?: string;
}

export function Button({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  href,
  target,
  rel,
  onClick,
  ...props
}: ButtonProps) {
  const baseStyles = 'rounded-md font-medium transition-colors duration-150 inline-flex w-fit items-center justify-center gap-2';

  const variantStyles = {
    primary: 'bg-brand-blue hover:bg-blue-700 text-white',
    secondary: 'bg-light-background hover:bg-light-card border border-brand-blue text-brand-blue',
    darkCta: 'bg-dark-card hover:bg-gray-700 text-dark-text',
    outline: 'border border-solid border-black/[.1] dark:border-white/[.1] hover:bg-black/[.05] dark:hover:bg-white/[.05]',
    gradient: 'bg-gradient-to-r from-[#A78BFA] to-[#8B5CF6] text-white hover:from-[#9F7AEA] hover:to-[#7C3AED] transform hover:scale-105 transition-all duration-300'
  };

  const sizeStyles = {
    sm: 'text-sm h-8 px-3',
    md: 'text-base h-10 px-4',
    lg: 'text-lg h-12 px-6'
  };

  const styles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(e as unknown as MouseEvent<HTMLButtonElement>);
    }
  };

  if (href) {
    return (
      <Link href={href} className={styles} target={target} rel={rel}>
        {children}
      </Link>
    );
  }

  return (
    <button
      className={styles}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {children}
    </button>
  );
}
