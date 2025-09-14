import { useAuth0 } from '@auth0/auth0-react';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, User } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AuthButtons() {
  const { 
    loginWithRedirect, 
    logout, 
    isAuthenticated, 
    isLoading, 
    user,
    error
  } = useAuth0();

  const [showFallback, setShowFallback] = useState(false);

  // Debug logging
  console.log('Auth0 state:', { isAuthenticated, isLoading, user, error });

  // Fallback if loading takes too long
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setShowFallback(true);
      }, 5000); // 5 second timeout
      
      return () => clearTimeout(timer);
    } else {
      setShowFallback(false);
    }
  }, [isLoading]);

  if (error) {
    console.error('Auth0 error:', error);
    return (
      <Button variant="outline" disabled>
        <User className="w-4 h-4 mr-2" />
        Auth Error
      </Button>
    );
  }

  if (isLoading && !showFallback) {
    return (
      <Button variant="outline" disabled>
        <User className="w-4 h-4 mr-2" />
        Loading...
      </Button>
    );
  }

  // Fallback if Auth0 is taking too long
  if (showFallback) {
    return (
      <Button 
        onClick={() => loginWithRedirect()}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        <LogIn className="w-4 h-4 mr-2" />
        Login (Fallback)
      </Button>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          Welcome, {user?.name || user?.email}
        </span>
        <Button 
          variant="outline" 
          onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    );
  }

  return (
    <Button 
      onClick={() => loginWithRedirect()}
      className="bg-blue-600 hover:bg-blue-700 text-white"
    >
      <LogIn className="w-4 h-4 mr-2" />
      Login
    </Button>
  );
}
