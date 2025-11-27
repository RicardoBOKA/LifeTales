import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseStyles = "rounded-2xl font-semibold transition-all duration-200 active:scale-95 flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-slate-800 text-white shadow-lg shadow-slate-200 hover:bg-slate-700 hover:shadow-xl",
    secondary: "bg-white text-slate-700 shadow-sm border border-slate-100 hover:bg-slate-50",
    ghost: "text-slate-500 hover:bg-slate-100/50 hover:text-slate-800",
    icon: "p-2 bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white text-slate-700 rounded-full aspect-square"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  // Override for icon variant size
  const finalSize = variant === 'icon' ? '' : sizes[size];

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${finalSize} ${widthStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};