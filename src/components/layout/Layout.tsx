
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Camera, BookOpen, Home } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Home", icon: <Home className="w-6 h-6" /> },
    { path: "/capture", label: "Capture", icon: <Camera className="w-6 h-6" /> },
    { path: "/journal", label: "Journal", icon: <BookOpen className="w-6 h-6" /> },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow pb-20">
        <div className="max-w-5xl mx-auto px-4 pt-6 pb-24 sm:px-6">
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
