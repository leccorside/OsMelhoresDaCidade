import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5',
    md: 'text-sm px-5 py-2.5 gap-2 shadow-card hover:-translate-y-0.5',
    lg: 'text-base px-8 py-3.5 gap-2.5 shadow-hover hover:-translate-y-0.5',
  };

  const variantStyles = {
    primary:
      'bg-[#FF3B4F] text-white hover:bg-[#D91F35] focus:ring-[#FF3B4F] active:translate-y-0',
    secondary:
      'bg-[#F5F5F5] text-[#171717] hover:bg-[#EAEAEA] focus:ring-gray-300',
    outline:
      'border border-[#E5E7EB] bg-white text-[#171717] hover:bg-[#F8F9FA] hover:border-[#171717] focus:ring-[#171717]',
    ghost:
      'bg-transparent text-[#171717] hover:bg-black/5 focus:ring-gray-300 shadow-none',
    dark:
      'bg-[#171717] text-white hover:bg-[#2B2B2B] focus:ring-[#171717]',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
