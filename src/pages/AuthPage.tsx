
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Navigate } from 'react-router-dom';
import LoadingSpinner from '@/components/LoadingSpinner';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, signUp, loading, isAuthenticated } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      await signIn(email, password);
    } else {
      await signUp(email, password);
    }
  };

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-background">
      <div className="w-full max-w-md glass-card p-8 rounded-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center p-3 rounded-full bg-primary/10 mb-4">
            <Leaf className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold">NutriJournal</h1>
          <p className="text-muted-foreground mt-2 text-center">
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <Button 
            type="submit" 
            className="w-full mt-6" 
            disabled={loading}
          >
            {loading ? (
              <LoadingSpinner size="small" className="mr-2" />
            ) : null}
            {isLogin ? 'Sign In' : 'Sign Up'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            className="text-primary hover:underline text-sm"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
