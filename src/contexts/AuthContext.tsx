import React, { createContext, useContext, useEffect, useState } from 'react';

interface Profile {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'superadmin';
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: { id: string; email: string } | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo purposes
const mockUsers = [
  {
    id: '1',
    email: 'admin@fairsplit.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    email: 'user@fairsplit.com',
    password: 'user123',
    name: 'Regular User',
    role: 'user' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('fairsplit_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      
      // Get profile from mock users
      const userProfile = mockUsers.find(u => u.id === userData.id);
      if (userProfile) {
        const { password, ...profileData } = userProfile;
        setProfile(profileData);
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    const mockUser = mockUsers.find(u => u.email === email && u.password === password);
    
    if (!mockUser) {
      return { error: { message: 'Invalid email or password' } };
    }

    const userData = { id: mockUser.id, email: mockUser.email };
    const { password: _, ...profileData } = mockUser;
    
    setUser(userData);
    setProfile(profileData);
    localStorage.setItem('fairsplit_user', JSON.stringify(userData));
    
    return { error: null };
  };

  const signUp = async (email: string, password: string, name: string) => {
    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === email);
    if (existingUser) {
      return { error: { message: 'User already exists' } };
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      email,
      password,
      name,
      role: 'user' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    mockUsers.push(newUser);
    
    const userData = { id: newUser.id, email: newUser.email };
    const { password: _, ...profileData } = newUser;
    
    setUser(userData);
    setProfile(profileData);
    localStorage.setItem('fairsplit_user', JSON.stringify(userData));
    
    return { error: null };
  };

  const signOut = async () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem('fairsplit_user');
  };

  const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin';

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
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