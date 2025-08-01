import React from 'react';
import { motion } from 'framer-motion';
import { Menu, X, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAppStore } from '@/lib/store';
import { useAuth } from '@/lib/auth';
import { Link, useLocation } from 'react-router-dom';

interface NavbarProps {
  transparent?: boolean;
}

export function Navbar({ transparent = false }: NavbarProps) {
  const { sidebarCollapsed, setSidebarCollapsed } = useAppStore();
  const { user, logout } = useAuth();
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';

  const navVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1
    }
  };

  return (
    <motion.nav
      variants={navVariants}
      initial="hidden"
      animate="visible"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        transparent 
          ? 'bg-transparent backdrop-blur-xl' 
          : 'bg-background/80 backdrop-blur-xl border-b border-border/50'
      }`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center"
            >
              <span className="text-white font-bold text-lg">C</span>
            </motion.div>
            <span className="text-xl font-semibold text-gradient">CollabHub</span>
          </Link>

          {/* Center Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </Link>
            <Link 
              to="/dashboard" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
            <Link 
              to="/features" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link 
              to="/pricing" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {isDashboard && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="md:hidden"
              >
                {sidebarCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
              </Button>
            )}
            
            <ThemeToggle />
            
            <div className="hidden md:flex items-center space-x-3">
              {user ? (
                <>
                  <div className="flex items-center space-x-2 text-sm">
                    <User className="h-4 w-4" />
                    <span>{user.name}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={logout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/signin">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm" className="btn-primary">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}