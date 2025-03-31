
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type User = {
  id: string;
  email: string;
  username?: string;
  created_at?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  getUser: () => Promise<User | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const getUser = async (): Promise<User | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        return { ...profile, id: user.id, email: user.email || '' };
      }
    } catch (error) {
      console.error('Error getting user:', error);
    }
    return null;
  };

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      try {
        // First check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const userData = await getUser();
          setUser(userData);
        }
      } catch (error) {
        console.error('Error in auth init:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        // Use setTimeout to avoid potential deadlocks with Supabase client
        setTimeout(async () => {
          const user = await getUser();
          setUser(user);
        }, 0);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      // Sign up the user
      const { data: { user: authUser }, error: signUpError } = 
        await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              username: username
            }
          }
        });
      
      if (signUpError || !authUser) {
        throw signUpError || new Error('Failed to create user');
      }
      
      toast({
        title: "Account created!",
        description: "You've successfully signed up.",
      });
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message || "Something went wrong during sign up.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You've successfully signed out.",
      });
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message || "Something went wrong while signing out.",
        variant: "destructive",
      });
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    getUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
