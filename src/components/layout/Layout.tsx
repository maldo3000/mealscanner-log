
import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Camera, BookOpen, Home, Leaf, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/auth";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { signOut, user, isAdmin, checkUserRole } = useAuth();
  const isMobile = useIsMobile();

  // For debugging
  useEffect(() => {
    console.log("Layout rendering - isAdmin:", isAdmin);
    console.log("Current user:", user?.email);
    
    // Force a role check when the layout mounts or user changes
    if (user) {
      console.log("Checking admin role from Layout component");
      checkUserRole();
    }
  }, [isAdmin, user, checkUserRole]);

  // Enable scrolling on iOS devices
  useEffect(() => {
    // Prevent only horizontal scrolling and allow vertical scrolling
    const handleTouchMove = (e: TouchEvent) => {
      // Don't prevent default - this allows scrolling
      return true;
    };
    
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    
    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  const navItems = [
    {
      path: "/home",
      label: "Home",
      icon: <Home className="w-6 h-6" />
    },
    {
      path: "/capture",
      label: "Capture",
      icon: <Camera className="w-6 h-6" />
    },
    {
      path: "/journal",
      label: "Journal",
      icon: <BookOpen className="w-6 h-6" />
    }
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleSignOut = () => {
    signOut();
  };

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between py-0 px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Link to="/home" className="flex items-center gap-2">
              <Leaf className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg md:text-xl">MealScanner</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-3 md:gap-4">
            {isAdmin && (
              <Link 
                to="/admin" 
                className="flex items-center text-primary hover:text-primary/90 font-medium"
                data-testid="admin-link"
              >
                <ShieldCheck className="h-5 w-5 mr-1" />
                <span className={isMobile ? "text-sm" : ""}>Admin</span>
              </Link>
            )}
            
            {user && (
              <button 
                onClick={handleSignOut} 
                className="flex items-center text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4 mr-1" />
                <span className="text-sm">Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-grow pb-20 overflow-y-auto -webkit-overflow-scrolling-touch">
        <div className="max-w-5xl mx-auto px-4 pt-4 pb-24 sm:px-6">
          {children}
        </div>
      </main>
      
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-around items-center h-16">
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
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Layout;
