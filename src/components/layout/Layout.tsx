
import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Camera, BookOpen, Home, Leaf, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { signOut } = useAuth();

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
    { path: "/", label: "Home", icon: <Home className="w-6 h-6" /> },
    { path: "/capture", label: "Capture", icon: <Camera className="w-6 h-6" /> },
    { path: "/journal", label: "Journal", icon: <BookOpen className="w-6 h-6" /> },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto">
      <header className="border-b border-border sticky top-0 z-50 bg-background/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold flex items-center">
              <Leaf className="h-5 w-5 text-primary mr-1.5" />
              alimento
            </Link>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={signOut} 
            className="text-muted-foreground"
          >
            <LogOut className="w-4 h-4 mr-1" />
            Sign out
          </Button>
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
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center w-full h-full transition-all duration-200 ${
                  isActive(item.path)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                <div className="relative">
                  {item.icon}
                  {isActive(item.path) && (
                    <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                  )}
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
