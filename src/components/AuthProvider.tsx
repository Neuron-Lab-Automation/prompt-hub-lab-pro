import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { useSupabase } from '../hooks/useSupabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSupabase();

  const signOut = async () => {
    // Force reload to clear all state and show landing
    window.location.reload();
    // await supabase.auth.signOut();
  };

  const userWithRole = user ? {
    ...user,
    user_metadata: {
      ...user.user_metadata,
      role: 'superadmin' // Set as admin for demo
    }
  } : null;

  return (
    <AuthContext.Provider value={{ user: userWithRole, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}