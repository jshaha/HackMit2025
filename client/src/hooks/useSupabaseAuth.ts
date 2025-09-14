import { useState, useEffect } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        setError(error);
      } else {
        setSession(session);
        setUser(session?.user ?? null);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    console.log('📝 Signing up user:', { email });
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    console.log('📝 Sign up result:', { data, error });
    
    if (error) {
      console.error('❌ Sign up error:', error);
      setError(error);
    } else {
      console.log('✅ Sign up successful');
    }
    
    setLoading(false);
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    console.log('🔑 Signing in user:', { email });
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    console.log('🔑 Sign in result:', { data, error });
    
    if (error) {
      console.error('❌ Sign in error:', error);
      setError(error);
    } else {
      console.log('✅ Sign in successful');
    }
    
    setLoading(false);
    return { data, error };
  };

  const signOut = async () => {
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      setError(error);
    }
    
    setLoading(false);
    return { error };
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    
    if (error) {
      setError(error);
    }
    
    setLoading(false);
    return { data, error };
  };

  return {
    user,
    session,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
    isAuthenticated: !!user,
  };
}
