
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Camera, BookOpen, Home, Leaf, LogOut, ShieldCheck, User } from "lucide-react";
import { useAuth } from "@/context/auth";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { signOut, user, isAdmin, checkUserRole } = useAuth();
  const isMobile = useIsMobile();

  useEffect(() => {
    // Force a role check when the layout mounts or user changes
    if (user) {
      checkUserRole();
    }
    
    // Fix viewport height for mobile browsers
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setVh();
    window.addEventListener('resize', setVh);
    return () => window.removeEventListener('resize', setVh);
  }, [user, checkUserRole]);

  const navItems = [
    {
      path: "/home",
      label: "Home",
      icon: <Home className="w-5 h-5 sm:w-6 sm:h-6" />
    },
    {
      path: "/capture",
      label: "Capture",
      icon: <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
    },
    {
      path: "/journal",
      label: "Journal",
      icon: <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
    }
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container flex h-14 sm:h-16 items-center justify-between py-0 px-3 sm:px-4 md:px-6">
          <div className="flex items-center gap-1 sm:gap-2">
            <Link to="/home" className="flex items-center gap-1 sm:gap-2">
              <Leaf className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              <span className="font-bold text-base sm:text-lg md:text-xl">MealScanner</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            {isAdmin && (
              <Link 
                to="/admin" 
                className="flex items-center text-primary hover:text-primary/90 font-medium"
                data-testid="admin-link"
              >
                <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
                <span className="text-xs sm:text-sm">Admin</span>
              </Link>
            )}
            
            {isMobile ? (
              /* Mobile profile dropdown */
              user && (
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center justify-center h-8 w-8 rounded-full bg-muted/50 hover:bg-muted transition-colors">
                    <User className="h-4 w-4 text-foreground" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center cursor-pointer">
                        <User className="h-4 w-4 mr-2" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={signOut}
                      className="flex items-center cursor-pointer text-destructive focus:text-destructive"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            ) : (
              /* Desktop layout - keep original buttons */
              <>
                <Link 
                  to="/profile" 
                  className="flex items-center text-muted-foreground hover:text-foreground"
                >
                  <User className="h-4 w-4 mr-1" />
                  <span className="text-xs sm:text-sm">Profile</span>
                </Link>
                
                {user && (
                  <button 
                    onClick={signOut} 
                    className="flex items-center text-muted-foreground hover:text-foreground"
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    <span className="text-xs sm:text-sm">Sign Out</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-grow pb-16 sm:pb-20 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 pt-3 sm:pt-4 pb-20 sm:pb-24">
          {children}
        </div>
      </main>
      
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-around items-center h-14 sm:h-16">
            {navItems.map(item => (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`flex flex-col items-center justify-center w-full h-full transition-all duration-200 ${
                  isActive(item.path) ? "text-primary" : "text-muted-foreground hover:text-primary"
                }`}
              >
                <div>
                  {item.icon}
                </div>
                <span className="text-[10px] sm:text-xs mt-1">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Layout;
