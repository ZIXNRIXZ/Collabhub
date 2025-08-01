import React from 'react';

interface CollabHubLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CollabHubLogo: React.FC<CollabHubLogoProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizes = {
    sm: 'w-8 h-8 text-xl',
    md: 'w-12 h-12 text-3xl', 
    lg: 'w-16 h-16 text-4xl'
  };

  return (
    <div className={`${sizes[size]} ${className}`}>
      <div className="relative group cursor-pointer">
        {/* Main logo container */}
        <div className="relative flex items-center justify-center w-full h-full rounded-2xl bg-gradient-to-br from-primary via-primary-light to-accent shadow-lg hover:shadow-glow transition-all duration-300 group-hover:scale-105">
          
          {/* Background glow effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100" />
          
          {/* Letter C */}
          <div className="relative z-10 font-bold text-primary-foreground font-inter tracking-tight">
            C
          </div>
          
          {/* Minimalist accent line */}
          <div className="absolute bottom-1 right-1 w-2 h-0.5 bg-primary-foreground/30 rounded-full group-hover:bg-primary-foreground/60 transition-all duration-300" />
          
          {/* Subtle inner border */}
          <div className="absolute inset-[1px] rounded-[calc(0.75rem-1px)] border border-white/10 group-hover:border-white/20 transition-all duration-300" />
        </div>
        
        {/* Floating particles effect on hover */}
        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute -top-1 -left-1 w-1 h-1 bg-primary-foreground rounded-full animate-ping" />
          <div className="absolute -bottom-1 -right-1 w-1 h-1 bg-accent-foreground rounded-full animate-ping delay-150" />
        </div>
      </div>
    </div>
  );
};