import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/ui/theme-provider';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative w-20 h-10 bg-gradient-to-r from-muted to-muted/80 border border-border/50 rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 shadow-lg hover:shadow-xl transition-all duration-300"
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
    >
      {/* Animated background */}
      <motion.div
        className="absolute inset-1 rounded-full overflow-hidden"
        animate={{
          background: isDark 
            ? 'linear-gradient(135deg, hsl(220 25% 10%) 0%, hsl(220 30% 5%) 100%)' 
            : 'linear-gradient(135deg, hsl(45 100% 70%) 0%, hsl(35 100% 60%) 100%)'
        }}
        transition={{ 
          type: "spring",
          stiffness: 300,
          damping: 30,
          duration: 0.5 
        }}
      >
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: isDark
              ? 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)'
              : 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
            x: isDark ? ['-100%', '200%'] : ['-100%', '200%']
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut"
          }}
        />
      </motion.div>
      
      {/* Toggle switch */}
      <motion.div
        className="relative w-8 h-8 bg-background rounded-full shadow-xl flex items-center justify-center border border-border/20"
        animate={{
          x: isDark ? 32 : 0,
          rotate: isDark ? 360 : 0
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25,
          duration: 0.6
        }}
      >
        {/* Light mode icon */}
        <motion.div
          className="absolute"
          animate={{
            opacity: isDark ? 0 : 1,
            rotate: isDark ? 180 : 0,
            scale: isDark ? 0.3 : 1
          }}
          transition={{ 
            duration: 0.3,
            ease: "easeInOut"
          }}
        >
          <Sun className="w-4 h-4 text-amber-500" />
        </motion.div>
        
        {/* Dark mode icon */}
        <motion.div
          className="absolute"
          animate={{
            opacity: isDark ? 1 : 0,
            rotate: isDark ? 0 : -180,
            scale: isDark ? 1 : 0.3
          }}
          transition={{ 
            duration: 0.3,
            ease: "easeInOut"
          }}
        >
          <Moon className="w-4 h-4 text-blue-400" />
        </motion.div>
      </motion.div>
      
      {/* Floating stars for dark mode */}
      {isDark && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-200 rounded-full"
              style={{
                left: `${15 + i * 12}%`,
                top: `${25 + (i % 2) * 50}%`
              }}
              animate={{
                opacity: [0.2, 1, 0.2],
                scale: [0.3, 1, 0.3],
                y: [0, -4, 0]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: i * 0.4,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>
      )}
      
      {/* Sun rays for light mode */}
      {!isDark && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-0.5 h-2 bg-amber-300/50 rounded-full"
              style={{
                left: '50%',
                top: '50%',
                transformOrigin: '50% 20px',
                transform: `rotate(${i * 45}deg) translateX(-50%)`
              }}
              animate={{
                scale: [0.5, 1, 0.5],
                opacity: [0.3, 0.8, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>
      )}
    </motion.button>
  );
}