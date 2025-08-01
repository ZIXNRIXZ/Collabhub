import React, { useEffect, useRef } from 'react';

export const SmartBackground = () => {
  const backgroundRef = useRef<HTMLDivElement>(null);
  const mousePosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (backgroundRef.current) {
        const rect = backgroundRef.current.getBoundingClientRect();
        mousePosition.current = {
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        };

        // Update CSS custom properties for dynamic effects
        backgroundRef.current.style.setProperty('--mouse-x', `${mousePosition.current.x * 100}%`);
        backgroundRef.current.style.setProperty('--mouse-y', `${mousePosition.current.y * 100}%`);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      ref={backgroundRef}
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
      style={{
        '--mouse-x': '50%',
        '--mouse-y': '50%',
      } as React.CSSProperties}
    >
      {/* Apple-inspired gradient layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/[0.02]" />
      
      {/* Interactive mouse-following orb */}
      <div 
        className="absolute w-[800px] h-[800px] rounded-full opacity-30 blur-[100px] transition-all duration-1000 ease-out"
        style={{
          background: `radial-gradient(circle, hsl(var(--primary) / 0.08) 0%, hsl(var(--accent) / 0.04) 40%, transparent 70%)`,
          left: 'var(--mouse-x)',
          top: 'var(--mouse-y)',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Floating elements */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/20 rounded-full animate-float" />
      <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-accent/30 rounded-full animate-float-delayed" />
      <div className="absolute bottom-1/3 left-1/2 w-1.5 h-1.5 bg-success/20 rounded-full animate-smooth-bounce" />

      {/* Subtle grid overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.008]" />

      {/* Gradient mesh - Apple style */}
      <div className="absolute inset-0">
        <div 
          className="absolute top-20 left-1/4 w-[600px] h-[600px] rounded-full opacity-20 blur-[120px] animate-float"
          style={{
            background: `radial-gradient(circle, hsl(var(--primary) / 0.03) 0%, transparent 70%)`
          }}
        />
        <div 
          className="absolute bottom-20 right-1/4 w-[400px] h-[400px] rounded-full opacity-25 blur-[80px] animate-float-delayed"
          style={{
            background: `radial-gradient(circle, hsl(var(--accent) / 0.04) 0%, transparent 70%)`
          }}
        />
      </div>

      {/* Dynamic lines - Nothing inspired */}
      <svg 
        className="absolute inset-0 w-full h-full opacity-[0.02]" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
            <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity="0.05" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <line x1="0" y1="20%" x2="100%" y2="30%" stroke="url(#line-gradient)" strokeWidth="1" />
        <line x1="0" y1="70%" x2="100%" y2="60%" stroke="url(#line-gradient)" strokeWidth="1" />
        <line x1="20%" y1="0" x2="30%" y2="100%" stroke="url(#line-gradient)" strokeWidth="1" />
        <line x1="70%" y1="0" x2="80%" y2="100%" stroke="url(#line-gradient)" strokeWidth="1" />
      </svg>
    </div>
  );
};