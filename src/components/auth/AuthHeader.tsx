
import React from 'react';
import { Leaf } from 'lucide-react';

interface AuthHeaderProps {
  isLogin: boolean;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({ isLogin }) => {
  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="flex items-center justify-center p-3 rounded-full bg-primary/20 backdrop-blur-sm">
        <Leaf className="h-8 w-8 text-primary" />
      </div>
      <h1 className="text-2xl font-semibold text-foreground">MealScanner</h1>
      <h2 className="text-xl font-medium text-primary mt-2">
        {isLogin ? 'Sign In' : 'Sign Up'}
      </h2>
      <p className="text-muted-foreground text-center">
        {isLogin ? 'Sign in to your account' : 'Create a new account'}
      </p>
    </div>
  );
};

export default AuthHeader;
